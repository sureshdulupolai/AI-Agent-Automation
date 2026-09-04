import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Building2,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowUp,
  Zap,
  Target,
  RefreshCw,
  Cpu,
  Activity,
  Home,
  Check,
  ChevronRight,
  MessageSquare,
  FileText,
  HelpCircle,
  Settings2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatWhatsAppText } from '../utils/formatWhatsAppText';

// Enterprise Industry Presets (Clean, Professional, Zero Emojis)
const INDUSTRY_PRESETS = [
  {
    id: 'tech_agency',
    label: 'Tech & Software Agency',
    icon: Cpu,
    profile: {
      business_name: 'NovaByte AI & Web Studio',
      industry_category: 'Full-Stack Web & AI Automation',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      fulfillment_type: 'custom_quote',
      core_offerings: [
        {
          name: 'Custom Web App / SaaS Platform',
          category: 'Software Development',
          pricing_type: 'tier_based',
          price_range: '$3,500 - $10,000',
          turnaround: '2 to 3 Weeks',
          description: 'Full-stack React / Next.js web application with database, authentication, and responsive UI.'
        },
        {
          name: 'Autonomous WhatsApp & AI Chatbot',
          category: 'AI Automation',
          pricing_type: 'fixed',
          price_range: '$1,200 - $2,500',
          turnaround: '3 to 5 Days',
          description: '24/7 autonomous WhatsApp lead qualifier with live agent CRM handoff.'
        },
        {
          name: 'UI/UX Design & Brand System',
          category: 'Design',
          pricing_type: 'tier_based',
          price_range: '$800 - $1,800',
          turnaround: '5 to 7 Days',
          description: 'High-fidelity Figma prototypes, custom component tokens, and mobile-first mockups.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'project_scope',
          label: 'Project Scope / Requirements',
          is_mandatory: true,
          prompt_nudge: 'Ask what key features or business outcomes they need.'
        },
        {
          field_key: 'target_budget',
          label: 'Estimated Budget Range',
          is_mandatory: true,
          prompt_nudge: 'Ask politely for their investment budget to suggest the right tier.'
        },
        {
          field_key: 'timeline',
          label: 'Target Launch Date',
          is_mandatory: false,
          prompt_nudge: 'Ask when they are looking to launch or start development.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
        location_address: 'Global Remote & Virtual Consultations',
        payment_terms: '50% milestone deposit, 50% upon final verified deployment.',
        custom_policies: '100% Satisfaction guarantee with 30-day post-delivery warranty.'
      }
    }
  },
  {
    id: 'healthcare_clinic',
    label: 'Healthcare & Clinic',
    icon: Activity,
    profile: {
      business_name: 'Apex Care Dental & Medical Center',
      industry_category: 'Healthcare & Oral Specialization',
      brand_voice: 'Gentle, Caring, Reassuring, and Highly Professional',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Comprehensive Oral Exam & 3D Scan',
          category: 'Diagnostics',
          pricing_type: 'fixed',
          price_range: '$80 - $120',
          turnaround: '45 Minutes',
          description: 'Full digital X-rays, intraoral scan, and personalized treatment consultation.'
        },
        {
          name: 'Clear Dental Aligners',
          category: 'Orthodontics',
          pricing_type: 'tier_based',
          price_range: '$1,800 - $3,500',
          turnaround: '4 to 6 Months',
          description: 'Custom transparent teeth aligners with monthly check-ins and retainers.'
        },
        {
          name: 'Laser Teeth Whitening',
          category: 'Cosmetic',
          pricing_type: 'fixed',
          price_range: '$250 - $400',
          turnaround: '60 Minutes',
          description: 'In-office advanced LED laser whitening for up to 8 shades brighter.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'chief_complaint',
          label: 'Primary Concern / Pain Area',
          is_mandatory: true,
          prompt_nudge: 'Ask if they are experiencing any pain or looking for cosmetic treatments.'
        },
        {
          field_key: 'preferred_date_time',
          label: 'Preferred Appointment Time',
          is_mandatory: true,
          prompt_nudge: 'Ask what day and time works best for their clinic visit.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sat: 8:30 AM - 8:00 PM',
        location_address: 'Suite 402, Medical City Center, Downtown',
        payment_terms: 'Cards, Cash, and major Insurance accepted with zero-interest EMI.',
        custom_policies: 'Same-day emergency appointments prioritized. Free parking available.'
      }
    }
  },
  {
    id: 'real_estate',
    label: 'Real Estate & Living',
    icon: Home,
    profile: {
      business_name: 'Prestige Luxury Estates',
      industry_category: 'Premium Real Estate & Property Advisory',
      brand_voice: 'Sophisticated, Discreet, Knowledgeable, and Premium',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Luxury Sea-Facing 3BHK Penthouse',
          category: 'Residential',
          pricing_type: 'fixed',
          price_range: '$1,200,000 - $3,500,000',
          turnaround: 'Private VIP Viewing',
          description: 'Panoramic skyline views, private plunge pool, and 24/7 concierge.'
        },
        {
          name: 'Commercial Prime Office Floor',
          category: 'Commercial',
          pricing_type: 'tier_based',
          price_range: '$8,000 - $20,000 / month',
          turnaround: 'Immediate Handover',
          description: 'Furnished A-grade commercial workspace in central business district.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'buyer_budget',
          label: 'Target Purchase / Rental Budget',
          is_mandatory: true,
          prompt_nudge: 'Ask what budget range they are targeting for their property search.'
        },
        {
          field_key: 'property_preference',
          label: 'Property Type & Location',
          is_mandatory: true,
          prompt_nudge: 'Ask if they prefer beachfront apartments, private villas, or central plots.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sun: 9:00 AM - 8:00 PM',
        location_address: 'Level 18, Prime Financial Tower',
        payment_terms: 'Flexible developer payment plans with escrow guarantees.',
        custom_policies: 'Private chauffeur service provided for prospective property viewings.'
      }
    }
  }
];

