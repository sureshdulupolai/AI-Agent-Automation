import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
  res.json({
    success: true,
    has_google_client_id: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim().length > 5),
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
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.trim().length < 5) {
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

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

  res.json({ success: true, configured: true, authUrl });
};

/**
 * Handles Real Google OAuth Callback
 */
export const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`http://localhost:3000/integrations?error=${encodeURIComponent(error || 'Google auth was cancelled')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
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

    // 3. Mark Google as Connected in integrations.json
    markIntegrationConnected('google', userEmail);

    return res.redirect(`http://localhost:3000/integrations?google_connected=true&email=${encodeURIComponent(userEmail)}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.redirect(`http://localhost:3000/integrations?error=${encodeURIComponent(err.message)}`);
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
    return res.redirect(`http://localhost:3000/integrations?error=${encodeURIComponent(error || 'Instagram auth was cancelled')}`);
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

    return res.redirect(`http://localhost:3000/integrations?instagram_connected=true&handle=${encodeURIComponent(igHandle)}`);
  } catch (err) {
    console.error('Instagram OAuth callback error:', err);
    return res.redirect(`http://localhost:3000/integrations?error=${encodeURIComponent(err.message)}`);
  }
};
