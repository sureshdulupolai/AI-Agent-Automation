import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Bot,
  MessageSquare,
  Zap,
  Kanban,
  Send,
  Users,
  Calendar,
  Activity,
  Code,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  HelpCircle,
  Cpu,
  Phone,
  Mail,
  CheckCircle2,
  Terminal,
  Globe,
  ShoppingBag,
  Store,
  ListChecks,
  PackageCheck
} from 'lucide-react';

const DOC_CHAPTERS = [
  {
    id: 'getting-started',
    title: 'Getting Started & Architecture',
    icon: Sparkles,
    badge: 'Basics',
    badgeColor: '#4f46e5',
    summary: 'Overview of NovaByte AI Studio, high-performance architecture, and 1-minute setup guide.'
  },
  {
    id: 'ecommerce-prompts',
    title: 'E-Commerce & Industry Prompt Master Guide',
    icon: ShoppingBag,
    badge: 'Prompts & Flows',
    badgeColor: '#ec4899',
    summary: 'Battle-tested system prompts, interactive Yes/No branching, order placement, and multi-industry templates.'
  },
  {
    id: 'universal-brain',
    title: 'Universal AI Brain & Knowledge Base',
    icon: Cpu,
    badge: 'AI Core',
    badgeColor: '#7c3aed',
    summary: 'Dynamic metadata schemas, prompt guardrails, and automated website scraping for any industry.'
  },
  {
    id: 'whatsapp-automation',
    title: 'WhatsApp Multi-Number Automation',
    icon: Phone,
    badge: 'WhatsApp',
    badgeColor: '#16a34a',
    summary: 'QR code pairing without Meta cloud fees, 2-hour inactivity follow-ups, and auto-replies.'
  },
  {
    id: 'website-widget',
    title: 'Website Chat Widget & 1-Click Embed',
    icon: Globe,
    badge: 'Web Widget',
    badgeColor: '#0284c7',
    summary: 'Embed high-converting AI chat widgets into WordPress, Shopify, Next.js, Webflow, and HTML.'
  },
  {
    id: 'sales-pipeline',
    title: 'Deals & Sales Pipeline Kanban',
    icon: Kanban,
    badge: 'CRM',
    badgeColor: '#ea580c',
    summary: 'Visual 5-stage deal tracking synchronized with autonomous AI buying readiness scores (0-100).'
  },
  {
    id: 'campaigns-hub',
    title: 'Campaigns & Email Drip Sequences',
    icon: Send,
    badge: 'Outreach',
    badgeColor: '#dc2626',
    summary: 'WhatsApp broadcasts, CSV audience lists, and automated 3-step email nurture sequences.'
  },
  {
    id: 'team-handoff',
    title: 'Multi-Agent Team & Human Takeover',
    icon: Users,
    badge: 'Team',
    badgeColor: '#0891b2',
    summary: 'Instant toggle to pause AI and give human agents 100% manual control over live conversations.'
  },
  {
    id: 'appointment-booking',
    title: 'Auto Appointments & Calendar Engine',
    icon: Calendar,
    badge: 'Scheduling',
    badgeColor: '#059669',
    summary: 'Natural language date parsing from chat messages with conflict-free calendar booking.'
  },
  {
    id: 'task-engine',
    title: 'Autonomous Task Command Center',
    icon: Activity,
    badge: 'Autopilot',
    badgeColor: '#6366f1',
    summary: '24/7 background cron engine executing automated lead nudges, telemetry auditing, and Daily EOD reports.'
  }
];

