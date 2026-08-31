import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { generateBotReply } from './geminiService.js';
import { extractLeadDetails } from './leadParserService.js';
import { scheduleFollowUp, cancelFollowUp, isConversationClosed } from './followUpScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.join(__dirname, '..', 'data', 'whatsapp_sessions');

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// In-memory socket session registry
const activeSockets = new Map();
const activeQR = new Map();
const activePairingCodes = new Map();
const connectingLocks = new Map();

/**
 * Resolves the real international phone number from a WhatsApp message / JID.
 * Handles:
 * 1. Standard phone JID (e.g. 919820646838@s.whatsapp.net or 919820646838:0@s.whatsapp.net)
 * 2. WhatsApp Linked Device Identifier (@lid, e.g. 56152503144564@lid) mapped via Baileys Signal Repository
 * 3. Alternate PN addressing properties on msg/key
 * 4. In-chat message parsing fallback
 */
export async function resolveSenderPhone(sock, msg, senderJid, botPhone = null) {
  const ownPhoneDigits = (botPhone || sock?.user?.id || '').replace(/[^0-9]/g, '');

  const isCandidateValid = (num) => {
    if (!num) return false;
    const digits = num.replace(/[^0-9]/g, '');
    if (digits.length < 7 || digits.length > 15) return false;
    if (ownPhoneDigits && digits === ownPhoneDigits) return false; // Strictly protect against returning bot owner's own number!
    return true;
  };

  // 1. Direct phone number from JID (@s.whatsapp.net)
  if (senderJid && senderJid.endsWith('@s.whatsapp.net')) {
    const rawNumber = senderJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    if (isCandidateValid(rawNumber)) {
      return '+' + rawNumber;
    }
  }

  // 2. Check participant / remoteJidPn / participantPn properties on message
  const candidateJids = [
    msg?.key?.participantPn,
    msg?.participantPn,
    msg?.key?.remoteJidPn,
    msg?.remoteJidPn,
    msg?.key?.participant,
    msg?.participant,
    msg?.key?.senderPn,
    msg?.senderPn
  ].filter(Boolean);

  for (const jid of candidateJids) {
    if (typeof jid === 'string' && jid.endsWith('@s.whatsapp.net')) {
      const rawNumber = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      if (isCandidateValid(rawNumber)) {
        return '+' + rawNumber;
      }
    }
  }

  // 3. Query Baileys Signal Repository LID reverse mapping
  if (senderJid && (senderJid.endsWith('@lid') || !senderJid.endsWith('@s.whatsapp.net'))) {
    try {
      if (sock?.signalRepository?.lidMapping?.getPNForLID) {
        const pnJid = await sock.signalRepository.lidMapping.getPNForLID(senderJid);
        if (pnJid) {
          const rawNumber = pnJid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
          if (isCandidateValid(rawNumber)) {
            return '+' + rawNumber;
          }
        }
      }
    } catch (e) {
      console.warn('LID reverse mapping lookup error:', e.message);
    }
  }

  // 4. Check if message text has an explicit phone number provided by client
  const messageText = msg?.message?.conversation ||
    msg?.message?.extendedTextMessage?.text ||
    msg?.message?.imageMessage?.caption || '';
  if (messageText) {
    const parsed = extractLeadDetails(messageText, []);
    if (parsed?.lead_phone && isCandidateValid(parsed.lead_phone)) {
      const p = parsed.lead_phone.replace(/[^0-9]/g, '');
      return '+' + p;
    }
  }

  // 5. Fallback: extract digits from senderJid
  const rawDigits = (senderJid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
  return rawDigits ? '+' + rawDigits : '+0000000000';
}

/**
 * Initialize or get a persistent, stable WhatsApp WebSocket session for a bot.
 */
export async function getOrCreateSocket(botId, forceReset = false) {
  if (forceReset) {
    if (activeSockets.has(botId)) {
      try {
        const s = activeSockets.get(botId);
        s.ev.removeAllListeners();
        s.end();
      } catch (e) {}
      activeSockets.delete(botId);
    }
    activeQR.delete(botId);
    activePairingCodes.delete(botId);

    const sessionFolder = path.join(SESSIONS_DIR, botId);
    if (fs.existsSync(sessionFolder)) {
      try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch (e) {}
    }
  }

  if (activeSockets.has(botId)) {
    return activeSockets.get(botId);
  }

  if (connectingLocks.get(botId)) {
    return connectingLocks.get(botId);
  }

  const connectPromise = (async () => {
    const sessionFolder = path.join(SESSIONS_DIR, botId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'warn' }),
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 15000
    });

    activeSockets.set(botId, sock);

    // Save auth credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Connection update lifecycle
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
            width: 320
          });
          activeQR.set(botId, qrDataUrl);
          await db.updateBot(botId, { whatsapp_status: 'pairing', whatsapp_type: 'qr' });
          console.log(`ðŸ“± [WHATSAPP QR CODE GENERATED] for Bot ${botId}`);
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }

      if (connection === 'open') {
        const rawJid = sock.user?.id || '';
        const phone = rawJid.split(':')[0] || rawJid.split('@')[0];
        const formattedPhone = '+' + phone;

        activeQR.delete(botId);
        activePairingCodes.delete(botId);

        await db.updateBot(botId, {
          whatsapp_status: 'connected',
          whatsapp_number: formattedPhone,
          whatsapp_type: 'qr'
        });

        console.log(`âœ… [WHATSAPP LIVE CONNECTED] Bot ${botId} is linked to phone: ${formattedPhone}`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const currentBot = await db.getBotById(botId);
        const isExplicitLogout = statusCode === DisconnectReason.loggedOut;

        console.log(`â„¹ï¸ [WHATSAPP CLOSED] Bot ${botId} (code: ${statusCode}, loggedOut: ${isExplicitLogout})`);

        activeSockets.delete(botId);
        connectingLocks.delete(botId);

        if (isExplicitLogout) {
          activeQR.delete(botId);
          activePairingCodes.delete(botId);
          await db.updateBot(botId, { whatsapp_status: 'disconnected', whatsapp_number: null });
          if (fs.existsSync(sessionFolder)) {
            try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch (e) {}
          }
        } else {
          // Reconnect automatically if it was a temporary connection drop
          setTimeout(() => {
            if (!activeSockets.has(botId)) {
              getOrCreateSocket(botId, false).catch(() => {});
            }
          }, 2000);
        }
      }
    });

    // Handle real incoming WhatsApp messages & send real-time Gemini AI response
    sock.ev.on('messages.upsert', async ({ messages: incomingMsgs, type }) => {
      if (type !== 'notify') return;

      for (const msg of incomingMsgs) {
        if (!msg.message) continue;

        // Ignore messages sent by the connected phone itself
        if (msg.key.fromMe) continue;

        const senderJid = msg.key.remoteJid;
        if (!senderJid) continue;
        if (senderJid.includes('@broadcast') || senderJid.includes('@newsletter')) continue;

        const currentBot = await db.getBotById(botId);
        if (!currentBot) continue;

        // Dynamic phone resolution: Handles both standard JID and WhatsApp LID identifiers (@lid)
        // Strictly extracts the client's / sender's number, never the bot owner's own number!
        const senderPhone = await resolveSenderPhone(sock, msg, senderJid, currentBot.whatsapp_number);
        const senderName = msg.pushName || 'WhatsApp Customer';

        let mediaPayload = null;
        if (msg.message.imageMessage) {
          try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {});
            mediaPayload = {
              mimeType: msg.message.imageMessage.mimetype || 'image/jpeg',
              base64: buffer.toString('base64'),
              caption: msg.message.imageMessage.caption || ''
            };
          } catch (e) {
            console.warn('Could not download image:', e.message);
          }
        } else if (msg.message.audioMessage) {
          try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {});
            mediaPayload = {
              mimeType: msg.message.audioMessage.mimetype || 'audio/ogg',
              base64: buffer.toString('base64')
            };
          } catch (e) {
            console.warn('Could not download audio:', e.message);
          }
        } else if (msg.message.documentMessage) {
          try {
            const buffer = await downloadMediaMessage(msg, 'buffer', {});
            mediaPayload = {
              mimeType: msg.message.documentMessage.mimetype || 'application/pdf',
              base64: buffer.toString('base64'),
              filename: msg.message.documentMessage.fileName || 'file'
            };
          } catch (e) {
            console.warn('Could not download document:', e.message);
          }
        }

        const messageText = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          msg.message.videoMessage?.caption ||
          msg.message.documentMessage?.title ||
          msg.message.buttonsResponseMessage?.selectedButtonId ||
          msg.message.templateButtonReplyMessage?.selectedId ||
          (mediaPayload ? `[Attached ${mediaPayload.mimeType.startsWith('image') ? 'Image' : (mediaPayload.mimeType.startsWith('audio') ? 'Voice Note' : 'Document')}]` : '');

        if (!messageText && !mediaPayload) continue;

        console.log(`📩 [REAL WHATSAPP INCOMING] from ${senderPhone} (${senderName}): "${messageText || '[Media Attachment]'}"`);

        try {

          const sessionId = `wa-${senderPhone.replace(/[^0-9]/g, '')}`;

          // Check if there is an active ongoing conversation in progress (within last 30 mins)
          const sessionHistory = await db.getMessages(botId, sessionId);
          const lastMsg = sessionHistory[sessionHistory.length - 1];
          const isOngoingSession = lastMsg && (Date.now() - new Date(lastMsg.created_at).getTime() < 30 * 60 * 1000);

          // Determine if this is the user's very first message (no history at all)
          const isFirstMessage = sessionHistory.length === 0;

          // ── SMART KEYWORD-BASED SOURCE DETECTION ──────────────────────
          // Keyword filter is ONLY evaluated on the first message to detect the
          // traffic source (website widget vs. direct personal contact).
          const replyMode = currentBot.whatsapp_reply_mode || 'all';
          const keywords = Array.isArray(currentBot.whatsapp_keywords) ? currentBot.whatsapp_keywords : [];

          if (replyMode === 'keywords' && keywords.length > 0 && !mediaPayload) {
            if (isOngoingSession) {
              // Ongoing conversation — always continue, no keyword gate
            } else {
              // New conversation (first message or session expired > 30 min)
              const lowerMsg = (messageText || '').toLowerCase();
              const hasKeywordMatch = keywords.some(k => k.trim() && lowerMsg.includes(k.toLowerCase().trim()));

              if (hasKeywordMatch) {
                // ✅ Website source confirmed — proceed normally
                console.log(`🌐 [WEBSITE SOURCE] Keyword matched for ${senderPhone} ("${messageText}"). Proceeding with reply + lead capture.`);
              } else {
                // ❌ Direct personal contact — skip entirely (no reply, no lead)
                console.log(`🚫 [DIRECT CONTACT - SKIPPED] No keyword match for ${senderPhone} ("${messageText}"). Owner can reply manually.`);
                continue;
              }
            }
          }

          // Cancel any pending follow-up reminder since user sent a new message
          cancelFollowUp(sessionId);

          // 1. Record incoming user message
          await db.addMessage({
            bot_id: botId,
            session_id: sessionId,
            sender: 'user',
            content: messageText || `[Attached ${mediaPayload?.mimeType || 'file'}]`,
            channel: 'whatsapp'
          });

          // 2. Extract & save lead ONLY for website-sourced first messages
          //    (isOngoingSession means lead was already captured previously)
          const history = await db.getMessages(botId, sessionId);

          if (!isOngoingSession) {
            // First qualifying message from website — capture the lead
            const leadData = extractLeadDetails(messageText || 'Inquiry with attachment', history);
            const finalPhone = (leadData?.lead_phone && !leadData.lead_phone.includes('561525031'))
              ? (leadData.lead_phone.startsWith('+') ? leadData.lead_phone : '+' + leadData.lead_phone.replace(/[^0-9]/g, ''))
              : senderPhone;
            const finalName = (leadData?.lead_name && leadData.lead_name !== 'Website Visitor')
              ? leadData.lead_name
              : (senderName || 'WhatsApp Customer');

            await db.createLead({
              bot_id: botId,
              user_id: currentBot.user_id,
              lead_name: finalName,
              lead_phone: finalPhone,
              lead_email: leadData?.lead_email || null,
              lead_requirement: leadData?.lead_requirement || messageText || 'Sent media attachment',
              channel: 'whatsapp',
              session_id: sessionId,
              status: 'new'
            });
          }

          // 3. Generate Gemini AI Response (with Vision/Audio/Doc multimodal context)
          const { reply } = await generateBotReply({
            bot: currentBot,
            userMessage: messageText,
            history,
            media: mediaPayload
          });

          // 4. Send AI reply back on WhatsApp
          await sock.sendMessage(senderJid, { text: reply }, { quoted: msg });

          // 5. Store bot reply in history
          await db.addMessage({
            bot_id: botId,
            session_id: sessionId,
            sender: 'bot',
            content: reply,
            channel: 'whatsapp'
          });

          // 6. Smart Follow-Up Scheduling
          // If user closed the conversation (bye/not interested/done) â†’ cancel any pending follow-up
          // Otherwise â†’ schedule contextual AI follow-up
          if (isConversationClosed(messageText)) {
            cancelFollowUp(sessionId);
            console.log(`ðŸ›‘ [FOLLOW-UP SKIPPED] User closed conversation: "${messageText}". No follow-up will be sent.`);
          } else {
            // Get phone/name from lead (isOngoingSession = no new lead), fallback to sender
            const followUpPhone = isOngoingSession ? senderPhone : (
              history.find(m => m.sender === 'user')
                ? senderPhone
                : senderPhone
            );
            const followUpName = isOngoingSession ? senderName : (
              history.length > 0 ? senderName : senderName
            );
            scheduleFollowUp({
              botId,
              sessionId,
              senderPhone: followUpPhone,
              senderName: followUpName,
              conversationHistory: history
            });
          }

          console.log(`ðŸ¤– [REAL WHATSAPP SENT] to ${senderPhone}: "${reply.substring(0, 80)}..."`);
        } catch (err) {
          console.error('Error handling incoming WhatsApp message:', err);
        }
      }
    });

    return sock;
  })();

  connectingLocks.set(botId, connectPromise);
  try {
    const s = await connectPromise;
    connectingLocks.delete(botId);
    return s;
  } catch (err) {
    connectingLocks.delete(botId);
    throw err;
  }
}

