-- =========================================================
-- OmniBot SaaS: Complete PostgreSQL & Supabase Database Schema
-- 100% Free & Multi-Tenant AI Chatbot & WhatsApp Platform
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SaaS Users / Business Owners
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  plan_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Multi-Tenant Bots
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL,
  bot_avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  primary_color TEXT DEFAULT '#4f46e5',
  welcome_message TEXT DEFAULT 'Hello! 👋 How can I assist you with our products and services today?',
  placeholder_text TEXT DEFAULT 'Type your message here...',
  quick_prompts TEXT[] DEFAULT ARRAY['What services do you offer?', 'Pricing details', 'Talk to sales agent'],
  system_instructions TEXT DEFAULT 'You are a professional, helpful, and friendly AI sales and support representative. Answer customer questions accurately based strictly on the provided business knowledge. If you do not know the answer, politely ask the user for their phone number or email so an agent can follow up.',
  business_knowledge TEXT DEFAULT 'Apex Solutions offers premium web design, SaaS development, and AI chatbot automation. Pricing starts from $99/mo for basic plans up to $499/mo for enterprise solutions. Contact us at contact@apexsolutions.io or call +1-800-555-0199.',
  allowed_domains TEXT[] DEFAULT ARRAY['*'],
  whatsapp_number TEXT,
  whatsapp_status TEXT DEFAULT 'disconnected', -- 'disconnected', 'pairing', 'connected'
  whatsapp_type TEXT DEFAULT 'qr', -- 'qr' (Baileys) or 'meta' (Cloud API)
  meta_phone_number_id TEXT,
  meta_access_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lead Capture CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_name TEXT DEFAULT 'Website Visitor',
  lead_phone TEXT,
  lead_email TEXT,
  lead_requirement TEXT,
  channel TEXT DEFAULT 'website', -- 'website' | 'whatsapp'
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'closed'
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Conversation History / Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'user' | 'bot' | 'system'
  content TEXT NOT NULL,
  channel TEXT DEFAULT 'website', -- 'website' | 'whatsapp'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WhatsApp QR Sessions & States
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID UNIQUE REFERENCES bots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'disconnected',
  qr_code TEXT,
  phone_number TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_bot_id ON leads(bot_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_messages_bot_session ON messages(bot_id, session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Row Level Security (RLS) policies (Optional if connecting via Supabase Client with Auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