export default function DocumentationPage() {
  const [activeChapter, setActiveChapter] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredChapters = DOC_CHAPTERS.filter(ch =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1480px', margin: '0 auto', padding: '28px 24px 60px' }}>
      
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontSize: '11.5px', fontWeight: 800, marginBottom: '10px' }}>
              <BookOpen size={13} />
              <span>Official Knowledge Base &amp; Developer Manual</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              NovaByte AI Studio Documentation
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, maxWidth: '720px', lineHeight: 1.6 }}>
              A-to-Z comprehensive guide covering universal business brain configuration, WhatsApp multi-device linking, 1-click embed widgets, sales pipelines, and autonomous outreach engines.
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px', width: '340px' }}>
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search documentation guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left Navigation Index | Right Spacious Documentation Reader */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Left Navigation: Chapters Index */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          position: 'sticky',
          top: '24px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px 8px' }}>
            Documentation Chapters
          </div>

          {filteredChapters.map(ch => {
            const IconComponent = ch.icon;
            const isActive = activeChapter === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: isActive ? '#4f46e5' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  width: '100%'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: isActive ? '#4f46e5' : 'var(--bg-page)', color: isActive ? '#ffffff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComponent size={15} />
                </div>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ch.title}
                </span>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </div>

        {/* Right Area: Detailed Chapter Manual */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '36px 32px',
          minHeight: '720px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          
          {/* CHAPTER 1 */}
          {activeChapter === 'getting-started' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '11px', fontWeight: 800 }}>Chapter 1</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Getting Started &amp; System Architecture
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                NovaByte AI Studio operates as an autonomous growth suite combining dual-action conversational AI, native Baileys WhatsApp automation, real-time CRM pipelines, and background executive intelligence.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '28px', marginBottom: '14px' }}>
                Core Capabilities Matrix:
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    <Cpu size={16} color="#4f46e5" /> Universal Business Brain
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Zero-hardcoding adaptive metadata generator for pharmacies, clinics, real estate, and custom fabrication.
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    <Phone size={16} color="#16a34a" /> WhatsApp Baileys Engine
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Zero cloud-cost direct socket protocol with automatic 2-hour inactivity follow-up recovery.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER: E-COMMERCE & INDUSTRY PROMPTS MASTER GUIDE */}
          {activeChapter === 'ecommerce-prompts' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#fdf2f8', color: '#db2777', fontSize: '11px', fontWeight: 800 }}>Master Guide</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  E-Commerce, Interactive Branching &amp; Industry Prompt Blueprints
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Train your AI bot to handle interactive Yes/No choices, showcase catalogs, collect orders, track shipments, and dynamically adapt to any industry.
              </p>

              {/* SECTION 1: HOW INTERACTIVE CHOICE MENUS WORK */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ListChecks size={18} color="#ec4899" />
                  <span>1. How Interactive Yes/No Choices &amp; Menu Options Work</span>
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                  WhatsApp does not require paid button APIs. Formatting clear numbered and emoji choices allows customers to reply with a single tap, number, or keyword:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>📱 Bot Interactive Menu Format:</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-line', backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
{`👋 Welcome to UrbanStyle Store!

Would you like to browse our new collection?
1️⃣ Yes, Show Catalog & Offers 🛍️
2️⃣ Track Existing Order 📦
3️⃣ Speak with Human Support 💬

Reply with 1, 2, or 3 to proceed!`}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>🧠 Dynamic AI Branching Logic:</div>
                    <ul style={{ fontSize: '12px', color: '#475569', margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                      <li><strong>If user replies "1" or "Yes"</strong>: AI sends store link (e.g. <em>https://yourstore.com/shop</em>) with current active discount code.</li>
                      <li><strong>If user replies "2" or "No"</strong>: AI asks for their Order ID or inquires what assistance they need.</li>
                      <li><strong>If user replies "3" or "Help"</strong>: AI switches session to Human Takeover and notifies sales agent.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BATTLE-TESTED INDUSTRY PROMPTS */}
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '28px 0 14px 0' }}>
                Copy-Paste Industry System Prompts:
              </h3>

              {/* TEMPLATE 1: E-COMMERCE & D2C */}
              <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #fbcfe8', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} color="#db2777" />
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#831843' }}>Template 1: E-Commerce Store &amp; D2C Brand</span>
                  </div>
                  <button
                    onClick={() => handleCopy(
`You are the official Senior Shopping Assistant and Order Concierge for [Your Brand Name].

### ROLE & GOALS:
1. Greet customers warmly and guide them to browse products, claim discount coupons, or track orders.
2. In your opening message, always offer structured interactive choices:
   1️⃣ Yes, View Top Products & Catalog 🛍️ (https://yourstore.com/shop)
   2️⃣ Track Existing Order 📦
   3️⃣ Claim 15% First-Order Discount Voucher 🎁
   4️⃣ Speak with Human Support 💬
3. If the customer wants to order: Collect item name, size/color, quantity, recipient name, phone, and delivery address. Calculate total and issue an instant Order Confirmation Ticket (#ORD-XXXX).
4. If the customer provides an Order ID to track: Check order status (Processing, Shipped, or Out for Delivery) and give estimated arrival date.
5. If the customer says "No" or is hesitating: Offer a limited-time 15% discount code (WELCOME15) and ask what specific product they are looking for.`,
                      'prompt-ecom'
                    )}
                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 700, borderRadius: '8px', border: '1px solid #f472b6', backgroundColor: '#fdf2f8', color: '#9d174d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedCode === 'prompt-ecom' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode === 'prompt-ecom' ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <pre style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.5, overflowX: 'auto', margin: 0 }}>
{`You are the official Senior Shopping Assistant and Order Concierge for [Your Brand Name].

### ROLE & GOALS:
1. Greet customers warmly and guide them to browse products, claim discount coupons, or track orders.
2. In your opening message, always offer structured interactive choices:
   1️⃣ Yes, View Top Products & Catalog 🛍️ (https://yourstore.com/shop)
   2️⃣ Track Existing Order 📦
   3️⃣ Claim 15% First-Order Discount Voucher 🎁
   4️⃣ Speak with Human Support 💬
3. If the customer wants to order: Collect item name, size/color, quantity, recipient name, phone, and delivery address. Calculate total and issue an instant Order Confirmation Ticket (#ORD-XXXX).
4. If the customer provides an Order ID to track: Check order status (Processing, Shipped, or Out for Delivery) and give estimated arrival date.
5. If the customer says "No" or is hesitating: Offer a limited-time 15% discount code (WELCOME15) and ask what specific product they are looking for.`}
                </pre>
              </div>

              {/* TEMPLATE 2: REAL ESTATE & PROPERTY */}
              <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={18} color="#2563eb" />
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e40af' }}>Template 2: Real Estate &amp; Luxury Property</span>
                  </div>
                  <button
                    onClick={() => handleCopy(
`You are the Senior Property Advisor for [Agency Name].

### ROLE & GOALS:
1. Qualify high-intent property buyers and schedule site visits.
2. Provide structured options:
   1️⃣ View 2BHK / 3BHK Luxury Floor Plans & Pricing 🏢
   2️⃣ Download Project Brochure (PDF) 📄
   3️⃣ Book a Free Site Visit (Cab Provided) 🚗
   4️⃣ Speak with Senior Investment Specialist 📞
3. Qualify budget, preferred location, and timeline (e.g. Ready-to-move vs Under-construction).
4. If user agrees to a visit, collect preferred date & time and phone number.`,
                      'prompt-realestate'
                    )}
                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 700, borderRadius: '8px', border: '1px solid #60a5fa', backgroundColor: '#eff6ff', color: '#1e40af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedCode === 'prompt-realestate' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode === 'prompt-realestate' ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <pre style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.5, overflowX: 'auto', margin: 0 }}>
{`You are the Senior Property Advisor for [Agency Name].

### ROLE & GOALS:
1. Qualify high-intent property buyers and schedule site visits.
2. Provide structured options:
   1️⃣ View 2BHK / 3BHK Luxury Floor Plans & Pricing 🏢
   2️⃣ Download Project Brochure (PDF) 📄
   3️⃣ Book a Free Site Visit (Cab Provided) 🚗
   4️⃣ Speak with Senior Investment Specialist 📞
3. Qualify budget, preferred location, and timeline (e.g. Ready-to-move vs Under-construction).
4. If user agrees to a visit, collect preferred date & time and phone number.`}
                </pre>
              </div>

              {/* TEMPLATE 3: HEALTHCARE & CLINICS */}
              <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#16a34a" />
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#14532d' }}>Template 3: Healthcare, Dental &amp; Wellness Clinic</span>
                  </div>
                  <button
                    onClick={() => handleCopy(
`You are the official Medical Concierge and Patient Coordinator for [Clinic Name].

### ROLE & GOALS:
1. Assist patients in booking doctor consultations and dental checkups.
2. Interactive Menu:
   1️⃣ Book Doctor Consultation / Health Checkup 🩺
   2️⃣ View Clinic Treatment Fees & Timings ⏰
   3️⃣ Emergency & Doctor On-Call 🚨
   4️⃣ Speak with Receptionist 📞
3. Collect patient name, symptom/department, and preferred appointment slot. Confirm booking instantly.`,
                      'prompt-health'
                    )}
                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 700, borderRadius: '8px', border: '1px solid #4ade80', backgroundColor: '#f0fdf4', color: '#15803d', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedCode === 'prompt-health' ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCode === 'prompt-health' ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <pre style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.5, overflowX: 'auto', margin: 0 }}>
{`You are the official Medical Concierge and Patient Coordinator for [Clinic Name].

### ROLE & GOALS:
1. Assist patients in booking doctor consultations and dental checkups.
2. Interactive Menu:
   1️⃣ Book Doctor Consultation / Health Checkup 🩺
   2️⃣ View Clinic Treatment Fees & Timings ⏰
   3️⃣ Emergency & Doctor On-Call 🚨
   4️⃣ Speak with Receptionist 📞
3. Collect patient name, symptom/department, and preferred appointment slot. Confirm booking instantly.`}
                </pre>
              </div>

              {/* SECTION 3: STEP BY STEP HOW TO TRAIN & TEST SAFELY */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#f59e0b" />
                  <span>3. Step-by-Step: How to Train &amp; Test 100% Safely (Zero Number Spam)</span>
                </h3>
                <ol style={{ fontSize: '13px', color: '#334155', paddingLeft: '20px', lineHeight: 1.7, margin: 0 }}>
                  <li><strong>Open Bot Training</strong>: Go to <a href="/bots/bot-ec0db899" style={{ color: '#4f46e5', fontWeight: 700 }}>Universal Studio (/bots)</a> and paste your custom System Prompt &amp; Catalog.</li>
                  <li><strong>Click Save &amp; Train AI</strong>: The AI neural brain updates instantly.</li>
                  <li><strong>Test Safely in Simulator</strong>: Open <a href="/whatsapp" style={{ color: '#16a34a', fontWeight: 700 }}>WhatsApp Hub (/whatsapp)</a> ➔ <strong>Interactive WhatsApp Simulator</strong>.</li>
                  <li><strong>Type Test Queries</strong>: Type <em>"1"</em>, <em>"I want to order"</em>, or <em>"Track order #123"</em>. You will see real-time AI responses, order captures, and interactive branching without connecting or spamming any real phone number! 🛡️</li>
                </ol>
              </div>
            </div>
          )}

          {/* CHAPTER 2 */}
          {activeChapter === 'universal-brain' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#7c3aed', fontSize: '11px', fontWeight: 800 }}>Chapter 2</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Universal AI Brain &amp; Dynamic Schemas
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                The Universal Engine allows any tenant to define custom business types, service catalogs, and pricing models (<code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>flat</code>, <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>hourly</code>, <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>tier_based</code>, <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>quote_upon_request</code>).
              </p>

              <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  1-Click AI Auto-Generator:
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Navigate to <strong>Universal AI Studio (/universal-studio)</strong>, enter your business domain or paste your website URL, and click "AI Auto-Generate Dynamic Profile". The AI automatically populates FAQs, catalog items, and consultation guardrails.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 3 */}
          {activeChapter === 'whatsapp-automation' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800 }}>Chapter 3</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  WhatsApp Multi-Number Automation
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Link your phone directly via QR code without paying per-conversation Meta Cloud API fees.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Step-by-Step Device Pairing:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>1</span>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Open <strong>Integrations (/integrations)</strong> in the left sidebar menu.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>2</span>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Under WhatsApp, click <strong>"Scan QR Code"</strong> or <strong>"Pair via 8-Digit Code"</strong>.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>3</span>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Open WhatsApp on your phone ➔ Linked Devices ➔ Link a Device ➔ Scan the QR code.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>4</span>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Once paired, autonomous AI replies and 2-hour inactivity follow-up recovery activate automatically.</div>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4 */}
          {activeChapter === 'website-widget' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 800 }}>Chapter 4</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Website Chat Widget &amp; 1-Click Embed
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Add our floating AI widget to your website in 30 seconds.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>1-Click Embed Snippet (WordPress / Next.js / Shopify / HTML):</span>
                <button
                  onClick={() => handleCopy('<script src="http://localhost:5000/widget.js" data-bot-id="bot-ec0db899" async></script>', 'widget-code')}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {copiedCode === 'widget-code' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copiedCode === 'widget-code' ? 'Copied' : 'Copy Script Tag'}</span>
                </button>
              </div>

              <pre style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#4f46e5', overflowX: 'auto', margin: '0 0 24px 0', fontFamily: 'monospace' }}>
{`<script 
  src="http://localhost:5000/widget.js" 
  data-bot-id="bot-ec0db899" 
  async>
</script>`}
              </pre>
            </div>
          )}

          {/* CHAPTER 5 */}
          {activeChapter === 'sales-pipeline' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#ffedd5', color: '#ea580c', fontSize: '11px', fontWeight: 800 }}>Chapter 5</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Deals &amp; Sales Pipeline Kanban
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Track every client opportunity across 5 stages: <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>New Deals</code> ➔ <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>AI Qualified</code> ➔ <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>Proposal Sent</code> ➔ <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>Closed / Won</code> ➔ <code style={{ backgroundColor: 'var(--bg-page)', padding: '2px 6px', borderRadius: '4px' }}>Closed / Lost</code>.
              </p>
            </div>
          )}

          {/* CHAPTER 6 */}
          {activeChapter === 'campaigns-hub' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 800 }}>Chapter 6</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Campaigns &amp; Automated Outreach
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Broadcast targeted messages to customer lists and trigger automated 3-step email nurture sequences.
              </p>
            </div>
          )}

          {/* CHAPTER 7 */}
          {activeChapter === 'team-handoff' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#cffafe', color: '#0891b2', fontSize: '11px', fontWeight: 800 }}>Chapter 7</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Multi-Agent Team &amp; Human Takeover
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Toggle any active conversation into "Human Takeover" mode. Autonomous AI generation pauses instantly for that contact so your human support specialist has 100% manual control.
              </p>
            </div>
          )}

          {/* CHAPTER 8 */}
          {activeChapter === 'appointment-booking' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#059669', fontSize: '11px', fontWeight: 800 }}>Chapter 8</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Auto Appointment Booking Engine
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                The AI parses natural dates and times from customer chats (e.g. <em>"Tomorrow at 4 PM"</em>) and confirms appointments without scheduling conflicts.
              </p>
            </div>
          )}

          {/* CHAPTER 9 */}
          {activeChapter === 'task-engine' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ padding: '3px 9px', borderRadius: '8px', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: 800 }}>Chapter 9</span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Autonomous Task Command Center
                </h2>
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                The 24/7 background engine scans lead pipelines every 10 minutes, checks WhatsApp socket health before dispatch, and generates executive EOD reports.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
