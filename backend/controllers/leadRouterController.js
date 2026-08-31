import db from '../config/database.js';
import * as dealModel from '../models/dealModel.js';
import { readTakeoverMap, saveTakeoverMap } from '../services/humanTakeoverService.js';
import { logTaskExecution } from '../services/taskEngine.js';

// Predefined or dynamic team agents for round-robin assignment
const HUMAN_SALES_AGENTS = [
  { id: 'agent-1', name: 'Suresh Polai (Senior Solutions Lead)', email: 'suresh@novabyte.ai', phone: '+919820646838' },
  { id: 'agent-2', name: 'Vikram Mehta (Enterprise Account Exec)', email: 'vikram@novabyte.ai', phone: '+919876543210' },
  { id: 'agent-3', name: 'Ananya Sharma (Consultative Closing Specialist)', email: 'ananya@novabyte.ai', phone: '+919811122233' }
];

let roundRobinIndex = 0;

/**
 * Get next human agent in Round-Robin order
 */
export function getNextHumanAgent() {
  const agent = HUMAN_SALES_AGENTS[roundRobinIndex % HUMAN_SALES_AGENTS.length];
  roundRobinIndex++;
  return agent;
}

/**
 * Intent & Buying Readiness Scoring Engine (0 - 100)
 */
export function calculateLeadIntentScore(text = '', extractedData = {}) {
  let score = 25; // Base baseline
  const lower = String(text).toLowerCase();

  // 1. Explicit Human Request (+50)
  if (/human|agent|person|representative|manager|speak to someone|call me|talk to a human/i.test(lower)) {
    score += 50;
  }

  // 2. High Purchase / Decision Intent (+35)
  if (/buy|purchase|pricing|quote|cost|contract|enterprise|budget|ready to start|hire|invoice|payment/i.test(lower)) {
    score += 35;
  }

  // 3. Project Specificity (+20)
  if (/website|chatbot|automation|crm|saas|api|integration|whatsapp bot/i.test(lower)) {
    score += 20;
  }

  // 4. Contact Details Provided (+25)
  if (/@/.test(lower) || /(\+?\d{1,4}[-.\s]?)?\d{10}/.test(lower)) {
    score += 25;
  }

  // 5. Timeline Urgency (+15)
  if (/urgent|asap|this week|immediately|today|tomorrow/i.test(lower)) {
    score += 15;
  }

  // 6. Generic or Negative Low Intent (-15)
  if (/^(hi|hello|hey|test|kuch nahi|spam)\b/i.test(lower) && lower.length < 15) {
    score -= 15;
  }

  // Bound score between 0 and 100
  return Math.min(100, Math.max(5, score));
}

/**
 * Evaluate and perform Smart Split Routing for a Lead
 */
export async function evaluateAndRouteLead({
  leadData = {},
  initialMessage = '',
  botId = 'bot-ec0db899',
  tenantId = 'default-tenant'
}) {
  const text = initialMessage || leadData.requirement || leadData.notes || '';
  const score = calculateLeadIntentScore(text, leadData);

  let category = '❄️ Cold';
  if (score >= 70) {
    category = '🔥 Hot';
  } else if (score >= 35) {
    category = '⚡ Warm';
  }

  const isExplicitHumanRequest = /human|agent|person|representative|manager|call me/i.test(text);
  const shouldRouteToHuman = score >= 70 || isExplicitHumanRequest;

  let assignedAgent = null;
  let createdDeal = null;

  const cleanPhone = String(leadData.phone || leadData.lead_phone || '').replace(/[^a-zA-Z0-9]/g, '');

  if (shouldRouteToHuman && cleanPhone) {
    // 1. Assign to next Sales Agent via Round-Robin
    assignedAgent = getNextHumanAgent();

    // 2. Activate Human Takeover to immediately pause AI Bot for this contact
    const takeoverMap = readTakeoverMap();
    takeoverMap[cleanPhone] = {
      is_takeover: true,
      assigned_to: assignedAgent.name,
      assigned_agent_id: assignedAgent.id,
      assigned_at: new Date().toISOString(),
      lead_score: score,
      lead_category: category,
      auto_routed: true
    };
    saveTakeoverMap(takeoverMap);

    // 3. Automatically Create High-Priority Deal Card in CRM
    try {
      createdDeal = dealModel.createDeal({
        title: `Enterprise Opportunity: ${leadData.name || 'Qualified Prospect'}`,
        contact_name: leadData.name || 'Qualified Prospect',
        contact_phone: leadData.phone || '',
        contact_email: leadData.email || '',
        value: score >= 85 ? 2500 : 1200,
        stage: 'qualified',
        notes: `Smart Split Auto-Handoff (Score: ${score}/100 - ${category}). Intent: "${text}"`,
        tenant_id: tenantId
      });
    } catch (dealErr) {
      console.warn('Auto deal creation notice:', dealErr.message);
    }

    // 4. Log Audit Event in Task Engine
    logTaskExecution({
      type: 'qualification',
      title: `Smart Handoff: ${leadData.name || cleanPhone} ➔ ${assignedAgent.name}`,
      status: 'completed',
      payload: {
        score,
        category,
        assigned_to: assignedAgent.name,
        deal_id: createdDeal?.id || null
      }
    });
  }

  return {
    lead_phone: cleanPhone,
    score,
    category,
    route_target: shouldRouteToHuman ? 'HUMAN_SALES_AGENT' : 'AI_AUTONOMOUS_ENGINE',
    is_human_takeover_active: shouldRouteToHuman,
    assigned_agent: assignedAgent,
    created_deal: createdDeal
  };
}

