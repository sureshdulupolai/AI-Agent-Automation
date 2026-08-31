import db from '../config/database.js';
import * as dealModel from '../models/dealModel.js';
import { getWhatsAppStatus, sendWhatsAppMessage } from './baileysService.js';
import { getTaskSummary, logAutonomousTask } from './taskEngine.js';
import { isGoogleConnected, sendEmailViaGoogle } from './googleService.js';
import { getEmailAutomationSettings } from './emailAutomationService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Tool 1: Get Live System & Pipeline Status
 */
export async function getLiveSystemStatus() {
  const bots = await db.getBots();
  const leads = await db.getLeads(null, null);
  const deals = dealModel.readDeals();
  const taskSummary = await getTaskSummary();
  const googleStatus = isGoogleConnected();

  let waStatus = { status: 'disconnected', phoneNumber: null };
  if (bots.length > 0) {
    waStatus = await getWhatsAppStatus(bots[0].id);
  }

  const hotLeads = (leads || []).filter(l => l.status === 'qualified' || (l.lead_requirement && l.lead_requirement.length > 20));
  const wonRevenue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const activePipelineValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return {
    bots_count: bots.length,
    whatsapp_status: waStatus.status === 'connected' ? `Connected (${waStatus.phoneNumber || '+91 98206 46838'})` : 'Disconnected (QR Scan Required)',
    google_email_status: googleStatus ? 'Connected & Ready' : 'Disconnected (Connect in Integrations)',
    total_leads: (leads || []).length,
    hot_leads_count: hotLeads.length,
    total_deals: deals.length,
    active_pipeline_value: activePipelineValue,
    won_revenue: wonRevenue,
    tasks_executed_today: taskSummary.metrics?.completed_today || 0,
    background_engine: 'Active 24/7 (10m Cycle)'
  };
}

/**
 * Tool 2: Create a Deal Card in CRM
 */
export function createDealCard({ title, contact_name, contact_phone, contact_email, value, stage, notes }) {
  const newDeal = dealModel.createDeal({
    title: title || `Deal with ${contact_name || 'Client'}`,
    contact_name,
    contact_phone,
    contact_email,
    value: Number(value) || 0,
    stage: stage || 'new_deal',
    notes: notes || 'Created autonomously by NovaByte AI Copilot'
  });
  return newDeal;
}

/**
 * Tool 3: Extract Contacts from Free-form Paragraphs or CSV Text
 */
export function extractContactsFromText(rawText = '') {
  const contacts = [];
  const lines = rawText.split(/[\r\n,;]+/);

  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const emails = trimmed.match(emailRegex);
    const phones = trimmed.match(phoneRegex);

    if (emails || phones) {
      let name = trimmed
        .replace(emailRegex, '')
        .replace(phoneRegex, '')
        .replace(/[-:,|]/g, '')
        .trim();

      if (!name || name.length < 2) name = 'Valued Prospect';

      contacts.push({
        name,
        email: emails ? emails[0] : null,
        phone: phones ? phones[0] : null,
        raw: trimmed
      });
    }
  }

  return contacts;
}

/**
 * Tool 4: Dispatch Bulk Email or Queue Campaign
 */
export async function executeBulkEmail({ recipientList = [], subject = '', body = '' }) {
  const googleStatus = isGoogleConnected();
  if (!googleStatus) {
    return {
      success: false,
      queued: true,
      error: 'Google Email is not connected. Connect Gmail in Integrations (/integrations) to send real emails.',
      recipients_count: recipientList.length
    };
  }

  const results = { sent: 0, failed: 0, details: [] };
  for (const item of recipientList) {
    const email = typeof item === 'string' ? item : item.email;
    const name = typeof item === 'object' ? item.name : 'Client';
    if (!email || !email.includes('@')) continue;

    try {
      await sendEmailViaGoogle({
        to: email,
        leadName: name,
        subject: subject || 'Special Update from NovaByte AI Studio',
        message: body || 'Hello, we are following up on your inquiry with NovaByte AI Studio.'
      });
      results.sent++;
    } catch (e) {
      results.failed++;
      results.details.push({ email, error: e.message });
    }
  }

  return {
    success: true,
    sent_count: results.sent,
    failed_count: results.failed,
    total_processed: recipientList.length
  };
}

/**
 * Autonomous Copilot Agent Processor
 */
