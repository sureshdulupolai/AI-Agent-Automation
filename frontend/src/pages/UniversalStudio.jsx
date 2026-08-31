import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Building2,
  Layers,
  Plus,
  Trash2,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Send,
  ArrowUp,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatWhatsAppText } from '../utils/formatWhatsAppText';

export default function UniversalStudio({ bots = [] }) {
  const selectedBotId = bots[0]?.id || 'bot-ec0db899';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Generator state
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Profile Schema State
  const [profile, setProfile] = useState({
    business_name: 'NovaByte AI Studio',
    industry_category: 'Full-Stack Web & AI Automation',
    brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
    fulfillment_type: 'custom_quote',
    core_offerings: [],
    qualification_rules: [],
    policies_and_faqs: {
      operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
      location_address: 'Global Remote & Virtual Consultations',
      payment_terms: '50% deposit, 50% upon final verified deployment.',
      custom_policies: '100% Satisfaction guarantee with dedicated post-delivery support'
    }
  });

  // Live Interactive Simulator State
  const [simMessages, setSimMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Hello! 👋 How can I help you today? Feel free to ask about our services, pricing packages, or project consultations.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState({
    intent: 'Initial Greeting',
    readiness_score: 50,
    lead_temperature: '⚡ Warm',
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simMessages]);

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
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
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
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Add Offering
  const handleAddOffering = () => {
    const newOffering = {
      name: 'New Offering / Service',
      category: 'Core Service',
      pricing_type: 'tier_based',
      price_range: '$499 - $999',
      turnaround: '3 to 5 Days',
      description: 'Comprehensive deliverable tailored to client needs.',
      required_fields: []
    };
    setProfile(prev => ({ ...prev, core_offerings: [...prev.core_offerings, newOffering] }));
  };

  const handleRemoveOffering = (index) => {
    setProfile(prev => ({
      ...prev,
      core_offerings: prev.core_offerings.filter((_, i) => i !== index)
    }));
  };

  // Add Qualification Rule
  const handleAddQualRule = () => {
    const newRule = {
      field_key: `field_${Date.now()}`,
      label: 'New Qualification Parameter',
      is_mandatory: true,
      prompt_nudge: 'Ask naturally when discussing service scope'
    };
    setProfile(prev => ({
      ...prev,
      qualification_rules: [...prev.qualification_rules, newRule]
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

      const data = await res.json();
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
          intent: data.intent || 'General Inquiry',
          readiness_score: data.readiness_score || 50,
          lead_temperature: data.lead_temperature || '⚡ Warm',
          extracted_parameters: data.extracted_parameters || {},
          missing_fields: data.missing_fields || []
        });
      }
    } catch (err) {
      setSimulating(false);
      setSimMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'bot', text: `⚠️ Error: ${err.message}`, time: timeStr }
      ]);
    }
  };

  return (
    <div style={{ maxWidth: '1480px', margin: '0 auto', padding: '28px 20px 60px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '23px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Universal Dynamic Business Agent Studio
              </h1>
              <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                Autonomous Brain
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Metadata-driven business configuration adapting terminology, workflows, and catalog schemas to any industry.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchProfile}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            <RotateCcw size={13} className={loading ? 'animate-spin' : ''} />
            Reset Form
          </button>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: savedSuccess ? '#16a34a' : '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.15s'
            }}
          >
            {savedSuccess ? <CheckCircle2 size={15} /> : <Save size={15} />}
            {savedSuccess ? 'Profile Deployed!' : saving ? 'Saving Brain...' : 'Deploy Universal Agent'}
          </button>
        </div>
      </div>

      {/* 1-Click AI Auto-Generator Banner */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid #c7d2fe', borderRadius: '16px', padding: '18px 22px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.8), rgba(245, 243, 255, 0.5))', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={16} color="#4f46e5" />
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#3730a3' }}>
            1-Click AI Business Schema Generator
          </span>
          <span style={{ fontSize: '11px', color: '#6366f1' }}>
            (Type any business description to auto-generate offerings, qualification rules &amp; voice)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="e.g. 24/7 Dental Clinic in Bangalore specializing in root canals and clear aligners"
            value={generatorPrompt}
            onChange={(e) => setGeneratorPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeProfile()}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '13px',
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
              padding: '10px 20px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isSynthesizing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Sparkles size={14} />
            {isSynthesizing ? 'Synthesizing...' : '✨ Auto-Generate Schema'}
          </button>
        </div>
      </div>

      {/* Main Grid: Builder Left (1.2fr) + Simulator Right (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Business Metadata Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Core Identity & Voice */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Building2 size={18} color="#4f46e5" />
              <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                1. Core Business Identity &amp; Persona
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  value={profile.business_name || ''}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Industry Category / Vertical
                </label>
                <input
                  type="text"
                  value={profile.industry_category || ''}
                  onChange={(e) => setProfile({ ...profile, industry_category: e.target.value })}
                  placeholder="e.g. Real Estate, Medical, Fitness, SaaS"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Brand Voice Directive
                </label>
                <input
                  type="text"
                  value={profile.brand_voice || ''}
                  onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
                  placeholder="e.g. Warm, Consultative, and Authoritative"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Primary Fulfillment Type
                </label>
                <select
                  value={profile.fulfillment_type || 'custom_quote'}
                  onChange={(e) => setProfile({ ...profile, fulfillment_type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                >
                  <option value="appointment">📅 Appointment / Consultation Booking</option>
                  <option value="custom_quote">📝 Custom Scope Quote</option>
                  <option value="delivery">📦 Physical Delivery / Shipping</option>
                  <option value="on_premise">📍 In-Store / Clinic Visit</option>
                  <option value="digital">⚡ Digital / Instant Fulfillment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Core Offerings & Catalog */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#4f46e5" />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  2. Core Offerings, Pricing &amp; Turnaround
                </h3>
              </div>
              <button
                onClick={handleAddOffering}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={13} /> Add Offering
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(profile.core_offerings || []).map((offering, idx) => (
                <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', backgroundColor: 'var(--bg-page)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={offering.name || ''}
                      onChange={(e) => {
                        const updated = [...profile.core_offerings];
                        updated[idx].name = e.target.value;
                        setProfile({ ...profile, core_offerings: updated });
                      }}
                      placeholder="Offering Name (e.g. Root Canal Treatment / Luxury Villa / Custom Web App)"
                      style={{ flex: 1, fontWeight: 700, fontSize: '13.5px', border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={() => handleRemoveOffering(idx)}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={offering.category || ''}
                      placeholder="Category"
                      onChange={(e) => {
                        const updated = [...profile.core_offerings];
                        updated[idx].category = e.target.value;
                        setProfile({ ...profile, core_offerings: updated });
                      }}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="text"
                      value={offering.price_range || ''}
                      placeholder="Price Range (e.g. $499 or AED 2.5M)"
                      onChange={(e) => {
                        const updated = [...profile.core_offerings];
                        updated[idx].price_range = e.target.value;
                        setProfile({ ...profile, core_offerings: updated });
                      }}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                    <input
                      type="text"
                      value={offering.turnaround || ''}
                      placeholder="Turnaround (e.g. 3-7 days)"
                      onChange={(e) => {
                        const updated = [...profile.core_offerings];
                        updated[idx].turnaround = e.target.value;
                        setProfile({ ...profile, core_offerings: updated });
                      }}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <input
                    type="text"
                    value={offering.description || ''}
                    placeholder="Brief description / scope bullet points..."
                    onChange={(e) => {
                      const updated = [...profile.core_offerings];
                      updated[idx].description = e.target.value;
                      setProfile({ ...profile, core_offerings: updated });
                    }}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Dynamic Qualification Parameters */}
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#4f46e5" />
                <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  3. Dynamic Lead Qualification Rules
                </h3>
              </div>
              <button
                onClick={handleAddQualRule}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={13} /> Add Rule
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(profile.qualification_rules || []).map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', backgroundColor: 'var(--bg-page)' }}>
                  <input
                    type="text"
                    value={rule.label || ''}
                    placeholder="Field Label (e.g. Budget Range / Vehicle Make)"
                    onChange={(e) => {
                      const updated = [...profile.qualification_rules];
                      updated[idx].label = e.target.value;
                      setProfile({ ...profile, qualification_rules: updated });
                    }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12.5px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />

                  <input
                    type="text"
                    value={rule.prompt_nudge || ''}
                    placeholder="Prompt Nudge (e.g. Ask politely about their budget expectations)"
                    onChange={(e) => {
                      const updated = [...profile.qualification_rules];
                      updated[idx].prompt_nudge = e.target.value;
                      setProfile({ ...profile, qualification_rules: updated });
                    }}
                    style={{ flex: 1.5, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />

                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rule.is_mandatory || false}
                      onChange={(e) => {
                        const updated = [...profile.qualification_rules];
                        updated[idx].is_mandatory = e.target.checked;
                        setProfile({ ...profile, qualification_rules: updated });
                      }}
                    />
                    Mandatory
                  </label>

                  <button
                    onClick={() => handleRemoveQualRule(idx)}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Intent Simulator */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '820px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          
          {/* Simulator Header with Real-Time Intent Badge Telemetry */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Live Adaptive Simulator
                </span>
              </div>
              <button
                onClick={() => setSimMessages([{ id: 'init-1', sender: 'bot', text: `Hello! 👋 How can I assist you with ${profile.business_name || 'our services'} today?`, time: '12:00 PM' }])}
                style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Clear History
              </button>
            </div>

            {/* Real-time Telemetry Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, backgroundColor: latestAnalysis.lead_temperature.includes('Hot') ? '#fee2e2' : '#fef3c7', color: latestAnalysis.lead_temperature.includes('Hot') ? '#b91c1c' : '#b45309' }}>
                <Flame size={12} /> {latestAnalysis.lead_temperature} ({latestAnalysis.readiness_score}/100)
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                <Target size={12} /> Intent: {latestAnalysis.intent}
              </span>

              {latestAnalysis.missing_fields && latestAnalysis.missing_fields.length > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Missing: {latestAnalysis.missing_fields.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Chat Stream Viewport */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-page)' }}>
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
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: m.sender === 'user' ? '#4f46e5' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  {formatWhatsAppText(m.text)}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {simulating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', width: 'fit-content' }}>
                <RefreshCw size={14} className="animate-spin" color="#4f46e5" />
                <span style={{ fontSize: '12px', color: '#64748b' }}>AI analyzing intent &amp; synthesizing reply...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Test Prompt Pills */}
          <div style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {[
              'What are your pricing packages?',
              'I need an immediate consultation.',
              'Hi, my phone is +91 98765 43210. Please contact me.'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendSimMessage(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-page)',
                  fontSize: '11.5px',
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
          <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4px 6px 4px 14px' }}>
              <input
                type="text"
                placeholder={`Ask ${profile.business_name || 'NovaByte AI'} anything...`}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={() => handleSendSimMessage()}
                disabled={simulating || !simInput.trim()}
                style={{
                  width: '32px',
                  height: '32px',
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
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
