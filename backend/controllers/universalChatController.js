import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { processUniversalChat, autoSynthesizeProfileFromDescription, synthesizeSystemPrompt } from '../services/universalBrain.js';
import { logAutonomousTask } from '../services/taskEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_FILE = path.join(__dirname, '../data/universal_profiles.json');
const CREDITS_FILE = path.join(__dirname, '../data/simulator_credits.json');

/**
 * Helper to read credit usage per bot
 */
function readCredits() {
  try {
    if (!fs.existsSync(CREDITS_FILE)) {
      fs.writeFileSync(CREDITS_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(fs.readFileSync(CREDITS_FILE, 'utf-8'));
  } catch (err) {
    return {};
  }
}

/**
 * Helper to write credit usage
 */
function saveCredits(data) {
  try {
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Get credit statistics with persistent 10 free token tier + ₹0.60/inquiry billing
 */
export function getCreditStats(botId = 'global') {
  const credits = readCredits();
  const key = botId || 'global';
  // Isolate credits per bot: each model has its own independent 10 free inquiries
  const record = credits[key] || { usedCount: 0 };
  const freeLimit = 10;
  const pricePerQuery = 0.60;
  const usedCount = Number(record.usedCount) || 0;
  const freeRemaining = Math.max(0, freeLimit - usedCount);
  const paidCount = Math.max(0, usedCount - freeLimit);
  const accruedCost = Number((paidCount * pricePerQuery).toFixed(2));

  return {
    botId: key,
    freeLimit,
    usedCount,
    freeRemaining,
    paidCount,
    pricePerQuery,
    accruedCost,
    currency: 'INR',
    currencySymbol: '₹'
  };
}

/**
 * Consume 1 test query credit persistently
 */
export function incrementCreditUsage(botId = 'global') {
  const credits = readCredits();
  const key = botId || 'global';
  const current = credits[key] || { usedCount: 0 };
  const newUsed = (Number(current.usedCount) || 0) + 1;
  credits[key] = {
    ...current,
    usedCount: newUsed,
    updated_at: new Date().toISOString()
  };
  saveCredits(credits);
  return getCreditStats(key);
}

/**
 * Helper to read universal profiles
 */
function readProfiles() {
  try {
    if (!fs.existsSync(PROFILES_FILE)) {
      fs.writeFileSync(PROFILES_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
  } catch (err) {
    return {};
  }
}

/**
 * Helper to write universal profiles
 */
function saveProfiles(data) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Internal safe profile retriever/synthesizer
 */
export async function getProfileForBot(botId) {
  try {
    const profiles = readProfiles();
    const bot = botId ? await db.getBotById(botId).catch(() => null) : null;

    if (botId && profiles[botId]) {
      const existing = profiles[botId];
      if (bot) {
        existing.business_name = bot.bot_name || existing.business_name;
        // Prioritize actual system instructions from the database bot record
        if (bot.system_instructions && bot.system_instructions.trim()) {
          existing.direct_prompt = bot.system_instructions;
        }
      }
      return existing;
    }

    const defaultProfile = {
      business_name: bot?.bot_name || 'NovaByte AI Studio',
      industry_category: bot?.industry || 'Full-Stack Web & AI Automation',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      fulfillment_type: 'custom_quote',
      direct_prompt_enabled: Boolean(bot?.system_instructions?.trim()),
      direct_prompt: bot?.system_instructions || '',
      core_offerings: [
        {
          name: 'Custom High-Converting Websites',
          category: 'Web Development',
          pricing_type: 'tier_based',
          price_range: '$499 - $999',
          turnaround: '3 to 7 Days',
          description: 'Modern Next.js / React responsive web platforms with SEO.',
          required_fields: ['project_scope', 'target_launch_date']
        },
        {
          name: '24/7 Autonomous WhatsApp & Web AI Chatbots',
          category: 'AI Automation',
          pricing_type: 'tier_based',
          price_range: '$399 - $899',
          turnaround: '24 to 48 Hours',
          description: 'Automated lead qualification, instant FAQs, and appointment scheduling.',
          required_fields: ['business_category', 'whatsapp_number']
        }
      ],
      qualification_rules: [
        { field_key: 'project_budget', label: 'Budget Range', is_mandatory: true, prompt_nudge: 'Ask about budget expectations' },
        { field_key: 'timeline', label: 'Target Delivery Date', is_mandatory: false, prompt_nudge: 'Ask about desired launch deadline' }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
        location_address: 'Global Remote & Virtual Consultations',
        payment_terms: '50% deposit, 50% upon final verified deployment.',
        custom_policies: 'Full technical support and warranty on all deployments.'
      }
    };

    if (botId) {
      profiles[botId] = defaultProfile;
      saveProfiles(profiles);
    }
    return defaultProfile;
  } catch (err) {
    return {
      business_name: 'NovaByte AI Studio',
      industry_category: 'Full-Stack Web & AI Automation',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      direct_prompt: '',
      core_offerings: []
    };
  }
}

/**
 * GET /api/universal/profile/:botId
 */
export async function getBusinessProfile(req, res) {
  try {
    const { botId } = req.params;
    const profile = await getProfileForBot(botId);
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/universal/profile/:botId
 */
export async function updateBusinessProfile(req, res) {
  try {
    const { botId } = req.params;
    const newProfile = req.body;
    const profiles = readProfiles();

    profiles[botId] = {
      ...newProfile,
      updated_at: new Date().toISOString()
    };
    saveProfiles(profiles);

    // Sync bot record system instructions and knowledge
    try {
      const fullSynthesizedPrompt = synthesizeSystemPrompt(newProfile);
      await db.updateBot(botId, {
        bot_name: newProfile.business_name || undefined,
        system_instructions: fullSynthesizedPrompt,
        business_knowledge: JSON.stringify(newProfile.policies_and_faqs || {})
      });
    } catch (e) {
      console.warn('Could not sync to bot DB record:', e.message);
    }

    return res.json({ success: true, profile: profiles[botId] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/universal/credits/:botId
 * Persistent credit tracker for simulator queries (10 free, then ₹0.60/inquiry)
 */
export async function getCreditsStatus(req, res) {
  try {
    const { botId } = req.params;
    const stats = getCreditStats(botId);
    return res.json({ success: true, ...stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/universal/generate-profile
 */
export async function autoGenerateProfile(req, res) {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Business description prompt is required' });
    }

    const synthesized = await autoSynthesizeProfileFromDescription(description);
    return res.json({ success: true, profile: synthesized });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/universal/chat
 * Dual-Action Inbound Chat Processor (WhatsApp, Web, Simulator)
 */
export async function handleUniversalInboundChat(req, res) {
  try {
    const { botId, userMessage, history, media, senderPhone, senderName, channel = 'simulator', apiKeyOverride } = req.body;
    const profile = await getProfileForBot(botId);

    // Persistent credit tracking for simulator testing
    let creditUsage = null;
    if (channel === 'universal_simulator' || channel === 'simulator') {
      creditUsage = incrementCreditUsage(botId || 'global');
    }

    const result = await processUniversalChat({
      businessProfile: profile,
      userMessage,
      history: history || [],
      media: media || null,
      apiKeyOverride: apiKeyOverride || null
    });

    // If lead phone or email or name was detected and score >= 40, auto-capture / update lead
    const extracted = result.extracted_parameters || {};
    const leadPhone = extracted.phone || senderPhone;
    const leadEmail = extracted.email;
    const leadName = extracted.name || senderName || 'Website Visitor';

    if (leadPhone || leadEmail) {
      try {
        await db.createLead({
          bot_id: botId || 'bot-universal',
          lead_name: leadName,
          lead_phone: leadPhone || null,
          lead_email: leadEmail || null,
          lead_requirement: userMessage,
          channel: channel || 'universal_ai',
          status: result.readiness_score > 70 ? 'qualified' : 'new',
          notes: `Intent: ${result.intent} | Score: ${result.readiness_score}/100 | Temp: ${result.lead_temperature}`
        });

        // Log task
        logAutonomousTask({
          type: 'qualification',
          title: `Autonomous Lead Qualification: ${leadName} (${result.lead_temperature})`,
          channel: channel,
          recipient: leadPhone || leadEmail,
          status: 'completed',
          metadata: {
            intent: result.intent,
            readiness_score: result.readiness_score,
            lead_temperature: result.lead_temperature,
            missing_fields: result.missing_fields
          }
        });
      } catch (e) {}
    }

    return res.json({
      ...result,
      creditUsage: creditUsage || getCreditStats(botId || 'global')
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
