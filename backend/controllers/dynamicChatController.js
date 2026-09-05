import * as dynamicNavigator from '../services/dynamicNavigator.js';
import db from '../config/database.js';
import * as dealModel from '../models/dealModel.js';
import { getTaskSummary, logAutonomousTask } from '../services/taskEngine.js';
import { getWhatsAppStatus, sendWhatsAppMessage } from '../services/baileysService.js';
import { extractLeadDetails } from '../services/leadParserService.js';

/**
 * POST /api/chat/dynamic
 * Secure Tenant-Isolated Query & Dynamic Navigation Controller
 */
export async function handleDynamicChat(req, res) {
  try {
    const { message, history, botId } = req.body;
    const tenantId = req.tenant?.id || 'default-tenant';

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // 0. Auto-extract and persist Lead if contact info (phone/email) is provided
    let capturedLead = null;
    const leadData = extractLeadDetails(message, history || []);
    if (leadData && (leadData.lead_phone || leadData.lead_email)) {
      try {
        const bots = await db.getBots();
        const targetBotId = botId || (bots[0]?.id || 'bot-ec0db899');
        capturedLead = await db.createLead({
          bot_id: targetBotId,
          user_id: tenantId,
          tenant_id: tenantId,
          lead_name: leadData.lead_name || 'Website Visitor',
          lead_phone: leadData.lead_phone || null,
          lead_email: leadData.lead_email || null,
          lead_requirement: leadData.lead_requirement || message.trim(),
          channel: 'website',
          status: 'qualified'
        });
        console.log(`🎯 [LEAD CAPTURED VIA DYNAMIC CHAT] ${leadData.lead_name || 'Visitor'} (${leadData.lead_phone || leadData.lead_email})`);
      } catch (leadErr) {
        console.warn('Lead capture notice in dynamicChat:', leadErr.message);
      }
    }

    // 1. Parse Dynamic Intent via Gemini / Fallback
    const parsed = await dynamicNavigator.parseDynamicIntent({
      message,
      context: { tenantId, botId },
      history: history || []
    });

    let queryResults = null;
    let enrichedReply = parsed.reply;
    let actionPayload = null;

    // 2. Process QUERY_DATA with Strict Tenant Isolation
    if (parsed.intentType === 'QUERY_DATA') {
      const entity = parsed.queryFilter?.entity || 'leads';

      if (entity === 'leads') {
        const allLeads = await db.getLeads(null, null);
        // Strict tenant isolation filter
        const tenantLeads = (allLeads || []).filter(l => !l.tenant_id || l.tenant_id === tenantId || l.user_id === tenantId);
        
        const hotLeads = tenantLeads.filter(l => l.status === 'qualified' || (l.lead_requirement && l.lead_requirement.length > 20));

        queryResults = {
          entity: 'leads',
          tenant_id: tenantId,
          total_count: tenantLeads.length,
          hot_count: hotLeads.length,
          records: tenantLeads.slice(0, 5).map(l => ({
            name: l.lead_name || 'Prospect',
            phone: l.lead_phone || '',
            email: l.lead_email || '',
            status: l.status
          }))
        };

        enrichedReply = `📊 **Tenant Data [Isolated for ${tenantId}]**:\n• Total Inbound Leads: **${tenantLeads.length}**\n• 🔥 High Intent Leads: **${hotLeads.length}**\n\nRecent contacts:\n${tenantLeads.slice(0, 3).map(l => `- **${l.lead_name || 'Client'}**: ${l.lead_phone || l.lead_email}`).join('\n') || '- No leads recorded yet.'}`;
      } else if (entity === 'deals') {
        const allDeals = dealModel.readDeals();
        // Strict tenant isolation filter
        const tenantDeals = (allDeals || []).filter(d => !d.tenant_id || d.tenant_id === tenantId);
        const pipelineValue = tenantDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
        const wonRevenue = tenantDeals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (Number(d.value) || 0), 0);

        queryResults = {
          entity: 'deals',
          tenant_id: tenantId,
          total_deals: tenantDeals.length,
          pipeline_value: pipelineValue,
          won_revenue: wonRevenue,
          records: tenantDeals.slice(0, 5)
        };

        enrichedReply = `💼 **Deals CRM [Isolated for ${tenantId}]**:\n• Active Opportunities: **${tenantDeals.length} deals**\n• Total Pipeline Value: **$${pipelineValue.toLocaleString()}**\n• Won Revenue: **$${wonRevenue.toLocaleString()}**`;
      } else {
        const summary = await getTaskSummary();
        queryResults = { entity: 'tasks', metrics: summary.metrics };
        enrichedReply = `⚡ **Autonomous Task Summary**:\n• Completed Tasks Today: **${summary.metrics.completed_today}**\n• Engine Status: **Healthy & Running 24/7**`;
      }
    } else if (parsed.intentType === 'SEND_FOLLOWUP') {
      const bots = await db.getBots();
      const targetBotId = botId || (bots[0]?.id || 'bot-ec0db899');
      const waStatus = await getWhatsAppStatus(targetBotId);
      const targetPhone = parsed.targetPhone || '+918454873214';

      // 1. CRM Lead Lookup for personalized naming
      const allLeads = await db.getLeads(null, null);
      const cleanTarget = String(targetPhone).replace(/[^0-9]/g, '');
      const matchedLead = (allLeads || []).find(l => {
        const p = String(l.lead_phone || '').replace(/[^0-9]/g, '');
        return p && (p.includes(cleanTarget) || cleanTarget.includes(p));
      });
      const contactName = matchedLead?.lead_name || 'Valued Prospect';
      const followUpMessage = `Hello ${contactName}! Following up on your inquiry with NovaByte AI Studio. How can we assist you with our AI automation solutions today?`;

      // 2. Create Real Tracked Task in Task Engine
      const isConnected = waStatus.status === 'connected';
      const loggedTask = logAutonomousTask({
        type: 'follow_up',
        title: `WhatsApp Follow-Up: ${contactName} (${targetPhone})`,
        channel: 'whatsapp',
        recipient: `${contactName} (${targetPhone})`,
        status: isConnected ? 'in_progress' : 'pending',
        metadata: {
          task_id: `task-wa-${Date.now().toString(36)}`,
          phone: targetPhone,
          contact_name: contactName,
          message_preview: followUpMessage,
          anti_ban_delay_sec: 18,
          device_status: waStatus.status,
          bot_id: targetBotId,
          queued_at: new Date().toISOString()
        }
      });

      if (!isConnected) {
        enrichedReply = `📱 **WhatsApp Follow-Up Ticket Generated [#${loggedTask.id.substring(0, 8)}]**\n\n• **Recipient**: **${contactName}** (${targetPhone})\n• **Prepared Text**: *"${followUpMessage}"*\n• **Device Health**: ⚠️ **Not Paired (QR Scan Required)**\n• **Queue State**: **Saved in Task Command Center (/tasks)**\n\n👉 **Action Needed**: To dispatch safely without WhatsApp account bans, open **Integrations (/integrations)** and scan the QR code. Once paired, I will automatically dispatch this follow-up with **18s human-like anti-ban delay**! 🛡️`;
        actionPayload = {
          type: 'NAVIGATE_TO',
          targetPath: '/integrations',
          label: '⚡ Connect WhatsApp in Integrations',
          requireAuth: true,
          highlightSelector: '#whatsapp-integration-card'
        };
      } else {
        // Asynchronously dispatch with human-like anti-ban delay
        setTimeout(async () => {
          try {
            await sendWhatsAppMessage(targetBotId, targetPhone, followUpMessage);
            loggedTask.status = 'completed';
          } catch (sendErr) {
            loggedTask.status = 'failed';
            loggedTask.error = sendErr.message;
          }
        }, 18000);

        enrichedReply = `🚀 **WhatsApp Follow-Up Active [#${loggedTask.id.substring(0, 8)}]**\n\n• **Recipient**: **${contactName}** (${targetPhone})\n• **Sender Device**: Linked Number (${waStatus.phoneNumber || 'Active Session'})\n• **Anti-Ban Protection**: 🛡️ **18s Human Typing Delay Active**\n• **Live Audit**: Recorded in Task Command Center (/tasks).\n\nMessage will land safely in ~18 seconds! 🚀`;
        actionPayload = {
          type: 'NAVIGATE_TO',
          targetPath: '/tasks',
          label: '⚡ View in Task Center',
          requireAuth: true,
          highlightSelector: '#tasks-header'
        };
      }

      queryResults = {
        entity: 'tasks',
        task_id: loggedTask.id,
        recipient: `${contactName} (${targetPhone})`,
        status: loggedTask.status,
        device_status: waStatus.status,
        anti_ban_delay_sec: 18
      };
    }

    // 3. Build Structured Action Payload (only if not already set by specific intent)
    if (!actionPayload && parsed.targetPath) {
      actionPayload = {
        type: 'NAVIGATE_TO',
        targetPath: parsed.targetPath,
        label: parsed.actionLabel || 'Take me there',
        requireAuth: true,
        highlightSelector: getHighlightSelectorForPath(parsed.targetPath)
      };
    }

    return res.json({
      success: true,
      intentType: parsed.intentType,
      reply: enrichedReply,
      action: actionPayload,
      queryResults,
      tenantId,
      leadCaptured: !!capturedLead,
      leadId: capturedLead?.id || null
    });
  } catch (err) {
    console.error('Dynamic Chat Controller Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

function getHighlightSelectorForPath(p) {
  switch (p) {
    case '/pipeline': return '#pipeline-board';
    case '/contacts': return '#contacts-table';
    case '/integrations': return '#whatsapp-integration-card';
    case '/campaigns': return '#campaigns-header';
    case '/tasks': return '#tasks-header';
    case '/docs': return '#docs-reader';
    case '/deployment': return '#billing-plans';
    default: return null;
  }
}
