import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Database Engine Toggle: USE_SUPABASE=true (Supabase Cloud DB) or USE_SUPABASE=false (Local Embedded DB)
const useSupabase = process.env.USE_SUPABASE === 'true';

let supabase = null;
if (useSupabase && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    supabase = createClient(process.env.SUPABASE_URL, key);
    console.log('✅ Supabase PostgreSQL Client connected successfully (USE_SUPABASE=true).');
  } catch (err) {
    console.error('⚠️ Supabase connection error, falling back to local DB:', err.message);
    supabase = null;
  }
} else {
  console.log(`ℹ️ Local DB Engine active (USE_SUPABASE=${process.env.USE_SUPABASE || 'false'}). Zero cloud setup needed.`);
}

// Initial seed data for out-of-the-box instant readiness
const initialSeedData = {
  users: [
    {
      id: 'usr-demo-1',
      email: 'demo@omnibot.io',
      password_hash: '$2a$10$wN3bZ5.P/x8q5wE4/rU8QOPv7YV7mK0n8qGkL4s6x4K7h6u9.1w3u', // password: password123
      full_name: 'Alex Vance',
      business_name: 'Apex Digital Solutions',
      plan_tier: 'pro',
      created_at: new Date().toISOString()
    }
  ],
  bots: [
    {
      id: 'bot-apex-agency',
      user_id: 'usr-demo-1',
      bot_name: 'Apex AI Growth Assistant',
      bot_avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      primary_color: '#4f46e5',
      welcome_message: 'Hi there! 👋 Welcome to Apex Digital. Looking to build a high-converting website, custom SaaS, or AI automation? How can I help you today?',
      placeholder_text: 'Ask about our services, pricing, or book a demo...',
      quick_prompts: [
        'What services do you offer?',
        'How much does a custom SaaS cost?',
        'Can I schedule a free discovery call?'
      ],
      system_instructions: 'You are the official AI representative for Apex Digital Solutions. You are friendly, consultative, concise, and focused on qualifying potential clients. Always encourage users to provide their email or WhatsApp phone number so the technical team can prepare a custom project proposal.',
      business_knowledge: `COMPANY: Apex Digital Solutions
SERVICES:
1. Full-Stack Web & SaaS Development: Custom React/Node/Python apps, enterprise dashboards. Pricing: $2,500 - $15,000.
2. AI Chatbot & WhatsApp Automation: Custom RAG bots, CRM integrations, Lead scoring. Pricing: $999 - $3,500.
3. High-Converting Landing Pages: Next.js + Tailwind, 95+ PageSpeed score. Pricing: $1,200.
TIMELINE: Most projects are delivered in 2 to 4 weeks with weekly sprint updates.
FREE OFFER: Free 30-minute technical architecture consultation for qualified inquiries.
CONTACT: sales@apexdigital.io | WhatsApp: +1 (555) 019-2834`,
      allowed_domains: ['*'],
      whatsapp_number: '+15550192834',
      whatsapp_status: 'connected',
      whatsapp_type: 'qr',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'bot-glowcare-dental',
      user_id: 'usr-demo-1',
      bot_name: 'GlowCare Dental Concierge',
      bot_avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      primary_color: '#0891b2',
      welcome_message: 'Welcome to GlowCare Dental Studio! 🦷 Need help booking an appointment, checking treatments, or understanding pricing?',
      placeholder_text: 'Ask about teeth whitening, implants, or booking...',
      quick_prompts: [
        'Teeth Whitening options & pricing',
        'Do you accept insurance?',
        'Book an appointment'
      ],
      system_instructions: 'You are the gentle, reassuring AI assistant for GlowCare Dental Clinic. Guide patients through treatments, emergency hours, and capture their contact number for booking confirmations.',
      business_knowledge: `CLINIC: GlowCare Dental & Implant Studio
HOURS: Mon-Sat: 9:00 AM - 7:00 PM | Sun: Emergency by appointment only.
POPULAR TREATMENTS:
- Laser Teeth Whitening: $299 (Takes 45 mins, 8 shades brighter)
- Invisible Clear Aligners: Starting from $1,800 or $99/month
- Root Canal Therapy (Painless): $450
- Dental Implants (Titanium + Zirconia Crown): $1,400
INSURANCE: We accept major PPO insurance plans and offer 0% interest financing.
LOCATION: 450 Medical Plaza, Suite 300. Phone: +1 (555) 749-0122`,
      allowed_domains: ['*'],
      whatsapp_number: '+15557490122',
      whatsapp_status: 'disconnected',
      whatsapp_type: 'qr',
      is_active: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  leads: [
    {
      id: 'lead-1',
      bot_id: 'bot-apex-agency',
      user_id: 'usr-demo-1',
      lead_name: 'Marcus Sterling',
      lead_phone: '+1 (555) 234-8901',
      lead_email: 'marcus@sterlingventures.com',
      lead_requirement: 'Interested in building an AI-powered B2B real estate dashboard with automated lead routing.',
      channel: 'website',
      status: 'qualified',
      session_id: 'sess-seed-01',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'lead-2',
      bot_id: 'bot-apex-agency',
      user_id: 'usr-demo-1',
      lead_name: 'Priya Sharma',
      lead_phone: '+91 98765 43210',
      lead_email: 'priya@zenithapp.in',
      lead_requirement: 'Needs WhatsApp bot with Gemini AI for customer support & order status tracking.',
      channel: 'whatsapp',
      status: 'new',
      session_id: 'sess-seed-02',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      id: 'lead-3',
      bot_id: 'bot-glowcare-dental',
      user_id: 'usr-demo-1',
      lead_name: 'Sarah Jenkins',
      lead_phone: '+1 (555) 438-9921',
      lead_email: 'sarah.j@gmail.com',
      lead_requirement: 'Wants to schedule laser teeth whitening for next Friday afternoon.',
      channel: 'website',
      status: 'contacted',
      session_id: 'sess-seed-03',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    }
  ],
  messages: [
    {
      id: 'msg-1',
      bot_id: 'bot-apex-agency',
      session_id: 'sess-seed-01',
      sender: 'user',
      content: 'Hi, what does it cost to build a custom SaaS MVP?',
      channel: 'website',
      created_at: new Date(Date.now() - 2 * 3600000 - 180000).toISOString()
    },
    {
      id: 'msg-2',
      bot_id: 'bot-apex-agency',
      session_id: 'sess-seed-01',
      sender: 'bot',
      content: 'Our custom SaaS MVPs typically range between $2,500 to $15,000 depending on complexity, features, and integrations. Most MVPs are delivered in 2 to 4 weeks. Would you like to share your project idea or email so we can send you a detailed scope estimate?',
      channel: 'website',
      created_at: new Date(Date.now() - 2 * 3600000 - 150000).toISOString()
    },
    {
      id: 'msg-3',
      bot_id: 'bot-apex-agency',
      session_id: 'sess-seed-01',
      sender: 'user',
      content: 'Sure! I am Marcus Sterling at marcus@sterlingventures.com, phone +1 (555) 234-8901. We want an AI real estate dashboard.',
      channel: 'website',
      created_at: new Date(Date.now() - 2 * 3600000 - 100000).toISOString()
    },
    {
      id: 'msg-4',
      bot_id: 'bot-apex-agency',
      session_id: 'sess-seed-01',
      sender: 'bot',
      content: 'Thank you Marcus! We have recorded your requirement for the AI real estate dashboard and our technical director will email you within 2 hours at marcus@sterlingventures.com.',
      channel: 'website',
      created_at: new Date(Date.now() - 2 * 3600000 - 60000).toISOString()
    }
  ],
  whatsapp_sessions: [
    {
      id: 'wa-session-1',
      bot_id: 'bot-apex-agency',
      status: 'connected',
      phone_number: '+1 (555) 019-2834',
      last_active: new Date().toISOString()
    }
  ]
};

// Ensure data directory and file exist
function initDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeedData, null, 2), 'utf-8');
  }
}

