import { db } from '../config/database.js';
import { getOrCreateSocket } from '../services/baileysService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * List all unique conversation threads across Website and WhatsApp
 */
export async function listConversations(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const { botId, channel, search } = req.query;

    const allMessages = await db.getAllMessages(botId || null);
    const leads = await db.getLeads(userId, botId || null);
    const bots = await db.getBots(userId);
    const botMap = new Map(bots.map(b => [b.id, b]));

    // Group messages by session_id
    const sessionMap = new Map();

    for (const msg of allMessages) {
      if (!sessionMap.has(msg.session_id)) {
        sessionMap.set(msg.session_id, []);
      }
      sessionMap.get(msg.session_id).push(msg);
    }

    // Build rich conversation objects
    const conversations = [];

    for (const [sessionId, msgList] of sessionMap.entries()) {
      // Sort messages by date
      msgList.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const lastMsg = msgList[msgList.length - 1];
      const firstMsg = msgList[0];
      const bot = botMap.get(lastMsg.bot_id) || { id: lastMsg.bot_id, bot_name: 'Chatbot' };

      // Find matching lead if any
      const matchingLead = leads.find(l => l.session_id === sessionId || (l.lead_phone && sessionId.includes(l.lead_phone.replace(/\D/g, ''))));

      const channelType = lastMsg.channel || (sessionId.startsWith('wa-') ? 'whatsapp' : 'website');
      const senderName = matchingLead?.lead_name || (channelType === 'whatsapp' ? `WhatsApp User (${sessionId.replace('wa-', '+')})` : 'Website Visitor');

      const conv = {
        sessionId,
        botId: bot.id,
        botName: bot.bot_name,
        botAvatar: bot.bot_avatar_url,
        channel: channelType,
        senderName,
        leadPhone: matchingLead?.lead_phone || null,
        leadEmail: matchingLead?.lead_email || null,
        leadStatus: matchingLead?.status || 'new',
        lastMessage: lastMsg.content,
        lastMessageSender: lastMsg.sender,
        lastMessageAt: lastMsg.created_at,
        messageCount: msgList.length,
        isHumanTakeover: false
      };

      // Apply channel and search filter
      if (channel && conv.channel !== channel) continue;
      if (search) {
        const q = search.toLowerCase();
        const matches = conv.senderName.toLowerCase().includes(q) ||
                        conv.lastMessage.toLowerCase().includes(q) ||
                        (conv.leadPhone && conv.leadPhone.includes(q)) ||
                        (conv.leadEmail && conv.leadEmail.toLowerCase().includes(q));
        if (!matches) continue;
      }

      conversations.push(conv);
    }

    // Sort by latest message time
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.json({ conversations });
  } catch (err) {
    console.error('List conversations error:', err);
    return res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
}

/**
 * Get full message history for a specific conversation session
 */
export async function getConversationDetails(req, res) {
  try {
    const { sessionId } = req.params;
    const { botId } = req.query;

    const messages = await db.getMessages(botId || '', sessionId);
    const leads = await db.getLeads(null, botId || null);
    const matchingLead = leads.find(l => l.session_id === sessionId);

    return res.json({
      sessionId,
      messages,
      lead: matchingLead || null
    });
  } catch (err) {
    console.error('Conversation details error:', err);
    return res.status(500).json({ error: 'Failed to retrieve session transcript' });
  }
}

/**
 * Send a human agent reply to an active website visitor or WhatsApp user
 */
export async function sendAgentReply(req, res) {
  try {
    const { botId, sessionId, message } = req.body;

    if (!sessionId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const bot = await db.getBotById(botId);
    const isWhatsApp = sessionId.startsWith('wa-');

    // 1. Record agent reply in messages table
    const savedMsg = await db.addMessage({
      bot_id: botId,
      session_id: sessionId,
      sender: 'agent', // Human agent
      content: message.trim(),
      channel: isWhatsApp ? 'whatsapp' : 'website'
    });

    // 2. If WhatsApp, send out via live socket
    if (isWhatsApp) {
      const rawPhone = sessionId.replace('wa-', '');
      const remoteJid = rawPhone + '@s.whatsapp.net';
      try {
        const sock = await getOrCreateSocket(botId, false);
        if (sock) {
          await sock.sendMessage(remoteJid, { text: message.trim() });
        }
      } catch (e) {
        console.warn('Failed to send agent reply to live WhatsApp socket:', e.message);
      }
    }

    return res.json({
      success: true,
      message: savedMsg
    });
  } catch (err) {
    console.error('Agent reply error:', err);
    return res.status(500).json({ error: 'Failed to send agent reply' });
  }
}
