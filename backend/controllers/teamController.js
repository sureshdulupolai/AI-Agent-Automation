import db from '../config/database.js';
import { readTakeoverMap, saveTakeoverMap, isHumanTakeoverActive } from '../services/humanTakeoverService.js';

export { isHumanTakeoverActive, readTakeoverMap, saveTakeoverMap };

/**
 * GET /api/team/conversations
 */
export async function listTeamConversations(req, res) {
  try {
    const leads = await db.getLeads(null, null);
    const takeoverMap = readTakeoverMap();

    const conversations = (leads || []).map(l => {
      const cleanPhone = String(l.lead_phone || l.id || '').replace(/[^a-zA-Z0-9]/g, '');
      const takeoverInfo = takeoverMap[cleanPhone] || { is_takeover: false, assigned_to: null, updated_at: null };

      return {
        id: l.id,
        session_id: cleanPhone,
        customer_name: l.lead_name || 'Prospect',
        customer_phone: l.lead_phone || '',
        customer_email: l.lead_email || '',
        last_message: l.lead_requirement || 'Conversation active',
        channel: l.channel || 'whatsapp',
        status: l.status || 'new',
        is_human_takeover: takeoverInfo.is_takeover || false,
        assigned_to: takeoverInfo.assigned_to || (takeoverInfo.is_takeover ? 'Human Agent' : 'NovaByte AI Agent'),
        updated_at: l.created_at || new Date().toISOString()
      };
    });

    return res.json({ success: true, conversations });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/team/handoff/:sessionId
 */
export function toggleHumanHandoff(req, res) {
  try {
    const { sessionId } = req.params;
    const { is_takeover, assigned_to } = req.body;
    const cleanKey = String(sessionId || '').replace(/[^a-zA-Z0-9]/g, '');
    const takeoverMap = readTakeoverMap();

    takeoverMap[cleanKey] = {
      is_takeover: Boolean(is_takeover),
      assigned_to: assigned_to || 'Senior Support Specialist',
      updated_at: new Date().toISOString()
    };
    saveTakeoverMap(takeoverMap);

    return res.json({
      success: true,
      sessionId: cleanKey,
      is_human_takeover: Boolean(is_takeover),
      assigned_to: takeoverMap[cleanKey].assigned_to,
      message: is_takeover 
        ? '🤖 AI Agent paused for this contact. Human agent has full manual control.'
        : '⚡ AI Agent resumed autonomous consultative replies.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/team/reply
 */
export async function sendHumanAgentReply(req, res) {
  try {
    const { botId, recipientPhone, message } = req.body;
    if (!recipientPhone || !message) {
      return res.status(400).json({ success: false, error: 'Recipient phone and message are required' });
    }

    const cleanPhone = String(recipientPhone).replace(/[^a-zA-Z0-9]/g, '');
    
    // Auto-set takeover mode when human sends message
    const takeoverMap = readTakeoverMap();
    takeoverMap[cleanPhone] = {
      is_takeover: true,
      assigned_to: req.tenant?.email || 'Live Human Specialist',
      updated_at: new Date().toISOString()
    };
    saveTakeoverMap(takeoverMap);

    // Send via WhatsApp
    try {
      const baileysModule = await import('../services/baileysService.js');
      if (baileysModule.sendWhatsAppMessage) {
        await baileysModule.sendWhatsAppMessage(botId || 'bot-ec0db899', recipientPhone, message);
      }
    } catch (sendErr) {
      console.warn('WhatsApp send warning:', sendErr.message);
    }

    return res.json({
      success: true,
      message: 'Human reply recorded and sent',
      is_human_takeover: true
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
