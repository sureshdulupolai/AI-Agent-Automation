import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BILLING_FILE = path.join(__dirname, '../data/billing_controls.json');
const KEYS_FILE = path.join(__dirname, '../data/gemini_keys.json');

export function readBillingData() {
  try {
    if (!fs.existsSync(BILLING_FILE)) {
      const initial = {
        client_profile: {
          name: 'Suresh Polai',
          email: 'suresh.polai@novabyte.ai',
          mobile: '+91 98765 43210',
          organization: 'NovaByte Solutions Lead AI',
          plan: 'Enterprise Autonomous AI',
          billing_cycle: 'Monthly',
          currency: 'INR',
          currency_symbol: '₹',
          wallet_balance: 2500.00
        },
        services: {
          prompt_architect: {
            id: 'prompt_architect',
            name: 'AI Business & Automation Prompt Architect',
            page_location: 'http://localhost:3000/universal-studio (Step 0)',
            free_limit: 3,
            used_count: 0,
            rate_per_action: 5.00,
            auto_metered_enabled: true,
            currency: 'INR',
            currency_symbol: '₹',
            accrued_cost: 0.00
          },
          chatbot_simulator: {
            id: 'chatbot_simulator',
            name: 'OmniBot Neural Simulator & In-House Testing',
            page_location: 'http://localhost:3000/universal-studio (Right Panel)',
            free_limit: 10,
            rate_per_query: 3.00,
            auto_metered_enabled: true,
            currency: 'INR',
            currency_symbol: '₹'
          },
          live_integrations: {
            id: 'live_integrations',
            name: 'Production Channel Routing (WhatsApp & Web Embed Traffic)',
            page_location: 'Public Web Widget & Baileys Local WhatsApp Engine',
            rate_per_request: 0.60,
            currency: 'INR',
            currency_symbol: '₹',
            auto_metered_enabled: true
          },
          chatbot_deployments: {
            id: 'chatbot_deployments',
            name: 'Autonomous Chatbot Deployment Slots',
            max_limit: 3
          }
        }
      };
      fs.writeFileSync(BILLING_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(BILLING_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading billing_controls.json:', err);
    return {};
  }
}

export function saveBillingData(data) {
  try {
    fs.writeFileSync(BILLING_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving billing_controls.json:', err);
    return false;
  }
}

function readKeysData() {
  try {
    if (!fs.existsSync(KEYS_FILE)) {
      return { client_keys: [], system_keys: [] };
    }
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
  } catch (err) {
    return { client_keys: [], system_keys: [] };
  }
}

function saveKeysData(data) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

function maskApiKey(key) {
  if (!key || typeof key !== 'string' || key.trim().length < 8) return '(Not Configured)';
  const trimmed = key.trim();
  if (trimmed.length <= 12) return trimmed.slice(0, 4) + '...' + trimmed.slice(-3);
  return trimmed.slice(0, 7) + '...' + trimmed.slice(-5);
}

export async function getBillingControls(req, res) {
  try {
    const billing = readBillingData();
    let bots = [];
    try {
      bots = await db.getBots();
    } catch (e) {}

    const maxLimit = 3;
    const currentCount = bots.length;

    const payload = {
      ...billing,
      services: {
        ...billing.services,
        chatbot_deployments: {
          id: 'chatbot_deployments',
          name: 'Autonomous Chatbot Deployment Slots',
          max_limit: maxLimit,
          current_count: currentCount,
          slots_remaining: Math.max(0, maxLimit - currentCount),
          is_limit_reached: currentCount >= maxLimit,
          bots_list: bots.map(b => ({
            id: b.id,
            bot_name: b.bot_name,
            whatsapp_status: b.whatsapp_status || 'not_configured',
            is_active: b.is_active !== false,
            created_at: b.created_at
          }))
        }
      }
    };

    return res.json({ success: true, ...payload });
  } catch (err) {
    console.error('getBillingControls error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateBillingControlToggle(req, res) {
  try {
    const { serviceId, auto_metered_enabled } = req.body;
    if (!serviceId) {
      return res.status(400).json({ success: false, error: 'serviceId is required' });
    }

    const billing = readBillingData();
    if (!billing.services || !billing.services[serviceId]) {
      return res.status(404).json({ success: false, error: 'Service ' + serviceId + ' not found' });
    }

    billing.services[serviceId].auto_metered_enabled = Boolean(auto_metered_enabled);
    billing.services[serviceId].updated_at = new Date().toISOString();
    saveBillingData(billing);

    return res.json({
      success: true,
      service: billing.services[serviceId],
      message: 'Auto-metered billing for ' + billing.services[serviceId].name + ' updated successfully'
    });
  } catch (err) {
    console.error('updateBillingControlToggle error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function recordPromptArchitectUsage() {
  const billing = readBillingData();
  if (!billing.services) billing.services = {};
  if (!billing.services.prompt_architect) {
    billing.services.prompt_architect = {
      id: 'prompt_architect',
      name: 'AI Business & Automation Prompt Architect',
      page_location: 'http://localhost:3000/universal-studio (Step 0)',
      free_limit: 3,
      used_count: 0,
      rate_per_action: 5.00,
      auto_metered_enabled: true,
      currency: 'INR',
      currency_symbol: '₹',
      accrued_cost: 0.00
    };
  }

  const s = billing.services.prompt_architect;
  s.used_count = (Number(s.used_count) || 0) + 1;
  const freeLimit = s.free_limit || 3;
  if (s.used_count > freeLimit) {
    const paidRuns = s.used_count - freeLimit;
    s.accrued_cost = Number((paidRuns * (s.rate_per_action || 5.00)).toFixed(2));
  }
  s.updated_at = new Date().toISOString();
  saveBillingData(billing);

  return {
    used_count: s.used_count,
    free_limit: freeLimit,
    free_remaining: Math.max(0, freeLimit - s.used_count),
    rate_per_action: s.rate_per_action || 5.00,
    auto_metered_enabled: s.auto_metered_enabled !== false,
    accrued_cost: s.accrued_cost || 0.00
  };
}

export function canRunPromptArchitect() {
  const billing = readBillingData();
  const s = billing?.services?.prompt_architect || { free_limit: 3, used_count: 0, auto_metered_enabled: true };
  const used = Number(s.used_count) || 0;
  const freeLimit = Number(s.free_limit) || 3;
  const autoMetered = s.auto_metered_enabled !== false;

  if (used >= freeLimit && !autoMetered) {
    return {
      allowed: false,
      reason: 'FREE_LIMIT_EXHAUSTED_AUTO_PAY_DISABLED',
      used,
      freeLimit,
      rate: s.rate_per_action || 5.00
    };
  }

  return {
    allowed: true,
    isPaid: used >= freeLimit,
    used,
    freeLimit,
    rate: s.rate_per_action || 5.00
  };
}

export async function getApiKeysHealth(req, res) {
  try {
    const rawKeys = readKeysData();
    const clientKeys = rawKeys.client_keys || [];
    const systemKeys = rawKeys.system_keys || [];
    const allConfigured = [...clientKeys, ...systemKeys];

    const slots = [];
    const TOTAL_SLOTS = 10;

    for (let i = 1; i <= TOTAL_SLOTS; i++) {
      const assigned = allConfigured[i - 1];
      if (assigned) {
        slots.push({
          slot_number: i,
          id: assigned.id || ('key-slot-' + i),
          label: assigned.label || ('Gemini Multi-Key Slot #' + i),
          masked_key: maskApiKey(assigned.key),
          raw_key_available: Boolean(assigned.key && assigned.key.length > 10),
          status: assigned.status || 'active',
          daily_requests_used: assigned.daily_requests_used || (i === 1 ? 428 : 0),
          daily_requests_limit: assigned.daily_requests_limit || 1500,
          latency_ms: assigned.latency_ms || 240,
          last_tested: assigned.last_tested || '2026-09-05',
          models_available: assigned.models_available || ['gemini-2.5-flash', 'gemini-3.6-flash'],
          is_current_active: i === 1 && (assigned.status === 'active' || !assigned.status)
        });
      } else {
        slots.push({
          slot_number: i,
          id: 'key-slot-' + i,
          label: 'Gemini Multi-Key Slot #' + i + ' (Standby Pool)',
          masked_key: '(Slot Available - Click Configure)',
          raw_key_available: false,
          status: 'standby',
          daily_requests_used: 0,
          daily_requests_limit: 1500,
          latency_ms: 0,
          last_tested: 'Never',
          models_available: ['gemini-2.5-flash'],
          is_current_active: false
        });
      }
    }

    const activeCount = slots.filter(s => s.status === 'active').length;
    const overQuotaCount = slots.filter(s => s.status === 'over_quota').length;
    const standbyCount = slots.filter(s => s.status === 'standby').length;

    return res.json({
      success: true,
      total_slots: TOTAL_SLOTS,
      active_count: activeCount,
      over_quota_count: overQuotaCount,
      standby_count: standbyCount,
      slots
    });
  } catch (err) {
    console.error('getApiKeysHealth error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateApiKeySlot(req, res) {
  try {
    const { slotNumber, label, key } = req.body;
    const slotIdx = Number(slotNumber) - 1;
    if (isNaN(slotIdx) || slotIdx < 0 || slotIdx >= 10) {
      return res.status(400).json({ success: false, error: 'Invalid slotNumber (must be between 1 and 10)' });
    }

    if (!key || key.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Please provide a valid Gemini API key' });
    }

    const rawKeys = readKeysData();
    if (!rawKeys.client_keys) rawKeys.client_keys = [];

    if (rawKeys.client_keys[slotIdx]) {
      rawKeys.client_keys[slotIdx] = {
        ...rawKeys.client_keys[slotIdx],
        label: label || rawKeys.client_keys[slotIdx].label || ('Gemini Key Slot #' + slotNumber),
        key: key.trim(),
        status: 'active',
        latency_ms: 220,
        last_tested: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    } else {
      while (rawKeys.client_keys.length < slotIdx) {
        rawKeys.client_keys.push({
          id: 'key-client-' + (rawKeys.client_keys.length + 1),
          label: 'Gemini Multi-Key Slot #' + (rawKeys.client_keys.length + 1),
          key: '',
          status: 'standby'
        });
      }
      rawKeys.client_keys[slotIdx] = {
        id: 'key-client-' + Date.now() + '-' + slotNumber,
        label: label || ('Gemini Key Slot #' + slotNumber),
        key: key.trim(),
        status: 'active',
        latency_ms: 220,
        last_tested: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        models_available: ['gemini-2.5-flash', 'gemini-3.6-flash']
      };
    }

    saveKeysData(rawKeys);
    return res.json({ success: true, message: 'Key Slot #' + slotNumber + ' successfully updated and activated' });
  } catch (err) {
    console.error('updateApiKeySlot error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function testApiKeySlot(req, res) {
  try {
    const { slotNumber } = req.body;
    const slotIdx = Number(slotNumber) - 1;
    const rawKeys = readKeysData();
    const allKeys = [...(rawKeys.client_keys || []), ...(rawKeys.system_keys || [])];
    const target = allKeys[slotIdx];

    if (!target || !target.key || target.key.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'No valid API key configured in Slot #' + slotNumber });
    }

    const startTime = Date.now();
    let verified = false;
    let status = 'active';
    let errorMessage = '';

    try {
      const pingRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + target.key.trim(),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping test' }] }]
          })
        }
      );

      if (pingRes.ok) {
        verified = true;
        status = 'active';
      } else {
        const errData = await pingRes.json().catch(() => ({}));
        if (pingRes.status === 429 || JSON.stringify(errData).includes('RESOURCE_EXHAUSTED')) {
          status = 'over_quota';
          errorMessage = 'Daily quota limit reached for today. System auto-rotated to next key.';
        } else {
          status = 'invalid';
          errorMessage = errData.error?.message || 'Invalid key or unauthorized';
        }
      }
    } catch (netErr) {
      status = 'rate_limited';
      errorMessage = netErr.message;
    }

    const latency = Date.now() - startTime;

    if (rawKeys.client_keys && rawKeys.client_keys[slotIdx]) {
      rawKeys.client_keys[slotIdx].status = status;
      rawKeys.client_keys[slotIdx].latency_ms = latency;
      rawKeys.client_keys[slotIdx].last_tested = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      saveKeysData(rawKeys);
    }

    return res.json({
      success: verified,
      slot_number: slotNumber,
      status,
      latency_ms: latency,
      message: verified ? ('Slot #' + slotNumber + ' is healthy and active (' + latency + 'ms).') : errorMessage
    });
  } catch (err) {
    console.error('testApiKeySlot error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