export default function UniversalStudio({ bots = [] }) {
  const selectedBotId = bots[0]?.id || 'bot-ec0db899';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'offerings' | 'rules' | 'policies'

  // AI Generator state
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Profile Schema State
  const [profile, setProfile] = useState({
    business_name: 'NovaByte AI & Web Studio',
    industry_category: 'Full-Stack Web & AI Automation',
    brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
    fulfillment_type: 'custom_quote',
    core_offerings: [],
    qualification_rules: [],
    policies_and_faqs: {
      operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
      location_address: 'Global Remote & Virtual Consultations',
      payment_terms: '50% milestone deposit, 50% upon final verified deployment.',
      custom_policies: '100% Satisfaction guarantee with 30-day post-delivery warranty.'
    }
  });

  // Live Interactive Simulator State
  const [simMessages, setSimMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Hello. Thank you for connecting with us. How can I assist you with our services, packages, or consultation scheduling today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState({
    intent: 'General Consultation',
    readiness_score: 50,
    lead_temperature: 'Moderate Intent',
    extracted_parameters: {},
    missing_fields: []
  });

  const chatEndRef = useRef(null);

  // Fetch Business Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/universal/profile/${selectedBotId}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [selectedBotId]);

  // Save Dynamic Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/universal/profile/${selectedBotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Apply Industry Preset
  const handleApplyPreset = (preset) => {
    setProfile(preset.profile);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.5 } });
  };

  // 1-Click AI Auto-Generate Schema
  const handleSynthesizeProfile = async () => {
    if (!generatorPrompt.trim()) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/universal/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: generatorPrompt })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Offering helpers
  const handleAddOffering = () => {
    const newOffering = {
      name: 'New Service Deliverable',
      category: 'Core Service',
      pricing_type: 'tier_based',
      price_range: '$500 - $1,500',
      turnaround: '3 to 5 Business Days',
      description: 'Full deliverable scope outlining what the client receives upon completion.'
    };
    setProfile(prev => ({ ...prev, core_offerings: [...(prev.core_offerings || []), newOffering] }));
  };

  const handleRemoveOffering = (index) => {
    setProfile(prev => ({
      ...prev,
      core_offerings: prev.core_offerings.filter((_, i) => i !== index)
    }));
  };

  // Qualification helpers
  const handleAddQualRule = () => {
    const newRule = {
      field_key: `field_${Date.now()}`,
      label: 'New Question Parameter',
      is_mandatory: true,
      prompt_nudge: 'Politely inquire during initial scoping'
    };
    setProfile(prev => ({
      ...prev,
      qualification_rules: [...(prev.qualification_rules || []), newRule]
    }));
  };

  const handleRemoveQualRule = (index) => {
    setProfile(prev => ({
      ...prev,
      qualification_rules: prev.qualification_rules.filter((_, i) => i !== index)
    }));
  };

  // Send Test Message in Universal Simulator
  const handleSendSimMessage = async (customText) => {
    const textToSend = (customText || simInput).trim();
    if (!textToSend || simulating) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: textToSend, time: timeStr };

    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');
    setSimulating(true);

    try {
      const res = await fetch('/api/universal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: selectedBotId,
          userMessage: textToSend,
          history: simMessages.map(m => ({ sender: m.sender, content: m.text })),
          channel: 'universal_simulator'
        })
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(text || `Server returned invalid response (${res.status})`);
      }

      if (!res.ok || (!data.reply && !data.success)) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setSimulating(false);

      if (data.reply) {
        const botMsg = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSimMessages(prev => [...prev, botMsg]);
        setLatestAnalysis({
          intent: data.intent || 'General Consultation',
          readiness_score: data.readiness_score || 50,
          lead_temperature: (data.readiness_score || 50) >= 80 ? 'High Intent' : 'Moderate Intent',
          extracted_parameters: data.extracted_parameters || {},
          missing_fields: data.missing_fields || []
        });
      }
    } catch (err) {
      setSimulating(false);
      setSimMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'bot', text: `Error: ${err.message}`, time: timeStr }
      ]);
    }
  };

  // 4 Navigation Tabs Definition (Icon-Centric Executive Design)
  const NAVIGATION_TABS = [
    { id: 'identity', tooltip: 'Profile & Brand Tone', icon: Building2 },
    { id: 'offerings', tooltip: 'Core Services & Offerings', icon: Briefcase },
    { id: 'rules', tooltip: 'Lead Qualification Rules', icon: Target },
    { id: 'policies', tooltip: 'Operations, Hours & FAQs', icon: Clock }
  ];

  return (
    <div style={{ maxWidth: '1540px', margin: '0 auto', padding: '24px 20px 70px' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Business Knowledge Base &amp; AI Agent Studio
              </h1>
              <span style={{
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                Autonomous Agent
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Configure your business profile, service offerings, and lead qualification parameters.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchProfile}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} className={loading ? 'animate-spin' : ''} />
            Reset
          </button>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: savedSuccess ? '#16a34a' : '#4f46e5',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {savedSuccess ? <CheckCircle2 size={14} /> : <Save size={14} />}
            <span>{savedSuccess ? 'Changes Deployed' : saving ? 'Saving Profile...' : 'Save & Deploy Agent'}</span>
          </button>
        </div>
      </div>

      {/* 2. Industry Presets Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Settings2 size={14} color="#4f46e5" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Industry Presets:
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            (Pre-fill standard offerings and qualification criteria)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {INDUSTRY_PRESETS.map(preset => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.color = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={13} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AI Quick Synthesis Strip */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles size={14} color="#4f46e5" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            AI Assistant: Describe your company to generate catalog and rules
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="e.g. Specialty dental clinic in Mumbai offering implants, clear aligners, and cosmetic procedures..."
            value={generatorPrompt}
            onChange={(e) => setGeneratorPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeProfile()}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-page)',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSynthesizeProfile}
            disabled={isSynthesizing || !generatorPrompt.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isSynthesizing ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={13} />
            <span>{isSynthesizing ? 'Generating...' : 'Synthesize Profile'}</span>
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column View: Configuration Left (1.2fr) + Live Simulator Right (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px' }}>
        
        {/* Left Side: Step Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Executive Clean Icon-Only Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {NAVIGATION_TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.tooltip}
                  aria-label={tab.tooltip}
                  style={{
                    flex: '1 1 0',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#4f46e5' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <TabIcon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
                </button>
              );
            })}
          </div>

          {/* TAB 1: Business Identity & Tone */}
          {activeTab === 'identity' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                  Business Identity &amp; Voice Directive
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Define the corporate identity, industry classification, and communicative tone of the AI representative.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Company / Entity Name *
                  </label>
                  <input
                    type="text"
                    value={profile.business_name || ''}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    placeholder="e.g. Apex Studio"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Industry Vertical *
                  </label>
                  <input
                    type="text"
                    value={profile.industry_category || ''}
                    onChange={(e) => setProfile({ ...profile, industry_category: e.target.value })}
                    placeholder="e.g. Software, Healthcare, Real Estate"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tone of Voice Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Representative Persona &amp; Tone
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {[
                    'Warm, Consultative, and Authoritative Senior Specialist',
                    'Friendly, Professional, and Direct',
                    'Executive, Precise, and High-Efficiency',
                    'Empathetic, Reassuring, and Methodical'
                  ].map((voice, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setProfile({ ...profile, brand_voice: voice })}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: profile.brand_voice === voice ? '1px solid #4f46e5' : '1px solid var(--border-subtle)',
                        backgroundColor: profile.brand_voice === voice ? '#eef2ff' : 'var(--bg-page)',
                        color: profile.brand_voice === voice ? '#4f46e5' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={profile.brand_voice || ''}
                  onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
                  placeholder="Or define custom personality directives..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              {/* Primary Fulfillment Objective */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Primary Conversion Objective
                </label>
                <select
                  value={profile.fulfillment_type || 'custom_quote'}
                  onChange={(e) => setProfile({ ...profile, fulfillment_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="appointment">Appointment / Consultation Scheduling</option>
                  <option value="custom_quote">Custom Commercial Quote &amp; Scope</option>
                  <option value="delivery">Physical Product Order &amp; Delivery</option>
                  <option value="on_premise">In-Person Facility / Clinic Visit</option>
                  <option value="digital">Digital Delivery / Instant Access</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('offerings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Continue to Services <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Core Offerings & Services */}
          {activeTab === 'offerings' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                    Commercial Catalog &amp; Services
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Specify active service offerings, pricing benchmarks, and deliverable commitments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOffering}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} /> Add Offering
                </button>
              </div>

              {/* Offerings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(profile.core_offerings || []).length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    No services configured. Click "Add Offering" or select an industry preset above.
                  </div>
                ) : (
                  profile.core_offerings.map((offering, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={offering.name || ''}
                          placeholder="Service Name (e.g. Next.js SaaS Web App)"
                          onChange={(e) => {
                            const updated = [...profile.core_offerings];
                            updated[idx].name = e.target.value;
                            setProfile({ ...profile, core_offerings: updated });
                          }}
                          style={{
                            flex: 1,
                            fontSize: '13.5px',
                            fontWeight: 700,
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOffering(idx)}
                          title="Delete Offering"
                          style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Category</label>
                          <input
                            type="text"
                            value={offering.category || ''}
                            placeholder="Category"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].category = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{ width: '100%', marginTop: '2px', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '11.5px', color: 'var(--text-primary)' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Price Range</label>
                          <input
                            type="text"
                            value={offering.price_range || ''}
                            placeholder="e.g. $1,500 - $3,000"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].price_range = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{ width: '100%', marginTop: '2px', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Turnaround Time</label>
                          <input
                            type="text"
                            value={offering.turnaround || ''}
                            placeholder="e.g. 5 Business Days"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].turnaround = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{ width: '100%', marginTop: '2px', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '11.5px', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={offering.description || ''}
                          placeholder="Scope specifications and deliverables..."
                          onChange={(e) => {
                            const updated = [...profile.core_offerings];
                            updated[idx].description = e.target.value;
                            setProfile({ ...profile, core_offerings: updated });
                          }}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '11.5px', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Continue to Lead Qualifier <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Lead Qualification Parameters */}
          {activeTab === 'rules' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                    Lead Qualification Criteria
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Define the essential parameters the agent extracts from inbound prospects before creating a deal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQualRule}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} /> Add Field
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(profile.qualification_rules || []).map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Parameter Name</label>
                      <input
                        type="text"
                        value={rule.label || ''}
                        placeholder="e.g. Target Budget"
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].label = e.target.value;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                        style={{ width: '100%', marginTop: '2px', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}
                      />
                    </div>

                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700 }}>Agent Inquiry Nudge</label>
                      <input
                        type="text"
                        value={rule.prompt_nudge || ''}
                        placeholder="e.g. Inquire about the customer's budget tier"
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].prompt_nudge = e.target.value;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                        style={{ width: '100%', marginTop: '2px', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', fontSize: '12px', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', marginTop: '12px' }}>
                      <input
                        type="checkbox"
                        checked={rule.is_mandatory || false}
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].is_mandatory = e.target.checked;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                      />
                      Required
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveQualRule(idx)}
                      title="Remove Field"
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', marginTop: '12px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('offerings')}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('policies')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Continue to Operations <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Operations & FAQs */}
          {activeTab === 'policies' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                  Operational Guidelines &amp; Policies
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Standard business hours, location details, payment policies, and client assurances.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={profile.policies_and_faqs?.operating_hours || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      policies_and_faqs: { ...profile.policies_and_faqs, operating_hours: e.target.value }
                    })}
                    placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Facility / Office Address
                  </label>
                  <input
                    type="text"
                    value={profile.policies_and_faqs?.location_address || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      policies_and_faqs: { ...profile.policies_and_faqs, location_address: e.target.value }
                    })}
                    placeholder="e.g. Global Remote Consultations"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Commercial Terms &amp; Invoicing
                </label>
                <input
                  type="text"
                  value={profile.policies_and_faqs?.payment_terms || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    policies_and_faqs: { ...profile.policies_and_faqs, payment_terms: e.target.value }
                  })}
                  placeholder="e.g. 50% initiation milestone, 50% on delivery"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Quality Warranty &amp; Guarantees
                </label>
                <input
                  type="text"
                  value={profile.policies_and_faqs?.custom_policies || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    policies_and_faqs: { ...profile.policies_and_faqs, custom_policies: e.target.value }
                  })}
                  placeholder="e.g. 30-day post-delivery verified warranty"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12.5px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '12px', cursor: 'pointer' }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Save size={13} /> Save &amp; Deploy Agent
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Interactive AI Simulator */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          height: '700px',
          overflow: 'hidden'
        }}>
          {/* Simulator Top Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-page)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Interactive Simulator
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({profile.business_name || 'Autonomous Agent'})
                </span>
              </div>
              <button
                onClick={() => setSimMessages([{
                  id: 'init-1',
                  sender: 'bot',
                  text: `Hello. How can I assist you with ${profile.business_name || 'our services'} today?`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }])}
                style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Clear History
              </button>
            </div>

            {/* Telemetry Pills (Zero Emojis) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: latestAnalysis.readiness_score >= 80 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(234, 88, 12, 0.12)',
                color: latestAnalysis.readiness_score >= 80 ? '#15803d' : '#c2410c'
              }}>
                <Zap size={11} /> {latestAnalysis.lead_temperature} ({latestAnalysis.readiness_score}/100)
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4338ca'
              }}>
                <Target size={11} /> {latestAnalysis.intent}
              </span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'var(--bg-page)'
          }}>
            {simMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '9px 13px',
                    borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    backgroundColor: m.sender === 'user' ? '#4f46e5' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  {formatWhatsAppText(m.text)}
                </div>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {simulating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', width: 'fit-content' }}>
                <RefreshCw size={12} className="animate-spin" color="#4f46e5" />
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Agent generating reply...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {[
              'What services do you provide?',
              'What are your pricing tiers?',
              'I would like to schedule a consultation'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendSimMessage(p)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-page)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Capsule */}
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '3px 4px 3px 12px'
            }}>
              <input
                type="text"
                placeholder={`Ask ${profile.business_name || 'Agent'} anything...`}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={() => handleSendSimMessage()}
                disabled={simulating || !simInput.trim()}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  cursor: (simulating || !simInput.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (simulating || !simInput.trim()) ? 0.5 : 1
                }}
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
