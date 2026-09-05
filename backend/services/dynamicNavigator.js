import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { generateBotReply } from './geminiService.js';

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
 * Dynamic AI Intent & Conversational Engine
 * Dispatches high-priority CRM / follow-up actions and explicit navigation,
 * while routing all conversational inquiries through the senior human consultant AI engine.
 */
export async function parseDynamicIntent({ message, context = {}, history = [] }) {
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
      reply: `Dispatching your confirmed WhatsApp follow-up to ${pending.phone}...`,
      actionLabel: 'View in Task Center'
    };
  }

  // 2. High-Priority WhatsApp Follow-Up / Direct Message Detection
  const phoneMatch = message.match(/(\+?\d{1,4}[-.\s]?)?\d{10}/);
  if (/send|bhej|follow\s*up|message|msg/i.test(lower) && (phoneMatch || /whatsapp|wa/i.test(lower))) {
    let targetPhone = phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : pending?.phone;
    
    if (!targetPhone) {
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

  // 3. Explicit Navigation Commands (Only trigger when user EXPLICITLY wants to open/visit a page)
  const isExplicitPipeline = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(pipeline|deals|kanban|sales\s*pipeline)/i.test(lower) || /^(deals\s*pipeline|pipeline\s*board|kanban\s*board)$/i.test(lower);
  if (isExplicitPipeline) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/pipeline',
      queryFilter: { entity: 'deals' },
      reply: 'Taking you directly to the Deals & Sales Pipeline Kanban board!',
      actionLabel: 'Open Deals Pipeline'
    };
  }

  const isExplicitContacts = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(contacts|leads|all\s*leads|crm\s*contacts)/i.test(lower) || /^(view\s*all\s*leads|contacts\s*page|leads\s*page)$/i.test(lower);
  if (isExplicitContacts) {
    return {
      intentType: 'QUERY_DATA',
      targetPath: '/contacts',
      queryFilter: { entity: 'leads', status: 'all' },
      reply: 'Pulling your tenant-isolated contacts and leads from the CRM...',
      actionLabel: 'View All Leads'
    };
  }

  const isExplicitIntegrations = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(integrations|integration\s*hub|channels)/i.test(lower) || /^(connect\s*whatsapp|link\s*whatsapp|pair\s*whatsapp|scan\s*qr(\s*code)?)$/i.test(lower);
  if (isExplicitIntegrations) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/integrations',
      queryFilter: { entity: 'whatsapp_status' },
      reply: 'Opening Integrations to pair WhatsApp via QR code or manage connected channels.',
      actionLabel: 'Open Integrations'
    };
  }

  const isExplicitCampaigns = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(campaigns|broadcasts|drip\s*hub)/i.test(lower) || /^(create\s*campaign|launch\s*campaign)$/i.test(lower);
  if (isExplicitCampaigns) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/campaigns',
      queryFilter: { entity: 'campaigns' },
      reply: 'Navigating to the Campaigns & Safe Dispatch Hub.',
      actionLabel: 'Open Campaigns'
    };
  }

  const isExplicitTasks = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(tasks|task\s*center|command\s*center|telemetry|audit\s*logs)/i.test(lower) || /^(task\s*command\s*center|eod\s*telemetry)$/i.test(lower);
  if (isExplicitTasks) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/tasks',
      queryFilter: { entity: 'tasks' },
      reply: 'Opening the Autonomous Task Command Center & Execution Telemetry.',
      actionLabel: 'Open Task Center'
    };
  }

  const isExplicitDocs = /^(open|go\s*to|take\s*me\s*to|view|show|read)\s+(the\s+)?(docs|documentation|manual|guide|developer\s*docs)/i.test(lower) || /^(view\s*docs|read\s*documentation|open\s*manual)$/i.test(lower);
  if (isExplicitDocs) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/docs',
      queryFilter: null,
      reply: 'Opening our official A-to-Z documentation and guide manual.',
      actionLabel: 'Read Documentation'
    };
  }

  const isExplicitBilling = /^(open|go\s*to|take\s*me\s*to|view|show)\s+(the\s+)?(billing|pricing\s*page|plans|deployment\s*plans)/i.test(lower) || /^(upgrade\s*plan|view\s*billing)$/i.test(lower);
  if (isExplicitBilling) {
    return {
      intentType: 'NAVIGATE',
      targetPath: '/deployment',
      queryFilter: null,
      reply: 'Navigating to our verified pricing and deployment tiers.',
      actionLabel: 'View Billing & Plans'
    };
  }

  const isMetricsQuery = /^(how\s*many|count|stats|metrics|summary)\s+(leads|deals|contacts|numbers)/i.test(lower) || /^(show\s*my\s*leads|show\s*stats|lead\s*count|deals\s*count)$/i.test(lower);
  if (isMetricsQuery) {
    return {
      intentType: 'QUERY_DATA',
      targetPath: '/dashboard',
      queryFilter: { entity: 'leads', dateRange: 'all' },
      reply: 'Fetching your verified live metrics securely...',
      actionLabel: 'View Dashboard Metrics'
    };
  }

  // 4. All Conversational Queries, Questions, Help & Greetings
  // Route to the Senior Human Consultant AI Engine (Gemini with contextual fallback)
  try {
    let bot = null;
    if (context.botId) {
      bot = await db.getBotById(context.botId);
    }
    if (!bot) {
      const allBots = await db.getBots();
      bot = (allBots && allBots.length > 0) ? allBots[0] : null;
    }
    if (!bot) {
      bot = {
        id: 'bot-ec0db899',
        bot_name: 'NovaByte AI Studio',
        system_instructions: 'You are the Senior Client Solutions Consultant and Technical Partner representing NovaByte AI Studio.',
        business_knowledge: 'Turnaround is 3 to 7 business days. Packages range from $499 to $999 for custom websites, and $399 to $899 for AI automation.'
      };
    }

    const aiResult = await generateBotReply({
      bot,
      userMessage: message,
      history: history || []
    });

    return {
      intentType: 'GENERAL',
      targetPath: null,
      queryFilter: {},
      reply: aiResult.reply,
      actionLabel: null,
      model: aiResult.model,
      mode: aiResult.mode
    };
  } catch (err) {
    console.error('Error generating AI reply in parseDynamicIntent:', err);
    return {
      intentType: 'GENERAL',
      targetPath: null,
      queryFilter: {},
      reply: "Hello! Great to connect with you. How can we assist you with your web development or AI automation project today?",
      actionLabel: null
    };
  }
}
