import {
  initializeWhatsAppQR,
  requestPairingCode,
  getWhatsAppStatus,
  confirmWhatsAppPairing,
  disconnectWhatsApp,
  processWhatsAppIncoming,
  fetchLiveWhatsAppGroups
} from '../services/baileysService.js';
import { getWhitelistSettings, saveWhitelistSettings } from '../services/whatsappGroupWhitelistService.js';
import { db } from '../config/database.js';

/**
 * Request 8-Digit Pairing Code for linking via Phone Number
 */
export async function getPairingCode(req, res) {
  try {
    const { botId } = req.params;
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required (e.g. 919876543210)' });
    }
    const session = await requestPairingCode(botId, phoneNumber);
    return res.json(session);
  } catch (err) {
    console.error('WhatsApp Pairing Code error:', err);
    return res.status(500).json({ error: err.message || 'Failed to request pairing code' });
  }
}

/**
 * Generate QR Code for WhatsApp Pairing
 */
export async function getQR(req, res) {
  try {
    const { botId } = req.params;
    const session = await initializeWhatsAppQR(botId);
    return res.json(session);
  } catch (err) {
    console.error('WhatsApp QR generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate QR' });
  }
}

/**
 * Get WhatsApp Connection Status
 */
export async function getStatus(req, res) {
  try {
    const { botId } = req.params;
    const status = await getWhatsAppStatus(botId);
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check status' });
  }
}

/**
 * Confirm pairing (simulate phone scan or Baileys socket connected)
 */
export async function confirmPairing(req, res) {
  try {
    const { botId } = req.params;
    const { phoneNumber } = req.body;
    const bot = await confirmWhatsAppPairing(botId, phoneNumber);
    return res.json({ success: true, bot });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to pair WhatsApp' });
  }
}

/**
 * Disconnect WhatsApp
 */
export async function disconnect(req, res) {
  try {
    const { botId } = req.params;
    await disconnectWhatsApp(botId);
    return res.json({ success: true, status: 'disconnected' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to disconnect WhatsApp' });
  }
}

/**
 * Simulate or test an incoming WhatsApp message
 */
export async function simulateIncoming(req, res) {
  try {
    const { botId } = req.params;
    const { senderPhone, messageText, senderName, media } = req.body;

    if ((!messageText && !media) || !senderPhone) {
      return res.status(400).json({ error: 'senderPhone and either messageText or media attachment are required' });
    }

    const result = await processWhatsAppIncoming({
      botId,
      senderPhone,
      messageText: messageText || '',
      senderName: senderName || 'WhatsApp Customer',
      media: media || null
    });

    return res.json(result);
  } catch (err) {
    console.error('WhatsApp simulator error:', err);
    return res.status(500).json({ error: 'Failed to process simulated WhatsApp message' });
  }
}

/**
 * Meta WhatsApp Cloud API: GET verification challenge
 */
export function metaWebhookVerify(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_VERIFY_TOKEN || 'omnibot_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('✅ Meta WhatsApp Webhook Verified successfully');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
}

/**
 * Meta WhatsApp Cloud API: POST incoming message webhook
 */
export async function metaWebhookReceive(req, res) {
  try {
    const body = req.body;

    // Check if it's a WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === 'text') {
        const fromPhone = message.from;
        const textBody = message.text.body;
        const senderName = value.contacts?.[0]?.profile?.name || 'WhatsApp User';
        const displayPhoneNumber = value.metadata?.display_phone_number;

        // Find matching bot by WhatsApp number or use default
        const bots = await db.getBots();
        const matchedBot = bots.find(b => b.whatsapp_number && b.whatsapp_number.replace(/\D/g, '') === (displayPhoneNumber || '').replace(/\D/g, '')) || bots[0];

        if (matchedBot) {
          await processWhatsAppIncoming({
            botId: matchedBot.id,
            senderPhone: fromPhone,
            messageText: textBody,
            senderName
          });
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error('Meta webhook error:', err);
    return res.status(500).send('Internal Error');
  }
}

/**
 * GET /api/whatsapp/whitelist-settings
 */
export async function getWhitelist(req, res) {
  try {
    const settings = await getWhitelistSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/whatsapp/whitelist-settings
 */
export function updateWhitelist(req, res) {
  try {
    const success = saveWhitelistSettings(req.body);
    return res.json({ success, settings: req.body });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/whatsapp/groups/live
 */
export async function getLiveGroups(req, res) {
  try {
    const botId = req.query.botId || 'bot-ec0db899';
    const groups = await fetchLiveWhatsAppGroups(botId);
    return res.json({ success: true, groups });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
