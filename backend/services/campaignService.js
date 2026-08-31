import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { safeSendMessage, getActiveBotId } from './baileysService.js';
import { sendEmailViaGoogle, getGoogleTokens } from './googleService.js';
import * as db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAMPAIGNS_FILE = path.join(__dirname, '../data/campaigns.json');

export function getCampaignsData() {
  try {
    if (!fs.existsSync(CAMPAIGNS_FILE)) {
      fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function saveCampaignsData(data) {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving campaigns data:', err);
  }
}

/**
 * Intelligent field parser for Excel / CSV data
 */
export function parseExcelOrCsvBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    return { headers: [], rows: [], total: 0 };
  }

  const headers = Object.keys(rawRows[0]);
  return { headers, rows: rawRows, total: rawRows.length };
}

/**
 * Normalize and clean phone numbers
 */
export function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim();
  // Remove spaces, dashes, brackets
  str = str.replace(/[\s\-\(\)]/g, '');
  if (str.startsWith('+')) str = str.substring(1);
  if (str.length === 10 && !str.startsWith('91')) {
    str = '91' + str; // Default to India prefix if 10-digit
  }
  return str;
}

/**
 * Replace variable placeholders e.g. {{name}}, {{phone}}, {{company}} in template with smart professional fallbacks
 */
export function renderTemplate(template, row = {}) {
  if (!template) return '';
  let result = template;

  // Extract name and check if it is a valid human name or a dummy identifier
  let rawName = String(row.name || row.Name || row.lead_name || row.client_name || '').trim();
  const isDummyName = !rawName || /^(contact|client|lead|user|visitor|person|anonymous)\s*\d*$/i.test(rawName);

  if (isDummyName) {
    // Professional natural substitution when no real name is provided
    result = result.replace(/hi\s+{{\s*name\s*}}\s*[,!:]*/gi, 'Hello there 👋,');
    result = result.replace(/hello\s+{{\s*name\s*}}\s*[,!:]*/gi, 'Hello there 👋,');
    result = result.replace(/dear\s+{{\s*name\s*}}\s*[,!:]*/gi, 'Hello,');
    result = result.replace(/{{\s*name\s*}}/gi, 'there');
  } else {
    // Formatted real name e.g. "Ashish"
    result = result.replace(/{{\s*name\s*}}/gi, rawName);
  }

  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase() !== 'name') {
      const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(pattern, String(value || ''));
    }
  }

  result = result.replace(/{{\s*phone\s*}}/gi, row.phone || row.Phone || row.mobile || row.Mobile || '');
  result = result.replace(/{{\s*email\s*}}/gi, row.email || row.Email || '');
  return result;
}

/**
 * Execute a WhatsApp or Email Campaign
 */
export async function executeCampaign(campaignId) {
  const campaigns = getCampaignsData();
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) throw new Error('Campaign not found');

  campaign.status = 'running';
  campaign.started_at = new Date().toISOString();
  saveCampaignsData(campaigns);

  const results = {
    total: campaign.recipients.length,
    sent: 0,
    failed: 0,
    logs: []
  };

  if (campaign.channel === 'whatsapp') {
    const botId = campaign.bot_id || getActiveBotId();

    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      const rawPhone = recipient.phone || recipient.Phone || recipient.mobile || recipient.Mobile;
      const phone = cleanPhoneNumber(rawPhone);
      const customMessage = recipient.message || recipient.Message || recipient.text || recipient.Text;
      const body = customMessage ? renderTemplate(customMessage, recipient) : renderTemplate(campaign.message_template, recipient);

      if (!phone || phone.length < 10) {
        results.failed++;
        results.logs.push({
          recipient: rawPhone || 'Unknown',
          status: 'failed',
          error: 'Invalid phone number',
          timestamp: new Date().toISOString()
        });
        continue;
      }

      try {
        const jid = `${phone}@s.whatsapp.net`;
        let messagePayload = { text: body };

        if (campaign.attachment && campaign.attachment.data) {
          const rawBase64 = campaign.attachment.data.replace(/^data:.*?;base64,/, '');
          const buffer = Buffer.from(rawBase64, 'base64');
          const mime = campaign.attachment.mimetype || 'image/jpeg';
          const fileName = campaign.attachment.name || 'file';

          if (mime.startsWith('image/')) {
            messagePayload = {
              image: buffer,
              caption: body,
              mimetype: mime
            };
          } else if (mime.startsWith('audio/')) {
            messagePayload = {
              audio: buffer,
              mimetype: mime,
              ptt: true
            };
          } else {
            // PDF or Document
            messagePayload = {
              document: buffer,
              mimetype: mime,
              fileName: fileName,
              caption: body
            };
          }
        }

        const sent = await safeSendMessage(botId, jid, messagePayload);
        if (sent) {
          results.sent++;
          results.logs.push({
            recipient: phone,
            name: recipient.name || recipient.Name || 'Contact',
            status: 'sent',
            has_attachment: !!campaign.attachment,
            timestamp: new Date().toISOString()
          });
        } else {
          results.failed++;
          results.logs.push({
            recipient: phone,
            status: 'failed',
            error: 'WhatsApp dispatch failed (bot socket disconnected or unverified)',
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        results.failed++;
        results.logs.push({
          recipient: phone,
          status: 'failed',
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }

      // Safe anti-spam delay between WhatsApp messages (1.5s)
      if (i < campaign.recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  } else if (campaign.channel === 'email') {
    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      const email = (recipient.email || recipient.Email || recipient.to || '').trim();
      const customSubject = recipient.subject || recipient.Subject || campaign.subject;
      const subject = renderTemplate(customSubject, recipient);
      const customMessage = recipient.message || recipient.Message || recipient.body || recipient.Body;
      const message = customMessage ? renderTemplate(customMessage, recipient) : renderTemplate(campaign.message_template, recipient);

      if (!email || !email.includes('@')) {
        results.failed++;
        results.logs.push({
          recipient: email || 'Unknown',
          status: 'failed',
          error: 'Invalid email address',
          timestamp: new Date().toISOString()
        });
        continue;
      }

      try {
        await sendEmailViaGoogle({
          to: email,
          subject: subject || 'Regarding Your Inquiry',
          message: message,
          leadName: recipient.name || recipient.Name || 'Client',
          attachment: campaign.attachment || null
        });

        results.sent++;
        results.logs.push({
          recipient: email,
          name: recipient.name || recipient.Name || 'Contact',
          status: 'sent',
          has_attachment: !!campaign.attachment,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        results.failed++;
        results.logs.push({
          recipient: email,
          status: 'failed',
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }

      // Delay between emails (1.2s)
      if (i < campaign.recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    }
  }

  // Update campaign completion
  const updatedCampaigns = getCampaignsData();
  const target = updatedCampaigns.find(c => c.id === campaignId);
  if (target) {
    target.status = 'completed';
    target.completed_at = new Date().toISOString();
    target.stats = {
      total: results.total,
      sent: results.sent,
      failed: results.failed
    };
    target.logs = results.logs;
    saveCampaignsData(updatedCampaigns);
  }

  return results;
}
