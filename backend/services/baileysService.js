import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { generateBotReply } from './geminiService.js';
import { extractLeadDetails } from './leadParserService.js';

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
      logger: pino({ level: 'silent' }),
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

        console.log(`✅ WhatsApp LIVE Connected successfully for Bot: ${botId} (${formattedPhone})`);
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const currentBot = await db.getBotById(botId);
        const isExplicitLogout = statusCode === DisconnectReason.loggedOut && currentBot?.whatsapp_status === 'connected';

        console.log(`ℹ️ WhatsApp socket closed for bot ${botId} (code: ${statusCode}). Auto-reconnecting: ${!isExplicitLogout}`);

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
          // Automatic seamless reconnection so the handshake completes with the phone!
          setTimeout(() => {
            getOrCreateSocket(botId, false);
          }, 1000);
        }
      }
    });

    // Handle real customer incoming messages & auto AI response
    sock.ev.on('messages.upsert', async ({ messages: incomingMsgs, type }) => {
      if (type !== 'notify') return;

      for (const msg of incomingMsgs) {
        if (msg.key.fromMe || !msg.message || msg.key.remoteJid.includes('@broadcast') || msg.key.remoteJid.includes('@newsletter')) {
          continue;
        }

        const senderJid = msg.key.remoteJid;
        const senderPhone = '+' + senderJid.split('@')[0];
        const senderName = msg.pushName || 'WhatsApp Customer';

        const messageText = msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.buttonsResponseMessage?.selectedButtonId ||
          '';

        if (!messageText.trim()) continue;

        console.log(`📩 Incoming WhatsApp from ${senderPhone} (${senderName}): "${messageText}"`);

        try {
          const currentBot = await db.getBotById(botId);
          if (!currentBot) continue;

          const sessionId = `wa-${senderPhone.replace(/[^0-9]/g, '')}`;

          // 1. Record incoming user message
          await db.addMessage({
            bot_id: botId,
            session_id: sessionId,
            sender: 'user',
            content: messageText,
            channel: 'whatsapp'
          });

          // 2. Extract and create lead in CRM
          const history = await db.getMessages(botId, sessionId);
          const leadData = extractLeadDetails(messageText, history);
          const finalPhone = leadData?.lead_phone || senderPhone;
          const finalName = leadData?.lead_name !== 'Website Visitor' ? leadData?.lead_name : senderName;

          await db.createLead({
            bot_id: botId,
            user_id: currentBot.user_id,
            lead_name: finalName,
            lead_phone: finalPhone,
            lead_email: leadData?.lead_email || null,
            lead_requirement: leadData?.lead_requirement || messageText,
            channel: 'whatsapp',
            session_id: sessionId,
            status: 'new'
          });

          // 3. Generate Gemini AI Response
          const { reply } = await generateBotReply({
            bot: currentBot,
            userMessage: messageText,
            history
          });

          // 4. Send AI reply back on WhatsApp
          await sock.sendMessage(senderJid, { text: reply }, { quoted: msg });

          // 5. Store bot reply in message logs
          await db.addMessage({
            bot_id: botId,
            session_id: sessionId,
            sender: 'bot',
            content: reply,
            channel: 'whatsapp'
          });

          console.log(`🤖 AI Auto-Reply sent to ${senderPhone}: "${reply.substring(0, 80)}..."`);
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

    console.log(`🔑 8-Digit Pairing Code generated for ${cleanPhone}: ${formattedCode}`);

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
  if (!bot) return { status: 'disconnected' };

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

  const phone = phoneNumber || '+91 98765 ' + Math.floor(10000 + Math.random() * 90000);

  const updatedBot = await db.updateBot(botId, {
    whatsapp_status: 'connected',
    whatsapp_number: phone,
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
export async function processWhatsAppIncoming({
  botId,
  senderPhone,
  messageText,
  senderName = 'WhatsApp Customer'
}) {
  const bot = await db.getBotById(botId);
  if (!bot) throw new Error('Bot not found');

  const sessionId = `wa-${senderPhone.replace(/[^0-9]/g, '')}`;

  // 1. Record incoming user message
  await db.addMessage({
    bot_id: botId,
    session_id: sessionId,
    sender: 'user',
    content: messageText,
    channel: 'whatsapp'
  });

  // 2. Extract potential lead
  const history = await db.getMessages(botId, sessionId);
  const leadData = extractLeadDetails(messageText, history);

  const finalPhone = leadData?.lead_phone || senderPhone;
  const finalName = leadData?.lead_name !== 'Website Visitor' ? leadData?.lead_name : senderName;

  await db.createLead({
    bot_id: botId,
    user_id: bot.user_id,
    lead_name: finalName,
    lead_phone: finalPhone,
    lead_email: leadData?.lead_email || null,
    lead_requirement: leadData?.lead_requirement || messageText,
    channel: 'whatsapp',
    session_id: sessionId,
    status: 'new'
  });

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
