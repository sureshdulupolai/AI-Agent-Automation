import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TAKEOVER_FILE = path.join(__dirname, '../data/human_takeover.json');

/**
 * Read human takeover map
 */
export function readTakeoverMap() {
  try {
    if (!fs.existsSync(TAKEOVER_FILE)) {
      fs.writeFileSync(TAKEOVER_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(fs.readFileSync(TAKEOVER_FILE, 'utf-8'));
  } catch (err) {
    return {};
  }
}

/**
 * Save human takeover map
 */
export function saveTakeoverMap(data) {
  try {
    fs.writeFileSync(TAKEOVER_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Check if a specific phone or sessionId is currently in Human Takeover mode
 */
export function isHumanTakeoverActive(targetId) {
  const map = readTakeoverMap();
  const cleanKey = String(targetId || '').replace(/[^a-zA-Z0-9]/g, '');
  return Boolean(map[cleanKey] && map[cleanKey].is_takeover === true);
}
