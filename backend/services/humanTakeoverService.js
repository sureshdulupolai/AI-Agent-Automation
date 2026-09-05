import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TAKEOVER_FILE = path.join(__dirname, '../data/human_takeover.json');

// In-memory cache for ultra-fast lookup (avoids repetitive disk I/O on rapid messages)
let memoryCache = null;

function normalizeKey(targetId) {
  return String(targetId || '').replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Load takeover map from disk or return in-memory cache
 */
export function readTakeoverMap() {
  if (memoryCache !== null) {
    return { ...memoryCache };
  }

  try {
    if (!fs.existsSync(TAKEOVER_FILE)) {
      const parentDir = path.dirname(TAKEOVER_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(TAKEOVER_FILE, JSON.stringify({}));
      memoryCache = {};
      return {};
    }
    const raw = fs.readFileSync(TAKEOVER_FILE, 'utf-8');
    memoryCache = JSON.parse(raw || '{}');
    return { ...memoryCache };
  } catch (err) {
    memoryCache = {};
    return {};
  }
}

/**
 * Save takeover map to memory cache and persist to disk
 */
export function saveTakeoverMap(data) {
  try {
    memoryCache = { ...data };
    const parentDir = path.dirname(TAKEOVER_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(TAKEOVER_FILE, JSON.stringify(memoryCache, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving takeover map:', err);
    return false;
  }
}

/**
 * Record an outbound message from a human agent/business owner.
 * Automatically silences the AI bot for this contact for the specified duration (default: 120 mins).
 */
export function recordHumanOutbound(targetId, durationMinutes = 120, assignedTo = 'Business Owner (Mobile)') {
  if (!targetId) return false;
  const cleanKey = normalizeKey(targetId);
  if (!cleanKey) return false;

  const map = readTakeoverMap();
  const expiresAt = Date.now() + (durationMinutes * 60 * 1000);

  const entry = {
    is_takeover: true,
    assigned_to: assignedTo,
    updated_at: new Date().toISOString(),
    expires_at: expiresAt,
    source: 'human_outbound'
  };

  map[cleanKey] = entry;

  // Also index by last 10 digits if applicable for cross-format consistency
  if (cleanKey.length > 10) {
    const last10 = cleanKey.slice(-10);
    map[last10] = entry;
  }

  saveTakeoverMap(map);
  console.log(`👤 [HUMAN TAKEOVER ENGAGED] ${targetId} is now managed by ${assignedTo} (AI muted for ${durationMinutes}m)`);
  return true;
}

/**
 * Check if a specific phone or sessionId is currently in Human Takeover mode.
 * Auto-expires if the silence timer has passed.
 */
export function isHumanTakeoverActive(targetId) {
  if (!targetId) return false;
  const cleanKey = normalizeKey(targetId);
  if (!cleanKey) return false;

  const map = readTakeoverMap();
  let entry = map[cleanKey];

  // If not found by full cleanKey, try matching by last 10 digits
  if (!entry && cleanKey.length >= 10) {
    const last10 = cleanKey.slice(-10);
    entry = map[last10];
  }

  if (!entry || !entry.is_takeover) {
    return false;
  }

  // Check expiration if expires_at is present
  if (entry.expires_at && Date.now() > entry.expires_at) {
    console.log(`⏰ [HUMAN TAKEOVER EXPIRED] Resuming AI automation for ${targetId}`);
    entry.is_takeover = false;
    map[cleanKey] = entry;
    saveTakeoverMap(map);
    return false;
  }

  return true;
}

/**
 * Clear/resume AI automation for a contact
 */
export function clearHumanTakeover(targetId) {
  if (!targetId) return false;
  const cleanKey = normalizeKey(targetId);
  const map = readTakeoverMap();

  if (map[cleanKey]) {
    map[cleanKey].is_takeover = false;
    map[cleanKey].updated_at = new Date().toISOString();
  }
  if (cleanKey.length > 10) {
    const last10 = cleanKey.slice(-10);
    if (map[last10]) {
      map[last10].is_takeover = false;
      map[last10].updated_at = new Date().toISOString();
    }
  }

  saveTakeoverMap(map);
  console.log(`⚡ [AI RESUMED] AI automation unmuted for ${targetId}`);
  return true;
}

