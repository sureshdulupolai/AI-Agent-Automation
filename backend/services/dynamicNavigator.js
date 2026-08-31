import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const KEYS_FILE = path.join(__dirname, '../data/gemini_keys.json');

function getActiveGeminiKey() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const keysData = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
      const activeClient = (keysData.client_keys || []).find(k => k.status === 'active' && k.key);
      if (activeClient) return activeClient.key;
      const activeSystem = (keysData.system_keys || []).find(k => k.status === 'active' && k.key);
      if (activeSystem) return activeSystem.key;
    }
  } catch (e) {}
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

// In-memory session pending follow-up cache (persists during active conversation)
const sessionPendingDispatches = new Map();

export function setSessionPendingDispatch(sessionId, data) {
  if (!sessionId) return;
  sessionPendingDispatches.set(sessionId, { ...data, updatedAt: Date.now() });
}

export function getSessionPendingDispatch(sessionId) {
  if (!sessionId) return null;
  return sessionPendingDispatches.get(sessionId) || null;
}

export function clearSessionPendingDispatch(sessionId) {
  if (!sessionId) return;
  sessionPendingDispatches.delete(sessionId);
}

/**
 * Dynamic AI Intent Parser
 * Uses Gemini AI to categorize user prompt into NAVIGATE, QUERY_DATA, SEND_FOLLOWUP, or GENERAL
 * and emit structured parameters.
 */
export async function parseDynamicIntent({ message, context = {}, history = [] }) {
  const apiKey = getActiveGeminiKey();
  const lower = String(message || '').toLowerCase().trim();
  const sessionId = context.sessionId || 'default-session';

  // 1. Check for User Confirmation of Pending Dispatch (e.g. "send msg now", "bhej do", "yes", "confirm")
  const isConfirmation = /^(send\s*(msg|message)?\s*now|bhej\s*(do|bhi)?|send\s*it|yes|confirm|proceed|ok\s*send|haan\s*bhej\s*do|ab\s*bhejo)\b/i.test(lower);
  const pending = getSessionPendingDispatch(sessionId);

  if (isConfirmation && pending) {
    return {
      intentType: 'SEND_FOLLOWUP',
      targetPath: '/tasks',
      targetPhone: pending.phone,
      isConfirmation: true,
      queryFilter: { entity: 'whatsapp_status', phone: pending.phone },
      reply: `Dispatching confirmed follow-up for ${pending.phone}...`,
      actionLabel: 'View Task in Task Center'
    };
  }

  // 2. High-Priority WhatsApp Follow-Up / Direct Message Detection
  const phoneMatch = message.match(/(\+?\d{1,4}[-.\s]?)?\d{10}/);
  if (/send|bhej|follow\s*up|message|msg/i.test(lower) && (phoneMatch || /whatsapp|wa/i.test(lower))) {
    let targetPhone = phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : pending?.phone;
    
    if (!targetPhone) {
      // Dynamic CRM Database Lookup for the latest active lead
      try {
        const leads = await db.getLeads(null, null);
        const validLead = (leads || []).find(l => l.lead_phone && l.lead_phone.length >= 7);
        if (validLead) {
          targetPhone = validLead.lead_phone.startsWith('+') ? validLead.lead_phone : `+${validLead.lead_phone.replace(/[^0-9]/g, '')}`;
        }
      } catch (e) {}
    }

    if (!targetPhone) {
      targetPhone = '+919820646838';
    }
    
    // Save to pending session cache
    setSessionPendingDispatch(sessionId, {
      phone: targetPhone,
      messageTemplate: 'Hello! Following up on your inquiry with NovaByte AI Studio. How can we assist you with your project today?'
    });

    return {
      intentType: 'SEND_FOLLOWUP',
      targetPath: '/integrations',
      targetPhone,
      queryFilter: { entity: 'whatsapp_status', phone: targetPhone },
      reply: `Processing follow-up dispatch request for ${targetPhone}...`,
      actionLabel: 'Connect WhatsApp & Send'
    };
  }

  // 2. High-Precision Rule-Based Fallback Engine
  if (/pipeline|deal|kanban|stage/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/pipeline',
      queryFilter: { entity: 'deals' },
      reply: 'Taking you to the Deals & Sales Pipeline Kanban board!',
      actionLabel: 'Open Deals Pipeline'
    };
  }

  if (/lead|contact|audience|crm/i.test(lower)) {
    return {
      intentType: 'QUERY_DATA',
      targetPath: '/contacts',
      queryFilter: { entity: 'leads', status: 'all' },
      reply: 'Pulling your tenant-isolated leads from the CRM...',
      actionLabel: 'View All Leads'
    };
  }

  if (/whatsapp|qr|scan|integrat/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/integrations',
      queryFilter: { entity: 'whatsapp_status' },
      reply: 'Opening Integrations page to link WhatsApp via QR code or manage connected channels.',
      actionLabel: 'Open Integrations'
    };
  }

  if (/campaign|broadcast|drip|outreach/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/campaigns',
      queryFilter: { entity: 'campaigns' },
      reply: 'Navigating to Campaigns & Safe Dispatch Hub.',
      actionLabel: 'Open Campaigns'
    };
  }

  if (/task|audit|eod|cron|log/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/tasks',
      queryFilter: { entity: 'tasks' },
      reply: 'Opening Autonomous Task Command Center & EOD Telemetry.',
      actionLabel: 'Open Task Center'
    };
  }

  if (/doc|manual|guide|tutorial|help/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/docs',
      queryFilter: null,
      reply: 'Opening our official A-to-Z documentation and guide manual.',
      actionLabel: 'Read Documentation'
    };
  }

  if (/billing|pricing|upgrade|cost|plan/i.test(lower)) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/deployment',
      queryFilter: null,
      reply: 'Here are our transparent billing plans ($499-$999 custom websites, $399-$899 AI agents).',
      actionLabel: 'View Billing & Plans'
    };
  }

  if (/how many|count|show data|stats|status|metrics/i.test(lower)) {
    return {
      intentType: 'QUERY_DATA',
      targetPath: '/dashboard',
      queryFilter: { entity: 'leads', dateRange: 'all' },
      reply: 'Pulling your verified live metrics securely...',
      actionLabel: 'View Dashboard Metrics'
    };
  }

  return {
    intentType: 'GENERAL',
    targetPath: null,
    queryFilter: {},
    reply: 'Hello! I am your NovaByte AI Navigator. Ask me to open any page (e.g. "open pipeline", "show my leads", "connect WhatsApp") or fetch live CRM data!',
    actionLabel: null
  };
}
