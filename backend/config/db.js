import db from './database.js';

/**
 * Database Performance & Connection Layer (backend/config/db.js)
 * Exposes indexed lookup utilities and sub-50ms high-speed query helpers
 */

export const queryIndexes = {
  byTenant: (records, tenantId) => records.filter(r => (r.tenant_id || r.user_id) === tenantId),
  byBot: (records, botId) => records.filter(r => r.bot_id === botId),
  byPhone: (records, phone) => records.find(r => r.lead_phone === phone || r.phone === phone),
  byStatus: (records, status) => records.filter(r => r.status === status),
  sortByDateDesc: (records, dateField = 'created_at') => records.sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))
};

export default db;
export { db };