initDbFile();

// Local DB Helpers
function readDb() {
  try {
    initDbFile();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return initialSeedData;
  }
}

function writeDb(data) {
  try {
    initDbFile();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to local db:', err);
    return false;
  }
}

// Unified Database Access Layer (Supabase with Local File DB fallback)
export const db = {
  // BOTS
  async getBots(userId) {
    if (supabase) {
      const { data, error } = await supabase.from('bots').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const local = readDb();
    return local.bots.filter(b => !userId || b.user_id === userId);
  },

  async getBotById(botId) {
    if (supabase) {
      const { data, error } = await supabase.from('bots').select('*').eq('id', botId).single();
      if (!error && data) return data;
    }
    const local = readDb();
    return local.bots.find(b => b.id === botId) || null;
  },

  async createBot(botData) {
    const newBot = {
      id: botData.id || `bot-${uuidv4().substring(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      allowed_domains: botData.allowed_domains || ['*'],
      whatsapp_status: 'disconnected',
      whatsapp_type: 'qr',
      ...botData
    };

    if (supabase) {
      const { data, error } = await supabase.from('bots').insert([newBot]).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    local.bots.unshift(newBot);
    writeDb(local);
    return newBot;
  },

  async updateBot(botId, updates) {
    const updatedFields = { ...updates, updated_at: new Date().toISOString() };

    if (supabase) {
      const { data, error } = await supabase.from('bots').update(updatedFields).eq('id', botId).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    const index = local.bots.findIndex(b => b.id === botId);
    if (index !== -1) {
      local.bots[index] = { ...local.bots[index], ...updatedFields };
      writeDb(local);
      return local.bots[index];
    }
    return null;
  },

  async deleteBot(botId) {
    if (supabase) {
      await supabase.from('bots').delete().eq('id', botId);
      return true;
    }
    const local = readDb();
    local.bots = local.bots.filter(b => b.id !== botId);
    local.leads = local.leads.filter(l => l.bot_id !== botId);
    local.messages = local.messages.filter(m => m.bot_id !== botId);
    writeDb(local);
    return true;
  },

  // LEADS
  async getLeads(userId, botId = null) {
    if (supabase) {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      if (botId) query = query.eq('bot_id', botId);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    const local = readDb();
    let result = local.leads;
    if (userId) result = result.filter(l => l.user_id === userId);
    if (botId) result = result.filter(l => l.bot_id === botId);
    return result;
  },

  async createLead(leadData) {
    const newLead = {
      id: leadData.id || `lead-${uuidv4().substring(0, 8)}`,
      status: leadData.status || 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...leadData
    };

    if (supabase) {
      const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    // Prevent duplicate lead for same phone/email in same bot within 1 hour
    const existing = local.leads.find(
      l => l.bot_id === newLead.bot_id &&
      ((newLead.lead_phone && l.lead_phone === newLead.lead_phone) ||
       (newLead.lead_email && l.lead_email === newLead.lead_email))
    );

    if (existing) {
      existing.lead_requirement = newLead.lead_requirement || existing.lead_requirement;
      existing.updated_at = new Date().toISOString();
      writeDb(local);
      return existing;
    }

    local.leads.unshift(newLead);
    writeDb(local);
    return newLead;
  },

  async updateLeadStatus(leadId, status) {
    if (supabase) {
      const { data, error } = await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', leadId).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    const lead = local.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      lead.updated_at = new Date().toISOString();
      writeDb(local);
      return lead;
    }
    return null;
  },

  async deleteLead(leadId) {
    if (supabase) {
      await supabase.from('leads').delete().eq('id', leadId);
      return true;
    }
    const local = readDb();
    local.leads = local.leads.filter(l => l.id !== leadId);
    writeDb(local);
    return true;
  },

  // LISTS & SEGMENTS
  async getSegments(userId = null) {
    const local = readDb();
    if (!local.segments || local.segments.length === 0) {
      local.segments = [
        {
          id: 'seg-1',
          name: 'Campus Ambassador Partners',
          type: 'list',
          description: 'College students applying for campus lead automation',
          members_count: 0,
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 3600000).toISOString()
        },
        {
          id: 'seg-2',
          name: 'Enterprise & Business',
          type: 'list',
          description: 'Founders, CTOs, and agency clients requesting full-stack web builds',
          members_count: 3,
          created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 3600000).toISOString()
        },
        {
          id: 'seg-3',
          name: 'Student Capstone Leads',
          type: 'list',
          description: 'CS/IT students inquiring about AI chatbot templates',
          members_count: 1,
          created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 25 * 3600000).toISOString()
        },
        {
          id: 'seg-4',
          name: 'WhatsApp Inbound Leads',
          type: 'segment',
          description: 'Contacts that initiated conversations directly via WhatsApp number',
          members_count: 2,
          created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 3600000).toISOString()
        }
      ];
      writeDb(local);
    }
    return local.segments;
  },

  async createSegment(segmentData) {
    const local = readDb();
    if (!local.segments) local.segments = [];
    const newSegment = {
      id: `seg-${uuidv4().substring(0, 8)}`,
      name: segmentData.name,
      type: segmentData.type || 'list',
      description: segmentData.description || '',
      members_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    local.segments.unshift(newSegment);
    writeDb(local);
    return newSegment;
  },

  async deleteSegment(segmentId) {
    const local = readDb();
    if (local.segments) {
      local.segments = local.segments.filter(s => s.id !== segmentId);
      writeDb(local);
    }
    return true;
  },

  // MESSAGES & HISTORY
  async getMessages(botId, sessionId) {
    if (supabase) {
      let q = supabase.from('messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (botId && botId.trim()) q = q.eq('bot_id', botId);
      const { data, error } = await q;
      if (!error && data) return data;
    }

    const local = readDb();
    if (botId && botId.trim()) {
      return local.messages.filter(m => m.bot_id === botId && m.session_id === sessionId);
    }
    return local.messages.filter(m => m.session_id === sessionId);
  },

  async addMessage(msgData) {
    const newMsg = {
      id: msgData.id || `msg-${uuidv4().substring(0, 8)}`,
      created_at: new Date().toISOString(),
      ...msgData
    };

    if (supabase) {
      const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    local.messages.push(newMsg);
    writeDb(local);
    return newMsg;
  },

  async getAllMessages(botId = null) {
    const local = readDb();
    if (botId) return local.messages.filter(m => m.bot_id === botId);
    return local.messages;
  },

  // USERS
  async getUserByEmail(email) {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (!error && data) return data;
    }
    const local = readDb();
    return local.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(userData) {
    const newUser = {
      id: userData.id || `usr-${uuidv4().substring(0, 8)}`,
      plan_tier: userData.plan_tier || 'free',
      created_at: new Date().toISOString(),
      ...userData
    };

    if (supabase) {
      const { data, error } = await supabase.from('users').insert([newUser]).select().single();
      if (!error && data) return data;
    }

    const local = readDb();
    local.users.push(newUser);
    writeDb(local);
    return newUser;
  }
};
