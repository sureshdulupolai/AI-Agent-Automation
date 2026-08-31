import { db } from '../config/database.js';
import { generateFollowUpMessage } from './geminiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOURNEYS_FILE = path.join(__dirname, '..', 'data', 'journeys.json');
const PENDING_FILE  = path.join(__dirname, '..', 'data', 'pending_followups.json');

// In-memory active follow-up timers: sessionId -> { timeoutId, ...meta }
const activeTimers = new Map();

// ── CLOSING-PHRASE DETECTION ─────────────────────────────────────────────────
// English + Hinglish phrases that signal user is done / not interested.
const CLOSING_PATTERNS = [
  /\b(bye|goodbye|good bye|see you|talk later|ttyl|later|gtg|not interested|no thanks|no thank you|cancel|stop|unsubscribe|done|finished|all good|sorted|no need|nevermind|never mind|okay thanks|ok thanks|thanks bye|thank you bye)\b/i,
  /\b(shukriya|dhanyawad|ho gaya|hoh gaya|theek hai|thik h|thik hai|thk h|bas karo|nahi chahiye|nhi chahiye|nahi|nhi|band karo|mat bhejo|ok bhai|okk|kal baat karte|baad mein|baad me|koi zarurat nahi|zarurat nahi|mat karo)\b/i,
];

/**
 * Returns true if the message signals the user is closing the conversation.
 */
export function isConversationClosed(messageText) {
  if (!messageText || typeof messageText !== 'string') return false;
  return CLOSING_PATTERNS.some(rx => rx.test(messageText.trim()));
}

// ── PERSISTENCE ──────────────────────────────────────────────────────────────
function readPending() {
  try {
    if (!fs.existsSync(PENDING_FILE)) return [];
    return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8')) || [];
  } catch (e) { return []; }
}

function writePending(list) {
  try {
    const dir = path.dirname(PENDING_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PENDING_FILE, JSON.stringify(list, null, 2));
  } catch (e) { console.warn('[FollowUp] Persist error:', e.message); }
}

function upsertPending(entry) {
  const list = readPending().filter(p => !(p.sessionId === entry.sessionId && p.step === entry.step));
  list.push(entry);
  writePending(list);
}

function removePending(sessionId) {
  writePending(readPending().filter(p => p.sessionId !== sessionId));
}

// ── CORE SCHEDULER ───────────────────────────────────────────────────────────

/**
 * Schedule an automated follow-up message after silence.
 *
 * Bot config fields used (all optional with defaults):
 *   followup_delay_hours  — delay before Step 1 (default: 2)
 *   followup_delay_days   — delay in days before Step 1 (overrides hours if > 0)
 *   followup_step2_hours  — delay after Step 1 before Step 2 (default: same as step1)
 *   followup_max_count    — max follow-up messages per session (default: 2)
 */
export async function scheduleFollowUp({
  botId,
  sessionId,
  senderPhone,
  senderName = 'Customer',
  conversationHistory = [],
  step = 1
}) {
  // Always cancel any existing timer for this session first
  cancelFollowUp(sessionId);

  const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  let bot = null;
  try { bot = await db.getBotById(botId); } catch (e) {}

  const step1Hours = parseFloat(bot?.followup_delay_hours) || 2;
  const step1Days  = parseFloat(bot?.followup_delay_days)  || 0;
  const step2Hours = parseFloat(bot?.followup_step2_hours) || step1Hours;
  const maxSteps   = parseInt(bot?.followup_max_count) ?? 2;

  if (step > maxSteps) {
    console.log(`[FOLLOW-UP] Max steps (${maxSteps}) reached for ${cleanPhone}. Stopping.`);
    return;
  }

  let delayMs;
  if (step === 1) {
    delayMs = step1Days > 0 ? step1Days * 24 * 3600000 : step1Hours * 3600000;
  } else {
    delayMs = step2Hours * 3600000;
  }

  const fireAt = Date.now() + delayMs;

  // Persist to disk for server-restart survival
  upsertPending({ sessionId, botId, senderPhone, senderName, fireAt, step, maxSteps, scheduledAt: Date.now() });

  const delayLabel = delayMs >= 3600000
    ? `${Math.round(delayMs / 3600000)}h`
    : `${Math.round(delayMs / 60000)}m`;

  console.log(`[FOLLOW-UP SCHEDULED] Step ${step}/${maxSteps} for ${cleanPhone} in ${delayLabel} (session: ${sessionId})`);

  const timeoutId = setTimeout(() => _executeFollowUp({
    botId, sessionId, senderPhone: cleanPhone, senderName, step, maxSteps, fireAt
  }), delayMs);

  activeTimers.set(sessionId, {
    timeoutId, botId, sessionId, cleanPhone, senderName,
    scheduledAt: Date.now(), fireAt, step
  });
}

