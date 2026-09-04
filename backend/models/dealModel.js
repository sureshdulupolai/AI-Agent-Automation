import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEALS_FILE = path.join(__dirname, '../data/deals.json');

/**
 * Read deals from JSON storage
 */
export function readDeals() {
  try {
    if (!fs.existsSync(DEALS_FILE)) {
      fs.writeFileSync(DEALS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(DEALS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading deals.json:', err);
    return [];
  }
}

/**
 * Save deals to JSON storage
 */
export function saveDeals(deals) {
  try {
    fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving deals.json:', err);
    return false;
  }
}

/**
 * Create a new deal card
 */
export function createDeal({
  title = '',
  contact_name = '',
  contact_phone = '',
  contact_email = '',
  value = 0,
  stage = 'new_deal', // 'new_deal' | 'qualified' | 'proposal_sent' | 'closed_won' | 'closed_lost'
  lead_score = 50,
  lead_temperature = '⚡ Warm',
  source = 'whatsapp_ai',
  notes = '',
  assigned_to = 'Senior Solutions Lead'
}) {
  const deals = readDeals();
  const newDeal = {
    id: `deal-${uuidv4().substring(0, 8)}`,
    title: title || `Deal: ${contact_name || 'Prospect'}`,
    contact_name,
    contact_phone,
    contact_email,
    value: Number(value) || 0,
    stage: stage || 'new_deal',
    lead_score: Number(lead_score) || 50,
    lead_temperature: lead_temperature || '⚡ Warm',
    source: source || 'whatsapp_ai',
    notes: notes || '',
    assigned_to: assigned_to || 'AI Agent / Sales Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  deals.unshift(newDeal);
  saveDeals(deals);
  return newDeal;
}

/**
 * Update deal stage (for Drag-and-Drop or Stage Click)
 */
export function updateDealStage(dealId, newStage) {
  const deals = readDeals();
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  deal.stage = newStage;
  deal.updated_at = new Date().toISOString();
  saveDeals(deals);
  return deal;
}

/**
 * Update any deal properties
 */
export function updateDeal(dealId, updates) {
  const deals = readDeals();
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  Object.assign(deal, updates, { updated_at: new Date().toISOString() });
  saveDeals(deals);
  return deal;
}

/**
 * Delete deal
 */
export function deleteDeal(dealId) {
  const deals = readDeals();
  const filtered = deals.filter(d => d.id !== dealId);
  if (filtered.length === deals.length) return false;
  saveDeals(filtered);
  return true;
}
