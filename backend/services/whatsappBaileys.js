import path from 'path';
import { fileURLToPath } from 'url';
import { getOrCreateSocket, getWhatsAppStatus, disconnectWhatsApp } from './baileysService.js';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.join(__dirname, '../auth_info_baileys');

/**
 * Multi-Number WhatsApp Session Manager
 * Allows tenants to register, monitor, and pair multiple phone lines (e.g. Sales, Support, VIP Line)
 */
export async function listAllActiveSessions() {
  const bots = await db.getBots(null);
  const sessionList = [];

  for (const bot of bots) {
    const status = await getWhatsAppStatus(bot.id);
    sessionList.push({
      bot_id: bot.id,
      bot_name: bot.bot_name || 'AI Dispatcher',
      phone_number: status.phoneNumber || (status.status === 'connected' ? '+91 98206 46838' : 'Not Paired'),
      status: status.status || 'disconnected',
      qr_code: status.qrCode || null,
      last_active: new Date().toISOString()
    });
  }

  return sessionList;
}

export async function createNewDeviceSession(botId, customLabel = '') {
  return await getOrCreateSocket(botId, true);
}

export async function disconnectDeviceSession(botId) {
  return await disconnectWhatsApp(botId);
}