// ── EXECUTION ENGINE ─────────────────────────────────────────────────────────
async function _executeFollowUp({ botId, sessionId, senderPhone, senderName, step, maxSteps, fireAt }) {
  try {
    console.log(`[FOLLOW-UP TRIGGERED] Step ${step} for ${senderPhone} (session: ${sessionId})`);

    // Re-fetch fresh session history
    const allMsgs = await db.getAllMessages();
    const sessionMsgs = allMsgs
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const lastMsg = sessionMsgs[sessionMsgs.length - 1];
    const lastUserMsg = [...sessionMsgs].reverse().find(m => m.sender === 'user');

    // GUARD 1: User replied AFTER follow-up was scheduled → skip
    const scheduledAt = activeTimers.get(sessionId)?.scheduledAt || (fireAt - 3600000);
    if (lastMsg?.sender === 'user') {
      const repliedAt = new Date(lastMsg.created_at).getTime();
      if (repliedAt > scheduledAt) {
        console.log(`[FOLLOW-UP CANCELLED] User already replied after scheduling. Skipping.`);
        activeTimers.delete(sessionId);
        removePending(sessionId);
        return;
      }
    }

    // GUARD 2: User's last message was a closing phrase → skip entirely
    if (lastUserMsg && isConversationClosed(lastUserMsg.content)) {
      console.log(`[FOLLOW-UP SKIPPED] Conversation closed by user. No follow-up sent.`);
      activeTimers.delete(sessionId);
      removePending(sessionId);
      return;
    }

    const { getOrCreateSocket } = await import('./baileysService.js');
    const bot = await db.getBotById(botId);

    // Generate AI-powered contextual follow-up message
    const followUpText = await generateFollowUpMessage({
      bot: bot || { bot_name: 'Assistant' },
      conversationHistory: sessionMsgs
    });

    // Send via live WhatsApp socket
    try {
      const sock = await getOrCreateSocket(botId, false);
      if (sock) {
        const remoteJid = senderPhone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await sock.sendMessage(remoteJid, { text: followUpText });
        console.log(`[FOLLOW-UP SENT] Step ${step} to +${senderPhone}: "${followUpText.substring(0, 60)}..."`);
      }
    } catch (sendErr) {
      console.error(`[FOLLOW-UP SEND ERROR] +${senderPhone}:`, sendErr.message);
    }

    // Record in message history
    await db.addMessage({
      bot_id: botId,
      session_id: sessionId,
      sender: 'bot',
      content: `[Automated Follow-Up Step ${step}]\n${followUpText}`,
      channel: 'whatsapp'
    });

    // Log to journey stats
    recordJourneyRun({
      contact_name: senderName,
      contact_handle: `+${senderPhone}`,
      step: `Automated Follow-Up Step ${step} Sent`
    });

    activeTimers.delete(sessionId);
    removePending(sessionId);

    // Schedule Step 2 if not at max
    if (step < maxSteps) {
      console.log(`[FOLLOW-UP] Scheduling Step ${step + 1} for ${senderPhone}...`);
      await scheduleFollowUp({
        botId,
        sessionId,
        senderPhone: '+' + senderPhone,
        senderName,
        conversationHistory: sessionMsgs,
        step: step + 1
      });
    } else {
      console.log(`[FOLLOW-UP COMPLETE] All ${maxSteps} steps done for ${senderPhone}.`);
    }

  } catch (err) {
    console.error('[FOLLOW-UP EXECUTION ERROR]:', err);
    activeTimers.delete(sessionId);
    removePending(sessionId);
  }
}

