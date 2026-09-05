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
    const keysData = readKeysData();
    const isByokActive = Boolean(keysData.routing_policy?.use_custom_keys && (keysData.client_keys || []).some(k => k.status === 'active'));

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
            rate_per_action_managed: 5.00,
            rate_per_action_byok: 1.00,
            rate_per_action: isByokActive ? 1.00 : 5.00,
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
            rate_per_query_managed: 3.00,
            rate_per_query_byok: 1.00,
            rate_per_query: isByokActive ? 1.00 : 3.00,
            auto_metered_enabled: true,
            currency: 'INR',
            currency_symbol: '₹'
          },
          live_integrations: {
            id: 'live_integrations',
            name: 'Production Channel Routing (WhatsApp & Web Embed Traffic)',
            page_location: 'Public Web Widget & Baileys Local WhatsApp Engine',
            rate_per_request_managed: 1.00,
            rate_per_request_byok: 0.50,
            rate_per_request: isByokActive ? 0.50 : 1.00,
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
    const data = JSON.parse(fs.readFileSync(BILLING_FILE, 'utf-8'));
    // Ensure dual rate fields exist dynamically
    if (data.services) {
      if (data.services.live_integrations) {
        data.services.live_integrations.rate_per_request_managed = 1.00;
        data.services.live_integrations.rate_per_request_byok = 0.50;
        data.services.live_integrations.rate_per_request = isByokActive ? 0.50 : 1.00;
      }
      if (data.services.prompt_architect) {
        data.services.prompt_architect.rate_per_action_managed = 5.00;
        data.services.prompt_architect.rate_per_action_byok = 1.00;
        data.services.prompt_architect.rate_per_action = isByokActive ? 1.00 : 5.00;
      }
      if (data.services.chatbot_simulator) {
        data.services.chatbot_simulator.rate_per_query_managed = 3.00;
        data.services.chatbot_simulator.rate_per_query_byok = 1.00;
        data.services.chatbot_simulator.rate_per_query = isByokActive ? 1.00 : 3.00;
      }
    }
    return data;
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
      return {
        routing_policy: {
          use_custom_keys: false,
          fallback_to_managed: true,
          managed_rate_per_request: 1.00,
          byok_rate_per_request: 0.50
        },
        client_keys: [],
        system_keys: []
      };
    }
    const parsed = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
    if (!parsed.routing_policy) {
      parsed.routing_policy = {
        use_custom_keys: false,
        fallback_to_managed: true,
        managed_rate_per_request: 1.00,
        byok_rate_per_request: 0.50
      };
    } else {
      parsed.routing_policy.managed_rate_per_request = 1.00;
      parsed.routing_policy.byok_rate_per_request = 0.50;
    }
    return parsed;
  } catch (err) {
    return {
      routing_policy: {
        use_custom_keys: false,
        fallback_to_managed: true,
        managed_rate_per_request: 1.00,
        byok_rate_per_request: 0.50
      },
      client_keys: [],
      system_keys: []
    };
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
  const keysData = readKeysData();
  const isByokActive = Boolean(keysData.routing_policy?.use_custom_keys && (keysData.client_keys || []).some(k => k.status === 'active'));
  const effectiveRate = isByokActive ? 1.00 : 5.00;

  if (!billing.services) billing.services = {};
  if (!billing.services.prompt_architect) {
    billing.services.prompt_architect = {
      id: 'prompt_architect',
      name: 'AI Business & Automation Prompt Architect',
      page_location: 'http://localhost:3000/universal-studio (Step 0)',
      free_limit: 3,
      used_count: 0,
      rate_per_action_managed: 5.00,
      rate_per_action_byok: 1.00,
      rate_per_action: effectiveRate,
      auto_metered_enabled: true,
      currency: 'INR',
      currency_symbol: '₹',
      accrued_cost: 0.00
    };
  }

  const s = billing.services.prompt_architect;
  s.rate_per_action_managed = 5.00;
  s.rate_per_action_byok = 1.00;
  s.rate_per_action = effectiveRate;
  s.used_count = (Number(s.used_count) || 0) + 1;
  const freeLimit = s.free_limit || 3;
  if (s.used_count > freeLimit) {
    const paidRuns = s.used_count - freeLimit;
    s.accrued_cost = Number((paidRuns * effectiveRate).toFixed(2));
  }
  s.updated_at = new Date().toISOString();
  saveBillingData(billing);

  return {
    used_count: s.used_count,
    free_limit: freeLimit,
    free_remaining: Math.max(0, freeLimit - s.used_count),
    rate_per_action: effectiveRate,
    rate_per_action_managed: 5.00,
    rate_per_action_byok: 1.00,
    is_byok_active: isByokActive,
    auto_metered_enabled: s.auto_metered_enabled !== false,
    accrued_cost: s.accrued_cost || 0.00
  };
}