/**
 * Restore all saved WhatsApp sessions across server restarts
 */
export async function initAllWhatsAppSessions() {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) return;
    const dirs = fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const botId of dirs) {
      const credsFile = path.join(SESSIONS_DIR, botId, 'creds.json');
      if (fs.existsSync(credsFile)) {
        console.log(`ðŸ”„ Restoring active WhatsApp session for bot: ${botId}...`);
        try {
          await getOrCreateSocket(botId, false);
        } catch (e) {
          console.error(`Failed to restore session for ${botId}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error('Error in initAllWhatsAppSessions:', err);
  }
}

/**
 * Generate or get QR code for camera scan
 */
export async function initializeWhatsAppQR(botId) {
  const bot = await db.getBotById(botId);
  if (!bot) throw new Error('Bot not found');

  if (bot.whatsapp_status === 'connected') {
    return {
      botId,
      status: 'connected',
      phone_number: bot.whatsapp_number
    };
  }

  // Ensure socket is running
  await getOrCreateSocket(botId, false);

  // Return existing QR or wait for next emit
  return new Promise((resolve) => {
    const existingQR = activeQR.get(botId);
    if (existingQR) {
      return resolve({
        botId,
        status: 'pairing',
        qrCode: existingQR
      });
    }

    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      const qr = activeQR.get(botId);
      if (qr) {
        clearInterval(interval);
        resolve({
          botId,
          status: 'pairing',
          qrCode: qr
        });
      } else if (checkCount > 15) {
        clearInterval(interval);
        resolve({
          botId,
          status: 'pairing',
          qrCode: activeQR.get(botId) || null
        });
      }
    }, 400);
  });
}

/**
 * Request an 8-Digit Pairing Code for linking phone number
 */
export async function requestPairingCode(botId, rawPhoneNumber) {
  const bot = await db.getBotById(botId);
  if (!bot) throw new Error('Bot not found');

  let cleanPhone = rawPhoneNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // auto-prepend 91 for Indian 10-digit mobile
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = '91' + cleanPhone.substring(1);
  }

  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Please enter a valid phone number with country code (e.g. 919812345678)');
  }

  // Clean socket for pairing code handshake
  const sock = await getOrCreateSocket(botId, true);

  // Wait 2.5s for WebSocket connection to open with WhatsApp server
  await new Promise(r => setTimeout(r, 2500));

  try {
    const code = await sock.requestPairingCode(cleanPhone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;

    activePairingCodes.set(botId, formattedCode);
    await db.updateBot(botId, { whatsapp_status: 'pairing', whatsapp_type: 'qr' });

    console.log(`ðŸ”‘ 8-Digit Pairing Code generated for ${cleanPhone}: ${formattedCode}`);

    return {
      botId,
      status: 'pairing',
      pairingCode: formattedCode,
      phoneNumber: cleanPhone
    };
  } catch (err) {
    console.error('Error requesting pairing code:', err);
    throw new Error('Could not generate pairing code for this number. Check phone number format.');
  }
}

/**
 * Get current WhatsApp connection status for a bot
 */
export async function getWhatsAppStatus(botId) {
  const bot = await db.getBotById(botId);
  if (!bot) return { status: 'disconnected', phoneNumber: null };

  const qr = activeQR.get(botId) || null;
  const pairingCode = activePairingCodes.get(botId) || null;

  return {
    status: bot.whatsapp_status || 'disconnected',
    phoneNumber: bot.whatsapp_number || null,
    type: bot.whatsapp_type || 'qr',
    qrCode: bot.whatsapp_status === 'pairing' ? qr : null,
    pairingCode: bot.whatsapp_status === 'pairing' ? pairingCode : null,
    lastActive: new Date().toISOString()
  };
}

/**
 * Confirm pairing simulator / test mode
 */
export async function confirmWhatsAppPairing(botId, phoneNumber) {
  const bot = await db.getBotById(botId);
  if (!bot) throw new Error('Bot not found');

  if (!phoneNumber) {
    throw new Error('Valid phone number is required for pairing');
  }

  const updatedBot = await db.updateBot(botId, {
    whatsapp_status: 'connected',
    whatsapp_number: phoneNumber,
    whatsapp_type: 'qr'
  });

  return updatedBot;
}

/**
 * Disconnect WhatsApp session
 */
export async function disconnectWhatsApp(botId) {
  if (activeSockets.has(botId)) {
    try {
      const sock = activeSockets.get(botId);
      sock.ev.removeAllListeners();
      sock.logout();
      sock.end();
    } catch (e) {}
    activeSockets.delete(botId);
  }
  activeQR.delete(botId);
  activePairingCodes.delete(botId);

  const sessionFolder = path.join(SESSIONS_DIR, botId);
  if (fs.existsSync(sessionFolder)) {
    try { fs.rmSync(sessionFolder, { recursive: true, force: true }); } catch (e) {}
  }

  await db.updateBot(botId, {
    whatsapp_status: 'disconnected',
    whatsapp_number: null
  });
  return { status: 'disconnected' };
}

/**
 * Process incoming WhatsApp message (from simulator or external webhook)
 */
/**
 * Process incoming WhatsApp message (from simulator or external webhook)
 */
export async function processWhatsAppIncoming({
  botId,
  senderPhone,
  messageText,
  senderName = 'WhatsApp Customer'
}) {
  const bot = await db.getBotById(botId);
  if (!bot) throw new Error('Bot not found');

  const sessionId = `wa-${senderPhone.replace(/[^0-9]/g, '')}`;

  const replyMode = bot.whatsapp_reply_mode || 'all';
  const keywords = Array.isArray(bot.whatsapp_keywords) ? bot.whatsapp_keywords : [];

  // Check if session is already active (last message within 30 mins)
  const sessionHistory = await db.getMessages(botId, sessionId);
  const lastMsg = sessionHistory[sessionHistory.length - 1];
  const isOngoingSession = lastMsg && (Date.now() - new Date(lastMsg.created_at).getTime() < 30 * 60 * 1000);

  // Determine if this is the user's very first message (no history at all)
  const isFirstMessage = sessionHistory.length === 0;

  // SMART KEYWORD-BASED SOURCE DETECTION
  // Keyword is ONLY checked on the first message to identify traffic source.
  // CASE A: replyMode = 'all'  -> always reply + save lead
  // CASE B: replyMode = 'keywords':
  //   First/new msg + keyword MATCH   -> website source -> reply + save lead
  //   First/new msg + keyword NO MATCH -> direct personal contact -> completely skip
  //   Ongoing session                  -> always continue conversation
  if (replyMode === 'keywords' && keywords.length > 0) {
    if (isOngoingSession) {
      // Ongoing conversation - always continue, no keyword gate
    } else {
      // New conversation - check keyword to determine source
      const lowerMsg = messageText.toLowerCase();
      const hasKeywordMatch = keywords.some(k => k.trim() && lowerMsg.includes(k.toLowerCase().trim()));
      if (!hasKeywordMatch) {
        // Direct personal contact - skip entirely
        return {
          reply: `No keyword match. Direct contact skipped. Owner can reply manually.`,
          senderPhone,
          sessionId,
          filtered: true,
          source: 'direct_contact'
        };
      }
      // Website source confirmed - proceed with reply + lead capture
    }
  }

  // Cancel any existing pending follow-up reminder
  cancelFollowUp(sessionId);

  // 1. Record incoming user message
  await db.addMessage({
    bot_id: botId,
    session_id: sessionId,
    sender: 'user',
    content: messageText,
    channel: 'whatsapp'
  });

  // 2. Extract & save lead ONLY for website-sourced first messages
  //    (isOngoingSession means lead was already captured previously)
  const history = await db.getMessages(botId, sessionId);

  // Determine phone/name for follow-up (extracted from lead or fallback to sender)
  let followUpPhone = senderPhone;
  let followUpName = senderName;

  if (!isOngoingSession) {
    // First qualifying message from website - capture the lead
    const leadData = extractLeadDetails(messageText, history);
    followUpPhone = leadData?.lead_phone || senderPhone;
    followUpName = leadData?.lead_name !== 'Website Visitor' ? leadData?.lead_name : senderName;

    await db.createLead({
      bot_id: botId,
      user_id: bot.user_id,
      lead_name: followUpName,
      lead_phone: followUpPhone,
      lead_email: leadData?.lead_email || null,
      lead_requirement: leadData?.lead_requirement || messageText,
      channel: 'whatsapp',
      session_id: sessionId,
      status: 'new'
    });
  }

  // 3. Generate Gemini AI Response
  const { reply } = await generateBotReply({
    bot,
    userMessage: messageText,
    history
  });

  // 4. Record Bot Reply in history
  await db.addMessage({
    bot_id: botId,
    session_id: sessionId,
    sender: 'bot',
    content: reply,
    channel: 'whatsapp'
  });

  // 5. Smart Follow-Up Scheduling
  // If user closed the conversation (bye/not interested/done) -> cancel any pending follow-up
  // Otherwise -> schedule contextual AI follow-up with conversation history
  if (isConversationClosed(messageText)) {
    cancelFollowUp(sessionId);
    console.log(`[FOLLOW-UP SKIPPED] Simulator: User closed conversation. No follow-up scheduled.`);
  } else {
    scheduleFollowUp({
      botId,
      sessionId,
      senderPhone: followUpPhone,
      senderName: followUpName,
      conversationHistory: history
    });
  }

  // If live socket exists, also send to real WhatsApp
  const sock = activeSockets.get(botId);
  if (sock) {
    try {
      const remoteJid = senderPhone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      await sock.sendMessage(remoteJid, { text: reply });
    } catch (e) {
      console.warn('Could not forward message to live socket:', e.message);
    }
  }

  return {
    reply,
    senderPhone,
    sessionId
  };
}
