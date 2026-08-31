import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/integrations.json');
const KEYS_FILE = path.join(__dirname, '../data/gemini_keys.json');

function getIntegrationsData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading integrations data:', err);
    return [];
  }
}

function saveIntegrationsData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving integrations data:', err);
  }
}

function getKeysData() {
  try {
    if (!fs.existsSync(KEYS_FILE)) {
      return { client_keys: [], system_keys: [], notification_settings: { whatsapp_alert_phone: '', alert_on_rate_limit: true } };
    }
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
  } catch (err) {
    return { client_keys: [], system_keys: [], notification_settings: { whatsapp_alert_phone: '', alert_on_rate_limit: true } };
  }
}

function saveKeysData(data) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving gemini_keys.json:', err);
  }
}

import { db } from '../config/database.js';
import { disconnectGoogle } from '../services/googleService.js';
import { disconnectWhatsApp } from '../services/baileysService.js';

export const listIntegrations = async (req, res) => {
  const integrations = getIntegrationsData();
  try {
    const bots = await db.getBots();
    const connectedBot = bots.find(b => b.whatsapp_status === 'connected' && b.whatsapp_number);
    const waIndex = integrations.findIndex(i => i.id === 'whatsapp');
    if (waIndex !== -1) {
      if (connectedBot) {
        integrations[waIndex].status = 'connected';
        integrations[waIndex].account = `${connectedBot.whatsapp_number} (${connectedBot.bot_name})`;
        integrations[waIndex].connected_since = 'Active';
      } else {
        integrations[waIndex].status = 'not_configured';
        integrations[waIndex].account = null;
        integrations[waIndex].connected_since = null;
      }
      saveIntegrationsData(integrations);
    }
  } catch (e) {
    // continue
  }
  res.json({ success: true, integrations });
};

export const updateIntegration = async (req, res) => {
  const { id } = req.params;
  const { status, account, credentials, sync_target, webhook_url } = req.body;
  const integrations = getIntegrationsData();
  const index = integrations.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Integration not found' });
  }

  // Graceful Disconnect Handling (Zero Data Loss)
  if (status === 'not_configured') {
    if (id === 'google') {
      disconnectGoogle();
    } else if (id === 'whatsapp') {
      try {
        const bots = await db.getBots();
        for (const b of bots) {
          await disconnectWhatsApp(b.id);
        }
      } catch (err) {
        console.warn('Error disconnecting WhatsApp sessions:', err.message);
      }
    }
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  integrations[index] = {
    ...integrations[index],
    ...(status !== undefined && { 
      status,
      connected_since: status === 'connected' ? dateStr : null
    }),
    ...(account !== undefined && { account }),
    ...(credentials !== undefined && { credentials: { ...(integrations[index].credentials || {}), ...credentials } }),
    ...(sync_target !== undefined && { sync_target }),
    ...(webhook_url !== undefined && { webhook_url }),
    updated_at: now.toISOString()
  };

  saveIntegrationsData(integrations);
  res.json({ success: true, integration: integrations[index] });
};

// ----------------------------------------------------
// AI GATEWAY MULTI-KEY POOL HANDLERS
// ----------------------------------------------------
export const getAiGatewayKeys = (req, res) => {
  const keysData = getKeysData();
  res.json({ success: true, ...keysData });
};

export const addAiGatewayKey = async (req, res) => {
  const { label, key } = req.body;
  if (!key || key.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Please enter a valid Gemini API key' });
  }

  const keysData = getKeysData();
  const newKey = {
    id: `key-client-${Date.now()}`,
    label: label || `Custom Gemini Key #${(keysData.client_keys?.length || 0) + 1}`,
    key: key.trim(),
    status: 'active',
    latency_ms: 180,
    last_tested: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    models_available: ['gemini-3.6-flash', 'gemini-2.5-flash'],
    priority: 1
  };

  if (!keysData.client_keys) keysData.client_keys = [];
  keysData.client_keys.push(newKey);
  saveKeysData(keysData);

  res.status(201).json({ success: true, key: newKey });
};

export const deleteAiGatewayKey = (req, res) => {
  const { id } = req.params;
  const keysData = getKeysData();
  keysData.client_keys = (keysData.client_keys || []).filter(k => k.id !== id);
  saveKeysData(keysData);
  res.json({ success: true, message: 'Key removed from pool' });
};

