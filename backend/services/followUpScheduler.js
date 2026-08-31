import { db } from '../config/database.js';
import { getOrCreateSocket } from './baileysService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOURNEYS_FILE = path.join(__dirname, '..', 'data', 'journeys.json');

// In-memory active follow-up timers map: sessionId -> { timeoutId, scheduledAt, fireAt, payload }
const activeTimers = new Map();

/**
 * Schedule an automated follow-up message for a WhatsApp session if the user doesn't reply
 */
export function scheduleFollowUp({
  botId,
  sessionId,
  senderPhone,
  senderName = 'Customer',
  delayMs = 2 * 60 * 60 * 1000, // Default 2 hours
  customMessage = null
}) {
  // 1. Cancel any existing pending follow-up for this session
  cancelFollowUp(sessionId);

  const cleanPhone = senderPhone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return;

  const followUpText = customMessage || 
    `Hey ${senderName !== 'Customer' ? senderName : ''}! 👋 Just following up to see if you have any questions regarding our Web Development ($499 - $999) or AI Chatbot packages?\n\nFeel free to let me know if you'd like to book a quick 10-min consultation with Suresh! 🚀`.replace(/  +/g, ' ');

  const fireAt = Date.now() + delayMs;

  const timeoutId = setTimeout(async () => {
    try {
      console.log(`⏰ [FOLLOW-UP SCHEDULER TRIGGERED] for ${cleanPhone} (session: ${sessionId})`);

      // 1. Check if user sent a message recently after scheduling
      const allMsgs = await db.getAllMessages();
      const sessionMsgs = allMsgs.filter(m => m.session_id === sessionId);
      const lastMsg = sessionMsgs[sessionMsgs.length - 1];

      // If the last message was from the user, they already replied, don't send follow-up
      if (lastMsg && lastMsg.sender === 'user' && new Date(lastMsg.created_at).getTime() > fireAt - delayMs) {
        console.log(`ℹ️ [FOLLOW-UP CANCELLED] User already replied recently.`);
        activeTimers.delete(sessionId);
        return;
      }

      // 2. Dispatch follow-up to live WhatsApp
      const sock = await getOrCreateSocket(botId, false);
      if (sock) {
        const remoteJid = cleanPhone + '@s.whatsapp.net';
        await sock.sendMessage(remoteJid, { text: followUpText });
      }

      // 3. Record in database message history
      await db.addMessage({
        bot_id: botId,
        session_id: sessionId,
        sender: 'bot',
        content: `[Automated 2-Hour Follow-Up]\n${followUpText}`,
        channel: 'whatsapp'
      });

      // 4. Update journey execution statistics
      recordJourneyRun({
        contact_name: senderName,
        contact_handle: `+${cleanPhone}`,
        step: 'Automated Follow-up Reminder Sent'
      });

      activeTimers.delete(sessionId);
    } catch (err) {
      console.error('Error executing automated follow-up:', err);
      activeTimers.delete(sessionId);
    }
  }, delayMs);

  activeTimers.set(sessionId, {
    timeoutId,
    botId,
    sessionId,
    cleanPhone,
    senderName,
    scheduledAt: Date.now(),
    fireAt,
    followUpText
  });

  console.log(`⏳ [FOLLOW-UP SCHEDULED] for ${cleanPhone} in ${Math.round(delayMs / 1000 / 60)} minutes.`);
}

/**
 * Cancel a pending follow-up timer when customer responds
 */
export function cancelFollowUp(sessionId) {
  if (activeTimers.has(sessionId)) {
    const item = activeTimers.get(sessionId);
    clearTimeout(item.timeoutId);
    activeTimers.delete(sessionId);
    console.log(`🛑 [FOLLOW-UP CANCELLED] for session ${sessionId} due to customer reply.`);
  }
}

/**
 * Get list of currently pending follow-up timers
 */
export function getActiveFollowUps() {
  const list = [];
  for (const [sessionId, item] of activeTimers.entries()) {
    list.push({
      sessionId,
      botId: item.botId,
      phone: item.cleanPhone,
      senderName: item.senderName,
      scheduledAt: new Date(item.scheduledAt).toISOString(),
      fireAt: new Date(item.fireAt).toISOString(),
      remainingMinutes: Math.max(0, Math.round((item.fireAt - Date.now()) / 60000)),
      message: item.followUpText
    });
  }
  return list;
}

/**
 * Internal helper to record journey runs in journeys.json
 */
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