/**
 * POST /api/leads/batch-ingest
 * Ingests 100+ batch leads from CSV / JSON with multi-tenant isolation and Smart Split routing
 */
export async function batchIngestLeads(req, res) {
  try {
    const { leads = [], botId = 'bot-ec0db899' } = req.body;
    const tenantId = req.tenant?.id || 'default-tenant';

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, error: 'leads array cannot be empty' });
    }

    const results = {
      total_received: leads.length,
      ingested_count: 0,
      hot_leads_routed_to_humans: 0,
      warm_cold_leads_routed_to_ai: 0,
      deals_created: 0,
      leads: []
    };

    for (const rawLead of leads) {
      const name = rawLead.name || rawLead.lead_name || 'Prospect';
      const phone = String(rawLead.phone || rawLead.mobile || rawLead.lead_phone || '').trim();
      const email = rawLead.email || rawLead.lead_email || null;
      const requirement = rawLead.requirement || rawLead.notes || rawLead.message || 'Batch Imported Lead';

      if (!phone && !email) continue;

      // 1. Save Lead into Central DB
      const createdLead = await db.createLead({
        bot_id: botId,
        user_id: tenantId,
        tenant_id: tenantId,
        lead_name: name,
        lead_phone: phone,
        lead_email: email,
        lead_requirement: requirement,
        channel: rawLead.channel || 'batch_import',
        status: 'new'
      });

      // 2. Perform Smart Split Evaluation
      const routingResult = await evaluateAndRouteLead({
        leadData: { name, phone, email, requirement },
        initialMessage: requirement,
        botId,
        tenantId
      });

      if (routingResult.route_target === 'HUMAN_SALES_AGENT') {
        results.hot_leads_routed_to_humans++;
        if (routingResult.created_deal) results.deals_created++;
      } else {
        results.warm_cold_leads_routed_to_ai++;
      }

      results.ingested_count++;
      results.leads.push({
        id: createdLead.id,
        name,
        phone,
        email,
        score: routingResult.score,
        category: routingResult.category,
        route_target: routingResult.route_target,
        assigned_agent: routingResult.assigned_agent?.name || 'NovaByte Autonomous AI'
      });
    }

    return res.status(201).json({
      success: true,
      message: `Batch lead ingestion complete. ${results.ingested_count} leads processed with Smart Split.`,
      metrics: {
        total_ingested: results.ingested_count,
        hot_human_handoffs: results.hot_leads_routed_to_humans,
        ai_autonomous_leads: results.warm_cold_leads_routed_to_ai,
        deals_created: results.deals_created
      },
      leads_sample: results.leads.slice(0, 10)
    });
  } catch (err) {
    console.error('Batch lead ingestion error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/leads/evaluate-route
 * Real-time endpoint to evaluate a single message and perform Smart Split
 */
export async function evaluateSingleLeadRoute(req, res) {
  try {
    const { leadData, message, botId } = req.body;
    const tenantId = req.tenant?.id || 'default-tenant';

    const result = await evaluateAndRouteLead({
      leadData: leadData || {},
      initialMessage: message || '',
      botId: botId || 'bot-ec0db899',
      tenantId
    });

    return res.json({ success: true, routing: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