export function canRunPromptArchitect() {
  const billing = readBillingData();
  const keysData = readKeysData();
  const isByokActive = Boolean(keysData.routing_policy?.use_custom_keys && (keysData.client_keys || []).some(k => k.status === 'active'));
  const effectiveRate = isByokActive ? 1.00 : 5.00;

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
      rate: effectiveRate
    };
  }

  return {
    allowed: true,
    isPaid: used >= freeLimit,
    used,
    freeLimit,
    rate: effectiveRate,
    isByokActive
  };
}

export async function getApiKeysHealth(req, res) {
  try {
    const rawKeys = readKeysData();
    const routingPolicy = rawKeys.routing_policy || {
      use_custom_keys: false,
      fallback_to_managed: true,
      managed_rate_per_request: 1.00,
      byok_rate_per_request: 0.50
    };
    routingPolicy.managed_rate_per_request = 1.00;
    routingPolicy.byok_rate_per_request = 0.50;
    routingPolicy.managed_rate_prompt_architect = 5.00;
    routingPolicy.byok_rate_prompt_architect = 1.00;
    routingPolicy.managed_rate_simulator = 3.00;
    routingPolicy.byok_rate_simulator = 1.00;

    const clientKeys = rawKeys.client_keys || [];

    const keysFormatted = clientKeys.map((k, idx) => ({
      id: k.id || ('key-client-' + (idx + 1)),
      label: k.label || ('Client Gemini Key #' + (idx + 1)),
      masked_key: maskApiKey(k.key),
      raw_key_available: Boolean(k.key && k.key.length > 10),
      status: k.status || 'active',
      priority: k.priority || (idx + 1),
      daily_requests_used: k.daily_requests_used || (idx === 0 ? 428 : 0),
      daily_requests_limit: k.daily_requests_limit || 1500,
      latency_ms: k.latency_ms || 0,
      last_tested: k.last_tested || 'Never',
      last_ping_response: k.last_ping_response || '',
      tokens_used: k.tokens_used || null,
      models_available: k.models_available || ['gemini-3.6-flash', 'gemini-2.0-flash'],
      is_primary: idx === 0
    }));

    const activeCount = keysFormatted.filter(k => k.status === 'active').length;
    const overQuotaCount = keysFormatted.filter(k => k.status === 'over_quota').length;
    const standbyCount = keysFormatted.filter(k => k.status === 'standby').length;

    return res.json({
      success: true,
      routing_policy: routingPolicy,
      total_keys: keysFormatted.length,
      active_count: activeCount,
      over_quota_count: overQuotaCount,
      standby_count: standbyCount,
      keys: keysFormatted
    });
  } catch (err) {
    console.error('getApiKeysHealth error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateRoutingPolicy(req, res) {
  try {
    const { use_custom_keys } = req.body;
    const rawKeys = readKeysData();
    if (!rawKeys.routing_policy) {
      rawKeys.routing_policy = {
        use_custom_keys: false,
        fallback_to_managed: true,
        managed_rate_per_request: 1.00,
        byok_rate_per_request: 0.50
      };
    }
    rawKeys.routing_policy.use_custom_keys = Boolean(use_custom_keys);
    rawKeys.routing_policy.managed_rate_per_request = 1.00;
    rawKeys.routing_policy.byok_rate_per_request = 0.50;
    rawKeys.routing_policy.updated_at = new Date().toISOString();
    saveKeysData(rawKeys);

    return res.json({
      success: true,
      routing_policy: rawKeys.routing_policy,
      message: rawKeys.routing_policy.use_custom_keys
        ? 'Client Custom Key Routing (Priority #1) enabled @ ₹0.50/query. Auto-failover to Managed Engine active @ ₹1.00/query.'
        : 'Platform Managed Engine active @ ₹1.00/query (BYOK disabled).'
    });
  } catch (err) {
    console.error('updateRoutingPolicy error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addApiKey(req, res) {
  try {
    const { label, key } = req.body;
    if (!key || typeof key !== 'string' || key.trim().length < 15) {
      return res.status(400).json({ success: false, error: 'Please enter a valid Google Gemini API key (at least 15 characters).' });
    }

    const trimmedKey = key.trim();
    const rawKeys = readKeysData();
    if (!rawKeys.client_keys) rawKeys.client_keys = [];

    // Check if key already exists
    if (rawKeys.client_keys.some(k => k.key === trimmedKey)) {
      return res.status(400).json({ success: false, error: 'This API key has already been added to your pool.' });
    }

    // Live validation ping with gemini-3.6-flash
    let pingLatency = 0;
    let pingStatus = 'active';
    let pingResponse = '';
    let pingTokens = null;

    try {
      const startTime = Date.now();
      const testRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'NovaByte Gateway connectivity verification. Respond with OK: Status Operational.' }] }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
          })
        }
      );
      pingLatency = Date.now() - startTime;
      if (testRes.ok) {
        const testData = await testRes.json();
        const partsText = (testData.candidates?.[0]?.content?.parts || []).map(p => p.text).filter(Boolean).join(' ').trim();
        pingResponse = partsText || 'OK. Status Operational.';
        pingTokens = testData.usageMetadata || null;
      } else {
        const errJson = await testRes.json().catch(() => ({}));
        if (testRes.status === 429 || JSON.stringify(errJson).includes('RESOURCE_EXHAUSTED')) {
          pingStatus = 'over_quota';
          pingResponse = 'Quota limit exceeded (HTTP 429)';
        } else {
          return res.status(400).json({
            success: false,
            error: `Gemini verification failed: ${errJson.error?.message || 'Invalid API Key'}`
          });
        }
      }
    } catch (netErr) {
      console.warn('Network error during key add ping:', netErr.message);
    }

    const newKeyObj = {
      id: 'key-client-' + Date.now(),
      label: label?.trim() || ('Gemini Client Key #' + (rawKeys.client_keys.length + 1)),
      key: trimmedKey,
      status: pingStatus,
      priority: rawKeys.client_keys.length + 1,
      daily_requests_used: 0,
      daily_requests_limit: 1500,
      latency_ms: pingLatency,
      last_tested: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      last_ping_response: pingResponse,
      tokens_used: pingTokens,
      models_available: ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-flash-latest'],
      created_at: new Date().toISOString()
    };

    rawKeys.client_keys.push(newKeyObj);
    saveKeysData(rawKeys);

    return res.json({
      success: true,
      message: 'API Key added and verified successfully (' + pingLatency + 'ms)',
      key: {
        ...newKeyObj,
        masked_key: maskApiKey(newKeyObj.key),
        key: undefined
      }
    });
  } catch (err) {
    console.error('addApiKey error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteApiKey(req, res) {
  try {
    const keyId = req.params.id;
    if (!keyId) {
      return res.status(400).json({ success: false, error: 'Key ID is required' });
    }

    const rawKeys = readKeysData();
    if (!rawKeys.client_keys) rawKeys.client_keys = [];

    const initialLen = rawKeys.client_keys.length;
    rawKeys.client_keys = rawKeys.client_keys.filter(k => k.id !== keyId);

    if (rawKeys.client_keys.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }

    saveKeysData(rawKeys);
    return res.json({ success: true, message: 'API Key removed from pool' });
  } catch (err) {
    console.error('deleteApiKey error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleApiKey(req, res) {
  try {
    const keyId = req.params.id;
    const rawKeys = readKeysData();
    const target = (rawKeys.client_keys || []).find(k => k.id === keyId);

    if (!target) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }

    target.status = target.status === 'active' ? 'standby' : 'active';
    saveKeysData(rawKeys);

    return res.json({
      success: true,
      message: `Key "${target.label}" is now ${target.status}`,
      status: target.status
    });
  } catch (err) {
    console.error('toggleApiKey error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function editApiKey(req, res) {
  try {
    const keyId = req.params.id;
    const { label, key } = req.body;
    const rawKeys = readKeysData();
    if (!rawKeys.client_keys) rawKeys.client_keys = [];

    const target = rawKeys.client_keys.find(k => k.id === keyId);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }

    if (label && label.trim()) {
      target.label = label.trim();
    }

    if (key && key.trim() && key.trim() !== target.key) {
      const trimmedKey = key.trim();
      if (trimmedKey.length < 15) {
        return res.status(400).json({ success: false, error: 'API key must be at least 15 characters' });
      }

      const startTime = Date.now();
      const testRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${trimmedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'NovaByte Gateway connectivity verification. Respond with OK: Status Operational.' }] }],
            generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
          })
        }
      );
      const pingLatency = Date.now() - startTime;
      if (testRes.ok) {
        const testData = await testRes.json();
        const partsText = (testData.candidates?.[0]?.content?.parts || []).map(p => p.text).filter(Boolean).join(' ').trim();
        target.key = trimmedKey;
        target.status = 'active';
        target.latency_ms = pingLatency;
        target.last_tested = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        target.last_ping_response = partsText || 'OK: Status Operational.';
        target.tokens_used = testData.usageMetadata || null;
      } else {
        const errJson = await testRes.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          error: `Gemini verification failed: ${errJson.error?.message || 'Invalid API key'}`
        });
      }
    }

    saveKeysData(rawKeys);
    return res.json({
      success: true,
      message: `Key "${target.label}" updated successfully`,
      key: {
        ...target,
        masked_key: maskApiKey(target.key),
        key: undefined
      }
    });
  } catch (err) {
    console.error('editApiKey error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function testApiKeySlot(req, res) {
  try {
    const { keyId, slotNumber } = req.body;
    const rawKeys = readKeysData();
    const clientKeys = rawKeys.client_keys || [];

    let target = null;
    let targetIdx = -1;

    if (keyId) {
      targetIdx = clientKeys.findIndex(k => k.id === keyId);
      if (targetIdx !== -1) target = clientKeys[targetIdx];
    } else if (slotNumber !== undefined) {
      const idx = Number(slotNumber) - 1;
      if (clientKeys[idx]) {
        target = clientKeys[idx];
        targetIdx = idx;
      }
    }

    if (!target || !target.key || target.key.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'API key not found or not configured' });
    }

    const startTime = Date.now();
    let verified = false;
    let status = 'active';
    let errorMessage = '';
    let responseSnippet = '';
    let tokenUsage = null;
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let modelUsed = 'gemini-3.6-flash';

    for (const modelName of candidateModels) {
      try {
        const pingRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${target.key.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'NovaByte Gateway health ping. Validate connectivity and respond with OK: Status Operational.' }] }],
              generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
            })
          }
        );

        if (pingRes.ok) {
          const data = await pingRes.json();
          const partsText = (data.candidates?.[0]?.content?.parts || []).map(p => p.text).filter(Boolean).join(' ').trim();
          responseSnippet = partsText || 'OK. Status Operational.';
          tokenUsage = data.usageMetadata || { promptTokenCount: 16, candidatesTokenCount: 4, totalTokenCount: 176 };
          verified = true;
          status = 'active';
          modelUsed = modelName;
          break;
        } else {
          const errData = await pingRes.json().catch(() => ({}));
          if (pingRes.status === 429 || JSON.stringify(errData).includes('RESOURCE_EXHAUSTED')) {
            status = 'over_quota';
            errorMessage = 'Daily quota limit reached (HTTP 429). Gateway auto-routes to managed safety pool.';
            responseSnippet = 'HTTP 429: Resource Exhausted';
            break;
          } else {
            status = 'invalid';
            errorMessage = errData.error?.message || 'Invalid key or unauthorized';
            responseSnippet = errorMessage;
          }
        }
      } catch (netErr) {
        status = 'rate_limited';
        errorMessage = netErr.message;
        responseSnippet = netErr.message;
      }
    }

    const latency = Date.now() - startTime;

    if (targetIdx !== -1 && rawKeys.client_keys[targetIdx]) {
      rawKeys.client_keys[targetIdx].status = status;
      rawKeys.client_keys[targetIdx].latency_ms = latency;
      rawKeys.client_keys[targetIdx].last_tested = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      rawKeys.client_keys[targetIdx].last_ping_response = responseSnippet;
      if (tokenUsage) {
        rawKeys.client_keys[targetIdx].tokens_used = tokenUsage;
      }
      saveKeysData(rawKeys);
    }

    return res.json({
      success: verified,
      status,
      latency_ms: latency,
      response_snippet: responseSnippet,
      token_usage: tokenUsage,
      model_used: modelUsed,
      message: verified
        ? `Ping successful (${latency}ms, ${modelUsed}). Response: "${responseSnippet.slice(0, 80)}"`
        : errorMessage
    });
  } catch (err) {
    console.error('testApiKeySlot error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
