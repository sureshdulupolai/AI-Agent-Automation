import { db } from '../config/database.js';
import { generateBotReply } from '../services/geminiService.js';
import { extractLeadDetails } from '../services/leadParserService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle incoming chat messages from the web widget or playground
 */
export async function handleWidgetChat(req, res) {
  try {
    const { botId } = req.params;
    const { message, sessionId: clientSessionId, visitorInfo, apiKeyOverride } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const bot = await db.getBotById(botId);
    if (!bot) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const sessionId = clientSessionId || `sess-${uuidv4().substring(0, 10)}`;

    // 1. Store User Message
    await db.addMessage({
      bot_id: botId,
      session_id: sessionId,
      sender: 'user',
      content: message.trim(),
      channel: 'website'
    });

    // 2. Fetch recent conversation history
    const history = await db.getMessages(botId, sessionId);

    // 3. Extract contact info / Lead detection
    const leadData = extractLeadDetails(message, history);
    let capturedLead = null;

    if (leadData || (visitorInfo && (visitorInfo.phone || visitorInfo.email))) {
      capturedLead = await db.createLead({
        bot_id: botId,
        user_id: bot.user_id,
        lead_name: visitorInfo?.name || leadData?.lead_name || 'Website Visitor',
        lead_phone: visitorInfo?.phone || leadData?.lead_phone || null,
        lead_email: visitorInfo?.email || leadData?.lead_email || null,
        lead_requirement: leadData?.lead_requirement || message.trim(),
        channel: 'website',
        session_id: sessionId,
        status: 'new'
      });
    }

    // 4. Generate AI Response from Google Gemini / Context Engine
    const { reply, model, mode } = await generateBotReply({
      bot,
      userMessage: message.trim(),
      history: history.slice(0, -1), // prior messages excluding the one just added
      apiKeyOverride
    });

    // 5. Store Bot Reply
    const savedBotMsg = await db.addMessage({
      bot_id: botId,
      session_id: sessionId,
      sender: 'bot',
      content: reply,
      channel: 'website'
    });

    // 6. Detect Autonomous Action Metadata (DOM Navigation & Execution)
    let action = null;
    const lowerMsg = message.toLowerCase();
    const lowerReply = (reply || '').toLowerCase();

    if (lowerMsg.includes('pipeline') || lowerMsg.includes('deal') || lowerReply.includes('/pipeline')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/pipeline',
        label: 'Open Deals Pipeline',
        requireAuth: true,
        highlightSelector: '#pipeline-board'
      };
    } else if (lowerMsg.includes('whatsapp') || lowerMsg.includes('qr') || lowerMsg.includes('integrat') || lowerReply.includes('/integrations')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/integrations',
        label: 'Connect WhatsApp in Integrations',
        requireAuth: true,
        highlightSelector: '#whatsapp-integration-card'
      };
    } else if (lowerMsg.includes('billing') || lowerMsg.includes('pricing') || lowerMsg.includes('upgrade') || lowerMsg.includes('plan')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/deployment',
        label: 'View Billing & Packages',
        requireAuth: false,
        highlightSelector: '#billing-plans'
      };
    } else if (lowerMsg.includes('campaign') || lowerMsg.includes('broadcast') || lowerMsg.includes('email drip')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/campaigns',
        label: 'Launch Safe Campaign',
        requireAuth: true,
        highlightSelector: '#campaigns-header'
      };
    } else if (lowerMsg.includes('doc') || lowerMsg.includes('guide') || lowerMsg.includes('tutorial')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/docs',
        label: 'Open Documentation',
        requireAuth: false,
        highlightSelector: '#docs-content'
      };
    } else if (lowerMsg.includes('task') || lowerMsg.includes('eod') || lowerMsg.includes('audit')) {
      action = {
        type: 'NAVIGATE_TO',
        targetPath: '/tasks',
        label: 'View Task Center',
        requireAuth: true,
        highlightSelector: '#tasks-header'
      };
    }

    return res.json({
      success: true,
      reply,
      action,
      sessionId,
      messageId: savedBotMsg.id,
      timestamp: savedBotMsg.created_at,
      model,
      mode,
      leadCaptured: !!capturedLead
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: err.message
    });
  }
}

/**
 * Retrieve message history for a given session
 */
export async function getSessionHistory(req, res) {
  try {
    const { botId, sessionId } = req.params;
    const messages = await db.getMessages(botId, sessionId);
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load conversation history' });
  }
}

/**
 * Direct explicit visitor lead submission form inside widget
 */
export async function submitLeadForm(req, res) {
  try {
    const { botId } = req.params;
    const { name, phone, email, requirement, sessionId } = req.body;

    const bot = await db.getBotById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const newLead = await db.createLead({
      bot_id: botId,
      user_id: bot.user_id,
      lead_name: name || 'Website Visitor',
      lead_phone: phone || null,
      lead_email: email || null,
      lead_requirement: requirement || 'Submitted via contact form in widget',
      channel: 'website',
      session_id: sessionId || `sess-${uuidv4().substring(0, 8)}`,
      status: 'new'
    });

    return res.status(201).json({ success: true, lead: newLead });
  } catch (err) {
    console.error('Submit lead error:', err);
    return res.status(500).json({ error: 'Failed to submit lead' });
  }
}