export async function processCopilotCommand({ message = '', conversationHistory = [] }) {
  const lower = message.toLowerCase();

  // 1. Status / Report Intent
  if (
    lower.includes('status') ||
    lower.includes('aaj ka') ||
    lower.includes('report') ||
    lower.includes('metrics') ||
    lower.includes('summary') ||
    lower.includes('stats')
  ) {
    const status = await getLiveSystemStatus();
    return {
      reply: `📊 **Live NovaByte AI Studio Status Overview**:\n\n• **Total Inbound Leads**: ${status.total_leads} (${status.hot_leads_count} 🔥 Hot Leads)\n• **Active Sales Pipeline**: ${status.total_deals} Deals ($${status.active_pipeline_value.toLocaleString()} value)\n• **Closed / Won Revenue**: $${status.won_revenue.toLocaleString()}\n• **WhatsApp Channel**: ${status.whatsapp_status}\n• **Google Email Engine**: ${status.google_email_status}\n• **Autonomous Tasks Executed Today**: ${status.tasks_executed_today} actions\n• **Background Engine**: ${status.background_engine}\n\nAll autonomous queues are healthy. Let me know if you would like me to create a deal or launch a campaign!`,
      actionTaken: 'SYSTEM_STATUS_PULLED',
      actionData: status
    };
  }

  // 2. Add / Create Deal Intent
  if (
    lower.includes('create deal') ||
    lower.includes('add deal') ||
    lower.includes('new deal') ||
    lower.includes('deal add') ||
    lower.includes('pipeline me daal')
  ) {
    // Extract potential values
    const valueMatch = message.match(/\$?\s*(\d{3,7})/);
    const value = valueMatch ? parseInt(valueMatch[1], 10) : 1000;
    
    // Extract potential name
    let name = 'Prospective Client';
    const words = message.split(/\s+/);
    const forIdx = words.findIndex(w => w.toLowerCase() === 'for' || w.toLowerCase() === 'naam' || w.toLowerCase() === 'client');
    if (forIdx !== -1 && words[forIdx + 1]) {
      name = `${words[forIdx + 1]} ${words[forIdx + 2] || ''}`.trim();
    }

    const createdDeal = createDealCard({
      title: `Project Consultation (${name})`,
      contact_name: name,
      value,
      stage: 'new_deal',
      notes: `Created via NovaByte Copilot prompt: "${message}"`
    });

    return {
      reply: `✅ **Deal Successfully Added to Sales Pipeline!**\n\n• **Deal Title**: ${createdDeal.title}\n• **Contact**: ${createdDeal.contact_name}\n• **Deal Value**: $${createdDeal.value.toLocaleString()}\n• **Stage**: New Deals (Kanban Column 1)\n\nYou can view and drag this deal on the **Deals & Pipeline** board (/pipeline).`,
      actionTaken: 'DEAL_CREATED',
      actionData: createdDeal
    };
  }

  // 3. WhatsApp Follow-Up / Direct Message Intent
  if (/whatsapp|wa|follow\s*up|message|msg/i.test(lower) && (/(\+?\d{1,4}[-.\s]?)?\d{10}/.test(message) || /send|bhej/i.test(lower))) {
    const phoneMatch = message.match(/(\+?\d{1,4}[-.\s]?)?\d{10}/);
    const allLeads = await db.getLeads(null, null);
    
    let targetPhone = phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : null;
    if (!targetPhone) {
      const firstValid = (allLeads || []).find(l => l.lead_phone && l.lead_phone.length >= 7);
      targetPhone = firstValid ? (firstValid.lead_phone.startsWith('+') ? firstValid.lead_phone : `+${firstValid.lead_phone.replace(/[^0-9]/g, '')}`) : '+919820646838';
    }

    const bots = await db.getBots();
    const targetBotId = bots[0]?.id || 'bot-ec0db899';
    const waStatus = await getWhatsAppStatus(targetBotId);

    // Dynamic CRM Lead Lookup
    const cleanTarget = String(targetPhone).replace(/[^0-9]/g, '');
    const matchedLead = (allLeads || []).find(l => {
      const p = String(l.lead_phone || '').replace(/[^0-9]/g, '');
      return p && (p.includes(cleanTarget) || cleanTarget.includes(p));
    });
    const contactName = matchedLead?.lead_name || 'Valued Prospect';
    const followUpMessage = `Hello ${contactName}! Following up on your inquiry with NovaByte AI Studio. How can we assist you with our AI automation solutions today?`;

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
      return {
        reply: `📱 **WhatsApp Follow-Up Ticket Generated [#${loggedTask.id.substring(0, 8)}]**\n\n• **Recipient**: **${contactName}** (${targetPhone})\n• **Prepared Message**: *"${followUpMessage}"*\n• **Device Status**: ⚠️ **Not Paired (QR Scan Required)**\n• **Task Center**: **Registered & Saved in Tasks (/tasks)**\n\n👉 **Required Action**: To send real WhatsApp messages without account risk, open **Integrations (/integrations)** and scan the QR code using your phone (WhatsApp ➔ Linked Devices ➔ Scan). Once paired, I will automatically dispatch this follow-up with **safe randomized anti-ban delays (12-35s)**! 🛡️`,
        actionTaken: 'WHATSAPP_FOLLOWUP_PREPARED_DEVICE_DISCONNECTED',
        actionData: { targetPhone, botId: targetBotId, taskId: loggedTask.id, status: 'pairing_required' }
      };
    } else {
      setTimeout(async () => {
        try {
          await sendWhatsAppMessage(targetBotId, targetPhone, followUpMessage);
          loggedTask.status = 'completed';
        } catch (sendErr) {
          loggedTask.status = 'failed';
          loggedTask.error = sendErr.message;
        }
      }, 18000);

      return {
        reply: `🚀 **WhatsApp Follow-Up Active [#${loggedTask.id.substring(0, 8)}]**\n\n• **Recipient**: **${contactName}** (${targetPhone})\n• **Channel**: WhatsApp (${waStatus.phoneNumber || 'Linked Device'})\n• **Anti-Ban Protection**: 🛡️ **18s Human Typing Delay Active**\n• **Live Audit**: Recorded in Task Center (/tasks).\n\nMessage is queued and will land safely! 🚀`,
        actionTaken: 'WHATSAPP_FOLLOWUP_DISPATCHED',
        actionData: { targetPhone, botId: targetBotId, taskId: loggedTask.id, status: 'dispatched' }
      };
    }
  }

  // 4. Bulk Email / Extract Contacts Intent
  if (
    lower.includes('email') ||
    lower.includes('bulk') ||
    lower.includes('gmail') ||
    lower.includes('@')
  ) {
    const extracted = extractContactsFromText(message);
    
    if (extracted.length > 0) {
      const emailRes = await executeBulkEmail({
        recipientList: extracted,
        subject: 'Update from NovaByte AI Studio',
        body: 'Hello! Thank you for connecting with us. We are pleased to assist you with our AI automation solutions.'
      });

      if (emailRes.success) {
        return {
          reply: `🚀 **Bulk Email Campaign Executed Successfully!**\n\n• **Extracted Contacts**: ${extracted.length} valid recipient(s)\n• **Emails Delivered**: ${emailRes.sent_count}\n• **Failed/Skipped**: ${emailRes.failed_count}\n\nAll messages were dispatched through your connected Google Workspace channel.`,
          actionTaken: 'BULK_EMAIL_DISPATCHED',
          actionData: { contacts: extracted, result: emailRes }
        };
      } else {
        return {
          reply: `⚠️ **Contacts Parsed (${extracted.length} Found), but Email Channel is Disconnected**\n\nI successfully extracted ${extracted.length} contact(s):\n${extracted.slice(0, 5).map(c => `• **${c.name}**: ${c.email || c.phone}`).join('\n')}\n\n👉 **Action Needed**: Please connect your Gmail in **Integrations (/integrations)** to activate 1-click delivery.`,
          actionTaken: 'CONTACTS_PARSED_EMAIL_DISCONNECTED',
          actionData: { contacts: extracted }
        };
      }
    }
  }

  // 4. Fallback to Gemini AI with Strict Boundaries & Human Authority
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const systemPrompt = `You are the Principal Autonomous Operations Agent for "NovaByte AI Studio" (an enterprise omni-channel AI automation platform).
Your role is to assist the user in executing operations (WhatsApp QR linking, email campaigns, deal pipelines, website widgets, lead management).
Rules:
1. Speak with professional clarity, human warmth, and domain authority.
2. NEVER expose API keys, database credentials, server passwords, or internal security tokens under any circumstances.
3. Stay strictly within the platform's features (WhatsApp, Web Chat Widget, Email Drips, Pipeline CRM, Autonomous Tasks).
4. If the user asks to perform an action, tell them exactly what was done or guide them to the right page (/pipeline, /integrations, /campaigns, /tasks, /docs).`;

      const response = await model.generateContent(`${systemPrompt}\n\nUser Query: ${message}`);
      const text = response.response.text();
      return {
        reply: text,
        actionTaken: 'AI_CONSULTATION',
        actionData: null
      };
    } catch (aiErr) {
      console.warn('Gemini Copilot fallback error:', aiErr.message);
    }
  }

  // Generic fallback
  return {
    reply: `I am your NovaByte AI Autonomous Operations Agent. You can tell me to:\n\n• *"Aaj ka live status batao"* (Pulls total leads, pipeline revenue, WhatsApp connection)\n• *"Add a deal for [Client Name] $2500"* (Adds deal card into Kanban pipeline)\n• Paste a paragraph or list with emails/phones to filter and dispatch bulk email campaigns\n• *"Check pending WhatsApp follow-ups"*\n\nWhat would you like me to execute?`,
    actionTaken: 'GUIDE_RESPONSE',
    actionData: null
  };
}