// ── CANCEL ───────────────────────────────────────────────────────────────────

/**
 * Cancel ALL pending follow-up timers for a session.
 * Call when: user replies, user closes conversation, owner replies manually.
 */
export function cancelFollowUp(sessionId) {
  if (activeTimers.has(sessionId)) {
    clearTimeout(activeTimers.get(sessionId).timeoutId);
    activeTimers.delete(sessionId);
    removePending(sessionId);
    console.log(`[FOLLOW-UP CANCELLED] for session ${sessionId}`);
  }
}

// ── STARTUP RESTORE ──────────────────────────────────────────────────────────

/**
 * Re-hydrate pending follow-up timers from disk after server restart.
 * Call this in server.js on startup.
 */
export async function restoreFollowUpsOnStartup() {
  const pending = readPending();
  if (pending.length === 0) return;

  console.log(`[FOLLOW-UP RESTORE] Found ${pending.length} pending follow-up(s). Re-scheduling...`);

  for (const entry of pending) {
    const { sessionId, botId, senderPhone, senderName, fireAt, step, maxSteps } = entry;
    const remainingMs = Math.max(5000, fireAt - Date.now());
    const label = remainingMs >= 3600000
      ? `${Math.round(remainingMs / 3600000)}h`
      : `${Math.round(remainingMs / 60000)}m`;

    console.log(`  Restored Step ${step} for ${senderPhone} fires in ${label}`);

    const timeoutId = setTimeout(() => _executeFollowUp({
      botId,
      sessionId,
      senderPhone: senderPhone.replace(/[^0-9]/g, ''),
      senderName,
      step,
      maxSteps,
      fireAt
    }), remainingMs);

    activeTimers.set(sessionId, {
      timeoutId, botId, sessionId,
      cleanPhone: senderPhone.replace(/[^0-9]/g, ''),
      senderName, scheduledAt: Date.now(), fireAt, step
    });
  }
}

// ── STATUS / LISTING ─────────────────────────────────────────────────────────

export function getActiveFollowUps() {
  const list = [];
  for (const [sessionId, item] of activeTimers.entries()) {
    list.push({
      sessionId,
      botId: item.botId,
      phone: '+' + item.cleanPhone,
      senderName: item.senderName,
      step: item.step,
      scheduledAt: new Date(item.scheduledAt).toISOString(),
      fireAt: new Date(item.fireAt).toISOString(),
      remainingMinutes: Math.max(0, Math.round((item.fireAt - Date.now()) / 60000))
    });
  }
  return list;
}

// ── JOURNEY LOGGER ───────────────────────────────────────────────────────────
function recordJourneyRun({ contact_name, contact_handle, step }) {
  try {
    if (!fs.existsSync(JOURNEYS_FILE)) return;
    const raw = fs.readFileSync(JOURNEYS_FILE, 'utf-8');
    const journeys = JSON.parse(raw);
    const waJourney = journeys.find(j => j.id === 'journey-wa-live-agent' || j.template_id === 'tpl-wa-agent');

    if (waJourney) {
      waJourney.stats.total_runs += 1;
      waJourney.stats.sent += 1;
      waJourney.stats.delivered += 1;
      waJourney.stats.completed += 1;
      waJourney.stats.outcomes.completed += 1;

      const newRun = {
        id: `run-${Date.now()}`,
        contact_name,
        contact_handle,
        contact_channel: 'whatsapp',
        state: 'completed',
        last_step: step,
        version: 'v1',
        created_at: new Date().toLocaleString(),
        updated_at: new Date().toLocaleString(),
        logs: [
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), step: 'Trigger: Incoming WhatsApp Message', status: 'success' },
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), step: `Execution: ${step}`, status: 'success' },
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), step: 'Status: Completed', status: 'success' }
        ]
      };

      if (!waJourney.runs) waJourney.runs = [];
      waJourney.runs.unshift(newRun);
      fs.writeFileSync(JOURNEYS_FILE, JSON.stringify(journeys, null, 2));
    }
  } catch (err) {
    console.warn('Could not record journey run log:', err.message);
  }
}
