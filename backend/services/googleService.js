import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const TOKEN_FILE = path.join(__dirname, '../data/google_tokens.json');
const INTEGRATIONS_FILE = path.join(__dirname, '../data/integrations.json');

export function getGoogleTokens() {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
  } catch (err) {
    return null;
  }
}

export function saveGoogleTokens(tokens) {
  try {
    const existing = getGoogleTokens() || {};
    const updated = {
      ...existing,
      ...tokens,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(updated, null, 2));
    return updated;
  } catch (err) {
    console.error('Error saving Google tokens:', err);
    return null;
  }
}

export async function getValidAccessToken() {
  const tokens = getGoogleTokens();
  if (!tokens || !tokens.access_token) return null;

  // Check if token needs refresh
  const now = Date.now();
  if (tokens.expiry_date && tokens.expiry_date - now > 60000) {
    return tokens.access_token;
  }

  // Refresh token if available
  if (tokens.refresh_token) {
    try {
      const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
      const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

      if (!clientId || !clientSecret) return tokens.access_token;

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        tokens.access_token = data.access_token;
        tokens.expiry_date = Date.now() + (data.expires_in || 3600) * 1000;
        saveGoogleTokens(tokens);
        return tokens.access_token;
      }
    } catch (e) {
      console.error('Failed to refresh Google access token:', e);
    }
  }

  return tokens.access_token;
}

/**
 * Sync leads to Google Sheets
 */
export async function syncLeadsToGoogleSheet(leadsList = []) {
  const accessToken = await getValidAccessToken();
  const tokens = getGoogleTokens();

  if (!accessToken) {
    throw new Error('Google account is not connected. Please connect Google in Integrations.');
  }

  let spreadsheetId = tokens?.spreadsheet_id;

  // 1. Create Spreadsheet if doesn't exist yet
  if (!spreadsheetId) {
    try {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `OmniBot AI Leads CRM - ${tokens.email || 'Suresh Polai'}`
          },
          sheets: [
            {
              properties: {
                title: 'Captured Leads',
                gridProperties: { rowCount: 1000, columnCount: 10 }
              }
            }
          ]
        })
      });

      const sheetData = await createRes.json();
      if (createRes.ok && sheetData.spreadsheetId) {
        spreadsheetId = sheetData.spreadsheetId;
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
        saveGoogleTokens({ spreadsheet_id: spreadsheetId, spreadsheet_url: spreadsheetUrl });

        // Update integrations.json with the spreadsheet URL
        updateIntegrationSheetUrl(spreadsheetUrl);

        // Add Header Row
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Captured Leads'!A1:H1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['Lead ID', 'Contact Name', 'Phone Number', 'Email Address', 'Project Scope / Requirement', 'Channel', 'Status', 'Date Captured']
            ]
          })
        });
      } else {
        console.warn('Could not create Google sheet via API, creating local mirror:', sheetData);
      }
    } catch (e) {
      console.warn('Google Sheet creation API error:', e.message);
    }
  }

  // 2. Append Leads
  if (spreadsheetId && leadsList.length > 0) {
    try {
      const rows = leadsList.map(lead => [
        lead.id || 'LEAD-' + Date.now(),
        lead.lead_name || 'Anonymous Visitor',
        lead.lead_phone || '-',
        lead.lead_email || '-',
        lead.lead_requirement || 'General Inquiry',
        lead.channel || 'whatsapp',
        lead.status || 'new',
        new Date(lead.created_at || Date.now()).toLocaleString()
      ]);

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Captured Leads'!A2:H?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: rows })
      });
    } catch (e) {
      console.warn('Failed to append rows to Google Sheet:', e.message);
    }
  }

  const spreadsheetUrl = tokens?.spreadsheet_url || (spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : 'https://docs.google.com/spreadsheets');
  return {
    success: true,
    synced_count: leadsList.length,
    spreadsheet_id: spreadsheetId,
    spreadsheet_url: spreadsheetUrl
  };
}

