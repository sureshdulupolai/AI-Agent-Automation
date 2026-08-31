import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WHITELIST_FILE = path.join(__dirname, '../data/whatsapp_group_whitelist.json');

const DEFAULT_SETTINGS = {
  block_all_unapproved_groups: true,  // Strictly block @g.us group messages unless approved
  whitelist_only_mode: false,         // When true, only replies to registered client list
  approved_groups: [],
  approved_contacts: []
};

/**
 * Read Whitelist Configuration & Dynamically Merge Real Database Leads
 */
export async function getWhitelistSettings() {
  try {
    let settings = DEFAULT_SETTINGS;
    if (fs.existsSync(WHITELIST_FILE)) {
      settings = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf-8'));
    }

    // Dynamic Synchronization with real database leads
    const realLeads = await db.getLeads(null, null);
    const existingPhones = new Set((settings.approved_contacts || []).map(c => String(c.phone).replace(/[^0-9]/g, '')));

    const dynamicContacts = [...(settings.approved_contacts || [])];
    for (const lead of (realLeads || [])) {
      if (lead.lead_phone) {
        const cleanP = String(lead.lead_phone).replace(/[^0-9]/g, '');
        if (cleanP.length >= 7 && !existingPhones.has(cleanP)) {
          existingPhones.add(cleanP);
          dynamicContacts.push({
            id: `lead-${lead.id || cleanP}`,
            phone: lead.lead_phone.startsWith('+') ? lead.lead_phone : `+${cleanP}`,
            client_name: lead.lead_name || 'Client Lead',
            company: lead.lead_requirement || lead.channel || 'CRM Inbound',
            enabled: true,
            source: 'crm_database',
            added_at: lead.created_at || new Date().toISOString()
          });
        }
      }
    }

    return {
      ...settings,
      approved_groups: settings.approved_groups || [],
      approved_contacts: dynamicContacts
    };
  } catch (err) {
    console.error('Error reading whatsapp_group_whitelist.json:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save Whitelist Configuration
 */
export function saveWhitelistSettings(settings) {
  try {
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving whatsapp_group_whitelist.json:', err);
    return false;
  }
}

/**
 * Validate whether incoming JID / Phone is permitted to receive automated replies
 */
export async function isWhatsAppTargetAllowed({ senderJid, senderPhone, messageText }) {
  const config = await getWhitelistSettings();
  const isGroup = senderJid && senderJid.endsWith('@g.us');

  // 1. Group Message Security Gate
  if (isGroup) {
    if (config.block_all_unapproved_groups) {
      const isApprovedGroup = (config.approved_groups || []).some(
        g => g.enabled && (g.jid === senderJid || senderJid.includes(g.jid.replace('@g.us', '')))
      );
      if (!isApprovedGroup) {
        return {
          allowed: false,
          reason: 'GROUP_UNAPPROVED',
          message: `Group message from ${senderJid} blocked because group whitelist is enforced.`
        };
      }
    }
  }

  // 2. Strict Whitelist-Only Gate (For direct chats)
  if (config.whitelist_only_mode && !isGroup && senderPhone) {
    const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
    const isApprovedContact = (config.approved_contacts || []).some(c => {
      const cleanApproved = String(c.phone || '').replace(/[^0-9]/g, '');
      return c.enabled && (cleanApproved === cleanPhone || cleanPhone.includes(cleanApproved));
    });

    if (!isApprovedContact) {
      return {
        allowed: false,
        reason: 'CONTACT_NOT_IN_WHITELIST',
        message: `Direct message from ${senderPhone} skipped because strict whitelist-only mode is active.`
      };
    }
  }

  return { allowed: true };
}