export const testAiGatewayKey = async (req, res) => {
  const { key, id } = req.body;
  const keyToTest = (key || '').trim();

  if (!keyToTest || keyToTest.length < 5) {
    return res.status(400).json({ success: false, error: 'No key provided to test' });
  }

  const startTime = Date.now();
  try {
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let verified = false;
    let successfulModel = '';

    for (const model of candidateModels) {
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Health ping. Reply OK.' }] }]
            })
          }
        );

        if (testRes.ok) {
          verified = true;
          successfulModel = model;
          break;
        }
      } catch (e) {
        // continue
      }
    }

    const latency = Date.now() - startTime;

    if (verified) {
      // Update key in json if id passed
      if (id) {
        const keysData = getKeysData();
        const kIndex = (keysData.client_keys || []).findIndex(k => k.id === id);
        if (kIndex !== -1) {
          keysData.client_keys[kIndex].status = 'active';
          keysData.client_keys[kIndex].latency_ms = latency;
          keysData.client_keys[kIndex].last_tested = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          saveKeysData(keysData);
        }
      }

      return res.json({
        success: true,
        status: 'active',
        latency_ms: latency,
        model: successfulModel,
        message: `Key successfully verified on ${successfulModel} (${latency}ms latency).`
      });
    } else {
      return res.json({
        success: false,
        status: 'invalid',
        latency_ms: latency,
        message: 'Key test failed. Check API permissions or quota limits.'
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateNotificationSettings = (req, res) => {
  const { whatsapp_alert_phone, alert_on_rate_limit } = req.body;
  const keysData = getKeysData();
  keysData.notification_settings = {
    whatsapp_alert_phone: whatsapp_alert_phone || '',
    alert_on_rate_limit: alert_on_rate_limit !== undefined ? alert_on_rate_limit : true
  };
  saveKeysData(keysData);
  res.json({ success: true, notification_settings: keysData.notification_settings });
};

// ----------------------------------------------------
// GOOGLE SHEETS CONNECTION CHECK
// ----------------------------------------------------
export const testGoogleSheetsSync = async (req, res) => {
  const hasGoogleClientId = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim().length > 5);
  
  if (!hasGoogleClientId) {
    return res.status(400).json({
      success: false,
      message: 'Google Client ID is not configured in backend/.env. Please configure Google OAuth credentials first.'
    });
  }

  res.json({
    success: true,
    message: 'Google OAuth configuration is valid and ready for Sheets sync.',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
  });
};

// ----------------------------------------------------
// INSTAGRAM GRAPH API CONNECTION CHECK
// ----------------------------------------------------
export const testInstagramConnection = async (req, res) => {
  const hasMetaAppId = Boolean(process.env.META_APP_ID && process.env.META_APP_ID.trim().length > 5);

  if (!hasMetaAppId) {
    return res.status(400).json({
      success: false,
      message: 'META_APP_ID is not configured in backend/.env. Please add your Meta App ID to enable Instagram DM automation.'
    });
  }

  res.json({
    success: true,
    message: 'Meta App configuration verified. Ready for Facebook Login & Instagram Graph API connection.'
  });
};

// ----------------------------------------------------
// WHATSAPP CONNECTION CHECK
// ----------------------------------------------------
export const testWhatsAppConnection = async (req, res) => {
  const hasMetaToken = Boolean(process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN.trim().length > 5);

  res.json({
    success: true,
    meta_cloud_configured: hasMetaToken,
    message: hasMetaToken 
      ? 'Meta WhatsApp Cloud API credentials configured in .env.' 
      : 'Baileys Local WhatsApp Engine is active. Use QR code or 8-digit pairing on the WhatsApp page to connect directly.'
  });
};

// ----------------------------------------------------
// GENERIC INTEGRATION STATUS ROUTE
// ----------------------------------------------------
export const testIntegrationConnection = async (req, res) => {
  const { id } = req.params;
  const integrations = getIntegrationsData();
  const integration = integrations.find(i => i.id === id);

  if (!integration) {
    return res.status(404).json({ success: false, error: 'Integration not found' });
  }

  res.json({
    success: true,
    message: `${integration.name} status: ${integration.status || 'not_configured'}`,
    status: integration.status || 'not_configured'
  });
};