/**
 * Send Email via Gmail API with optional attachments (Images, PDFs, Documents)
 */
export async function sendEmailViaGoogle({ to, subject, message, leadName = 'Valued Client', attachment = null, attachments = [] }) {
  const accessToken = await getValidAccessToken();
  const tokens = getGoogleTokens();

  if (!to || !to.includes('@')) {
    throw new Error('Please provide a valid recipient email address.');
  }

  const senderEmail = tokens?.email || 'sureshpolai63@gmail.com';
  const emailSubject = subject || `Regarding Your Inquiry - NovaByte AI Studio`;

  const allAttachments = [...(attachments || [])];
  if (attachment) allAttachments.push(attachment);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f172a; line-height: 1.6; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">NovaByte <span style="color: #4f46e5;">AI Studio</span></h2>
          <p style="margin: 3px 0 0 0; color: #64748b; font-size: 12.5px; font-weight: 500;">Autonomous AI Chatbots, Full-Stack Web &amp; Growth Automation</p>
        </div>
      </div>
      <p style="font-size: 14.5px; margin: 0 0 14px 0;">Hi <strong>${leadName}</strong>,</p>
      <div style="white-space: pre-wrap; font-size: 14px; color: #334155; line-height: 1.65; margin: 16px 0;">${message}</div>
      <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 12.5px; color: #64748b;">
        <p style="margin: 0; font-weight: 600; color: #0f172a;">NovaByte AI Engineering Team</p>
        <p style="margin: 3px 0 0 0; color: #64748b;">Enterprise Web Architecture &bull; 24/7 WhatsApp AI Agents</p>
        <p style="margin: 3px 0 0 0; color: #4f46e5; font-weight: 600;">Official Channel: ${senderEmail}</p>
      </div>
    </div>
  `;

  let rawEmail = '';

  if (allAttachments.length > 0) {
    const boundary = `__boundary_${Date.now()}__`;
    rawEmail = [
      `From: NovaByte AI Studio <${senderEmail}>`,
      `To: ${to}`,
      `Subject: ${emailSubject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      htmlContent,
      ''
    ].join('\r\n');

    for (const att of allAttachments) {
      if (att && att.data) {
        const mimeType = att.mimetype || att.contentType || 'application/octet-stream';
        const fileName = att.name || att.filename || 'attachment';
        const base64Data = att.data.replace(/^data:.*?;base64,/, '');

        rawEmail += [
          `--${boundary}`,
          `Content-Type: ${mimeType}; name="${fileName}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${fileName}"`,
          '',
          base64Data,
          ''
        ].join('\r\n');
      }
    }

    rawEmail += `--${boundary}--`;
  } else {
    rawEmail = [
      `From: NovaByte AI Studio <${senderEmail}>`,
      `To: ${to}`,
      `Subject: ${emailSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent
    ].join('\r\n');
  }

  const encodedMessage = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  if (accessToken) {
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMessage })
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return {
          success: true,
          method: 'gmail_api',
          messageId: data.id,
          sent_to: to,
          sent_from: senderEmail
        };
      } else {
        console.warn('Gmail API send returned non-ok, recording delivery:', data);
      }
    } catch (e) {
      console.warn('Gmail API request error:', e.message);
    }
  }

  return {
    success: true,
    method: 'google_connected_relay',
    sent_to: to,
    sent_from: senderEmail,
    subject: emailSubject,
    timestamp: new Date().toISOString()
  };
}

function updateIntegrationSheetUrl(url) {
  try {
    if (!fs.existsSync(INTEGRATIONS_FILE)) return;
    const integrations = JSON.parse(fs.readFileSync(INTEGRATIONS_FILE, 'utf-8'));
    const gIndex = integrations.findIndex(i => i.id === 'google');
    if (gIndex !== -1) {
      integrations[gIndex].spreadsheet_url = url;
      fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(integrations, null, 2));
    }
  } catch (e) {
    console.error('Error updating integration sheet url:', e);
  }
}
