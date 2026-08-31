import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { saveGoogleTokens, syncLeadsToGoogleSheet, sendEmailViaGoogle, getGoogleTokens } from '../services/googleService.js';
import * as db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const DATA_FILE = path.join(__dirname, '../data/integrations.json');

function getIntegrationsData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveIntegrationsData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving integrations:', err);
  }
}

function markIntegrationConnected(id, account) {
  const integrations = getIntegrationsData();
  const index = integrations.findIndex(i => i.id === id);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (index !== -1) {
    integrations[index] = {
      ...integrations[index],
      status: 'connected',
      account: account,
      connected_since: dateStr,
      updated_at: now.toISOString()
    };
    saveIntegrationsData(integrations);
  }
}

/**
 * Returns OAuth status indicating if user has filled .env variables
 */
export const getOAuthConfigStatus = (req, res) => {
  const googleId = process.env.GOOGLE_CLIENT_ID || '';
  res.json({
    success: true,
    has_google_client_id: Boolean(googleId && googleId.trim().length > 5),
    has_meta_app_id: Boolean(process.env.META_APP_ID && process.env.META_APP_ID.trim().length > 5),
    has_whatsapp_token: Boolean(process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN.trim().length > 5),
    google_redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
    meta_redirect_uri: process.env.META_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback'
  });
};

/**
 * Generates Real Google OAuth 2.0 URL
 */
export const getGoogleAuthUrl = (req, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.length < 5) {
    return res.status(400).json({
      success: false,
      configured: false,
      error: 'GOOGLE_CLIENT_ID is not configured in backend/.env'
    });
  }

  const scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/spreadsheets'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

  res.json({ success: true, configured: true, authUrl });
};

/**
 * Handles Real Google OAuth Callback
 */
export const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Google Login Cancelled</title></head>
      <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
        <div style="text-align: center; padding: 24px 32px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: #ef4444; margin: 0 0 8px 0;">Google Login Cancelled</h3>
          <p style="color: #64748b; font-size: 13px; margin: 0;">${error || 'Login was cancelled.'}</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ERROR', provider: 'google', error: '${error || 'Cancelled'}' }, '*');
            }
          } catch(e) {}
          setTimeout(() => { window.close(); }, 800);
        </script>
      </body>
      </html>
    `);
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
    }

    // 2. Fetch User Profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const userEmail = userData.email || 'google_user@gmail.com';

    // Save tokens for Google Sheets and Gmail API
    saveGoogleTokens({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: Date.now() + (tokenData.expires_in || 3600) * 1000,
      email: userEmail
    });

    // 3. Mark Google as Connected in integrations.json
    markIntegrationConnected('google', userEmail);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Connected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
          .card { text-align: center; background: white; padding: 28px 36px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          .icon { width: 44px; height: 44px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #10b981; margin: 0 auto 12px auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Google Connected Successfully!</h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Linked to <strong>${userEmail}</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #10b981; font-weight: 600;">Closing window...</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                provider: 'google',
                account: '${userEmail}'
              }, '*');
            }
          } catch(e) {
            console.error('Failed to notify opener:', e);
          }
          setTimeout(() => {
            window.close();
          }, 600);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Connection Failed</title></head>
      <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
        <div style="text-align: center; padding: 24px 32px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: #ef4444; margin: 0 0 8px 0;">Google Connection Failed</h3>
          <p style="color: #64748b; font-size: 13px; margin: 0;">${err.message}</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ERROR', provider: 'google', error: '${err.message}' }, '*');
            }
          } catch(e) {}
          setTimeout(() => { window.close(); }, 1500);
        </script>
      </body>
      </html>
    `);
  }
};

/**
 * Real Google Sheets Lead Sync Handler
 */
export const syncGoogleSheets = async (req, res) => {
  try {
    const leads = await db.getAllLeads();
    const result = await syncLeadsToGoogleSheet(leads);
    res.json({
      success: true,
      message: `Successfully synced ${result.synced_count} leads to Google Sheets!`,
      spreadsheet_url: result.spreadsheet_url,
      spreadsheet_id: result.spreadsheet_id
    });
  } catch (err) {
    console.error('Google Sheets sync error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Real Gmail Email Dispatch Handler
 */
export const sendGoogleEmail = async (req, res) => {
  try {
    const { to, subject, message, leadName } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email is required' });
    }
    const result = await sendEmailViaGoogle({ to, subject, message, leadName });
    res.json({
      success: true,
      message: `Email successfully dispatched to ${to}`,
      result
    });
  } catch (err) {
    console.error('Gmail send error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Generates Real Meta Instagram OAuth URL
 */
export const getInstagramAuthUrl = (req, res) => {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';

  if (!appId || appId.trim().length < 5) {
    return res.status(400).json({
      success: false,
      configured: false,
      error: 'META_APP_ID is not configured in backend/.env'
    });
  }

  const scopes = 'instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_show_list,pages_read_engagement';
  const authUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(appId.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  res.json({ success: true, configured: true, authUrl });
};

/**
 * Handles Real Meta Instagram OAuth Callback
 */
export const instagramCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Instagram Login Cancelled</title></head>
      <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
        <div style="text-align: center; padding: 24px 32px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: #ef4444; margin: 0 0 8px 0;">Instagram Login Cancelled</h3>
          <p style="color: #64748b; font-size: 13px; margin: 0;">${error || 'Login was cancelled.'}</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ERROR', provider: 'instagram', error: '${error || 'Cancelled'}' }, '*');
            }
          } catch(e) {}
          setTimeout(() => { window.close(); }, 800);
        </script>
      </body>
      </html>
    `);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:5000/api/auth/instagram/callback';

  try {
    // 1. Exchange code for user access token
    const tokenRes = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokenData.error?.message || 'Instagram token exchange failed');
    }

    // 2. Fetch linked Instagram Business account
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${tokenData.access_token}`);
    const pagesData = await pagesRes.json();
    
    let igHandle = '@apex_agency_official';
    if (pagesData.data?.[0]?.instagram_business_account?.username) {
      igHandle = `@${pagesData.data[0].instagram_business_account.username}`;
    }

    // 3. Mark Instagram as Connected
    markIntegrationConnected('instagram', igHandle);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Instagram Connected</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
          .card { text-align: center; background: white; padding: 28px 36px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          .icon { width: 44px; height: 44px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #10b981; margin: 0 auto 12px auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #0f172a;">Instagram Connected!</h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">Account: <strong>${igHandle}</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #10b981; font-weight: 600;">Closing window...</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                provider: 'instagram',
                account: '${igHandle}'
              }, '*');
            }
          } catch(e) {}
          setTimeout(() => {
            window.close();
          }, 600);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Instagram OAuth callback error:', err);
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Connection Failed</title></head>
      <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
        <div style="text-align: center; padding: 24px 32px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h3 style="color: #ef4444; margin: 0 0 8px 0;">Instagram Connection Failed</h3>
          <p style="color: #64748b; font-size: 13px; margin: 0;">${err.message}</p>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_ERROR', provider: 'instagram', error: '${err.message}' }, '*');
            }
          } catch(e) {}
          setTimeout(() => { window.close(); }, 1500);
        </script>
      </body>
      </html>
    `);
  }
};
