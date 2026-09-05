import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Palette, 
  Globe, 
  FileText, 
  HelpCircle, 
  Save, 
  Send, 
  Check, 
  Copy, 
  MessageSquare, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Smartphone,
  Zap,
  Info,
  CheckCheck,
  Filter,
  X,
  Stethoscope,
  Building2,
  Code2,
  ShoppingBag,
  Target,
  GraduationCap,
  Utensils,
  Headphones,
  Mail,
  Mic,
  Image as ImageIcon,
  Languages,
  Briefcase,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INDUSTRY_PRESETS, AUTONOMOUS_CAPABILITIES } from '../data/industryTemplates';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';

const ICON_MAP = {
  Stethoscope,
  Building2,
  Code2,
  ShoppingBag,
  Target,
  GraduationCap,
  Utensils,
  Headphones,
  Mail,
  Mic,
  Image: ImageIcon,
  Languages,
  Briefcase
};
import { formatWhatsAppText } from '../utils/formatWhatsAppText';
import TypewriterMessage from '../components/common/TypewriterMessage';

export default function BotDetailsPage({ bots = [], onBack, onOpenEmbed }) {
  const { botId: routeBotId } = useParams();
  const navigate = useNavigate();
  const activeBotId = routeBotId || (bots[0]?.id || '');

  const [bot, setBot] = useState(null);
  const [activeTab, setActiveTab] = useState('training'); // 'training' | 'appearance' | 'channels'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Training & Knowledge Form State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlResult, setCrawlResult] = useState(null);

  const [systemInstructions, setSystemInstructions] = useState('');
  const [businessKnowledge, setBusinessKnowledge] = useState('');
  const [selectedIndustryId, setSelectedIndustryId] = useState('software_agency');
  const [enabledCapabilities, setEnabledCapabilities] = useState(['lead_capture', 'voice_notes', 'media_inspection', 'language_mirroring']);
  const [faqs, setFaqs] = useState([
    { question: 'What services do you offer?', answer: 'We specialize in custom web development, AI chatbots, and full-stack SaaS automation.' },
    { question: 'What is your turnaround time?', answer: 'Most custom websites and AI chatbots are delivered within 3 to 7 business days.' }
  ]);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Appearance State
  const [botName, setBotName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Type your message...');
  const [launcherIcon, setLauncherIcon] = useState('chat');
  const [launcherPosition, setLauncherPosition] = useState('bottom-right');
  const [teaserText, setTeaserText] = useState('How can I help you today?');
  const [showTeaser, setShowTeaser] = useState(true);

  // WhatsApp Status & Trigger Filter
  const [waStatus, setWaStatus] = useState({ status: 'disconnected', phoneNumber: null });
  const [replyMode, setReplyMode] = useState('all'); // 'all' | 'keywords'
  const [keywords, setKeywords] = useState([
    'website', 'price', 'pricing', 'cost', 'ai', 'chatbot', 'service', 'portfolio', 'package', 'quote', 'hire', 'demo', 'contact'
  ]);
  const [newKeyword, setNewKeyword] = useState('');

  // Interactive Sandbox Chat State
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxTyping, setSandboxTyping] = useState(false);
  const sandboxBoxRef = useRef(null);

  const fetchBot = async () => {
    if (!activeBotId) return;
    try {
      const res = await fetch(`/api/bots/${activeBotId}`);
      if (res.ok) {
        const data = await res.json();
        const b = data.bot;
        setBot(b);
        setBotName(b.bot_name || '');
        setPrimaryColor(b.primary_color || '#4f46e5');
        setWelcomeMessage(b.welcome_message || 'Hello! How can I help you today?');
        setPlaceholderText(b.placeholder_text || 'Type your message...');
        setBusinessKnowledge(b.business_knowledge || '');
        setSystemInstructions(b.system_instructions || '');
        setWebsiteUrl(b.website_url || '');
        setLauncherIcon(b.launcher_icon || 'chat');
        setLauncherPosition(b.launcher_position || 'bottom-right');
        setTeaserText(b.teaser_text || 'How can I help you today?');
        setShowTeaser(b.show_teaser !== false);

        if (b.industry_template) setSelectedIndustryId(b.industry_template);
        if (Array.isArray(b.training_goals) && b.training_goals.length > 0) {
          setEnabledCapabilities(b.training_goals);
        }

        setReplyMode(b.whatsapp_reply_mode || 'all');
        if (Array.isArray(b.whatsapp_keywords) && b.whatsapp_keywords.length > 0) {
          setKeywords(b.whatsapp_keywords);
        }

        setWaStatus({
          status: b.whatsapp_status || 'disconnected',
          phoneNumber: b.whatsapp_number || null
        });

        setSandboxMessages([
          { sender: 'bot', content: b.welcome_message || 'Hello! How can I help you today?', time: 'Just now' }
        ]);
      }
    } catch (err) {
      console.error('Error loading bot details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBot();
  }, [activeBotId]);

  // Scroll internal sandbox chat only (never scroll outer page/window)
  useEffect(() => {
    if (sandboxBoxRef.current) {
      sandboxBoxRef.current.scrollTop = sandboxBoxRef.current.scrollHeight;
    }
  }, [sandboxMessages, sandboxTyping]);

  // Save Bot Details
  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    // Append FAQs to knowledge if any
    let compiledKnowledge = businessKnowledge;
    if (faqs.length > 0) {
      const faqText = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
      if (!compiledKnowledge.includes('FREQUENTLY ASKED QUESTIONS')) {
        compiledKnowledge = `${compiledKnowledge}\n\n---\nFREQUENTLY ASKED QUESTIONS:\n${faqText}`.trim();
      }
    }

    try {
      const res = await fetch(`/api/bots/${activeBotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_name: botName,
          primary_color: primaryColor,
          welcome_message: welcomeMessage,
          placeholder_text: placeholderText,
          business_knowledge: compiledKnowledge,
          system_instructions: systemInstructions,
          website_url: websiteUrl,
          launcher_icon: launcherIcon,
          launcher_position: launcherPosition,
          teaser_text: teaserText,
          show_teaser: showTeaser,
          whatsapp_reply_mode: replyMode,
          whatsapp_keywords: keywords,
          industry_template: selectedIndustryId,
          training_goals: enabledCapabilities
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        confetti({ particleCount: 25, spread: 35, origin: { y: 0.6 } });
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving bot:', err);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Crawl Website
  const handleCrawlWebsite = async () => {
    if (!websiteUrl.trim()) {
      alert('Please enter a valid website URL (e.g. https://yourcompany.com)');
      return;
    }
    setCrawling(true);
    setCrawlResult(null);

    try {
      const res = await fetch(`/api/bots/${activeBotId}/crawl-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to crawl website');

      setCrawlResult(data);
      if (data.bot?.business_knowledge) {
        setBusinessKnowledge(data.bot.business_knowledge);
      }
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.5 } });
    } catch (err) {
      alert('Crawling failed: ' + err.message);
    } finally {
      setCrawling(false);
    }
  };

  // Add FAQ pair
  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFaqs(prev => [...prev, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (index) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
  };

  // Add Keyword tag
  const handleAddKeyword = (e) => {
    if (e) e.preventDefault();
    const tag = newKeyword.trim().toLowerCase();
    if (!tag) return;
    if (!keywords.includes(tag)) {
      setKeywords(prev => [...prev, tag]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (tagToRemove) => {
    setKeywords(prev => prev.filter(t => t !== tagToRemove));
  };

  // Test Sandbox message sending
  const handleSendSandbox = async (e) => {
    if (e) e.preventDefault();
    const text = sandboxInput.trim();
    if (!text || sandboxTyping || !activeBotId) return;

    setSandboxMessages(prev => [...prev, { sender: 'user', content: text, time: 'Just now' }]);
    setSandboxInput('');
    setSandboxTyping(true);

    try {
      const res = await fetch(`/api/bots/${activeBotId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: 'sandbox-test-session'
        })
      });

      const data = await res.json();
      setSandboxTyping(false);

      if (data.reply) {
        setSandboxMessages(prev => [
          ...prev,
          { sender: 'bot', content: data.reply, time: 'Just now', isStreaming: true }
        ]);
      }
    } catch (err) {
      setSandboxTyping(false);
      setSandboxMessages(prev => [
        ...prev,
        { sender: 'bot', content: `⚠️ Error: ${err.message}`, time: 'Just now', isStreaming: true }
      ]);
    }
  };

  // One-Click Industry Preset Applier
  const handleApplyPreset = (preset) => {
    setSelectedIndustryId(preset.id);
    setSystemInstructions(preset.systemInstructions);
    if (!businessKnowledge.trim() || window.confirm(`Replace Knowledge Base with ${preset.name} catalog and FAQs as well?`)) {
      setBusinessKnowledge(preset.businessKnowledge);
    }
    if (preset.defaultCapabilities) {
      setEnabledCapabilities(preset.defaultCapabilities);
    }
    if (preset.quickPrompts && preset.quickPrompts.length > 0) {
      setFaqs(preset.quickPrompts.map(q => ({ question: q, answer: `Information regarding ${q}.` })));
    }
  };

  const handleToggleCapability = (capId) => {
    setEnabledCapabilities(prev =>
      prev.includes(capId) ? prev.filter(id => id !== capId) : [...prev, capId]
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
        <p style={{ fontSize: '13px' }}>Loading AI Agent Studio...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#71717a'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                {botName || 'AI Agent Studio'}
              </h1>
              <span style={{
                backgroundColor: waStatus.status === 'connected' ? '#dcfce7' : '#f4f4f5',
                color: waStatus.status === 'connected' ? '#166534' : '#71717a',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700
              }}>
                {waStatus.status === 'connected' ? 'WhatsApp Active' : 'Offline / Standby'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#71717a', margin: '2px 0 0 0' }}>
              Train your agent with website content, behavioral instructions, and WhatsApp automation rules.
            </p>
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            backgroundColor: savedSuccess ? '#10b981' : 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : (savedSuccess ? <Check size={14} /> : <Save size={14} />)}
          <span>{saving ? 'Saving...' : (savedSuccess ? 'Saved Changes!' : 'Save & Update Agent')}</span>
        </button>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        backgroundColor: '#f4f4f5',
        border: '1px solid #e4e4e7',
        padding: '4px',
        borderRadius: '10px',
        marginBottom: '20px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('training')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: activeTab === 'training' ? '#ffffff' : 'transparent',
            color: activeTab === 'training' ? '#09090b' : '#71717a',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeTab === 'training' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Sparkles size={15} color="var(--primary)" />
          <span>Train Agent &amp; Knowledge</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: activeTab === 'appearance' ? '#ffffff' : 'transparent',
            color: activeTab === 'appearance' ? '#09090b' : '#71717a',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeTab === 'appearance' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Palette size={15} />
          <span>Appearance &amp; Widget</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: activeTab === 'channels' ? '#ffffff' : 'transparent',
            color: activeTab === 'channels' ? '#09090b' : '#71717a',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeTab === 'channels' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Smartphone size={15} color="#10b981" />
          <span>WhatsApp &amp; Channels</span>
        </button>
      </div>

      {/* Main Two-Column Layout (Config on Left, Live Preview on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Editor & Knowledge Sources */}
        <div>
          
          {/* ========================================================================= */}
          {/* TAB 1: TRAIN AGENT & KNOWLEDGE */}
          {/* ========================================================================= */}
          {activeTab === 'training' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* SOURCE 1: WEBSITE CRAWLER (Chatzy Style) */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Globe size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Train with Your Website (Recommended)
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#71717a', margin: '0 0 14px 0' }}>
                  Point your agent at your website URL. We'll crawl pages, extract services, pricing, and FAQs automatically.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
                      https://
                    </span>
                    <input
                      type="text"
                      placeholder="www.yourcompany.com"
                      value={websiteUrl.replace(/^https?:\/\//, '')}
                      onChange={(e) => setWebsiteUrl('https://' + e.target.value.replace(/^https?:\/\//, ''))}
                      style={{ width: '100%', padding: '9px 12px 9px 68px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCrawlWebsite}
                    disabled={crawling || !websiteUrl.trim()}
                    className="btn-primary"
                    style={{ padding: '9px 16px', fontSize: '12.5px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {crawling ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                    <span>{crawling ? 'Crawling...' : 'Crawl & Extract'}</span>
                  </button>
                </div>

                {crawlResult && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#166534' }}>
                    <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#22c55e" />
                      <span>Extracted: {crawlResult.title}</span>
                    </div>
                    <div style={{ marginTop: '4px', color: '#15803d' }}>
                      {crawlResult.extractedSnippet}...
                    </div>
                  </div>
                )}
              </div>

              {/* SOURCE 2: BEHAVIORAL PROMPT & PERSONA INSTRUCTIONS */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={18} color="#7c3aed" />
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      Agent Instructions &amp; Behavioral Prompt
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600 }}>Governs tone &amp; rules</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#71717a', margin: '0 0 12px 0' }}>
                  Instruct the AI on how to represent your business on WhatsApp and Website chat.
                </p>

                {/* One-Click Industry Training Presets */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14} color="#7c3aed" />
                      <span>One-Click Industry Presets:</span>
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Select to instantly retrain behavioral tone and directives
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                    gap: '8px'
                  }}>
                    {INDUSTRY_PRESETS.map((preset) => {
                      const isSelected = selectedIndustryId === preset.id;
                      const PresetIcon = ICON_MAP[preset.iconName] || Bot;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: isSelected ? `2px solid ${preset.primaryColor}` : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? `${preset.primaryColor}10` : '#f8fafc',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? preset.primaryColor : '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <PresetIcon size={13} color={isSelected ? '#ffffff' : '#475569'} />
                          </div>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? preset.primaryColor : '#334155',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Autonomous Capabilities Checklist */}
                <div style={{
                  marginBottom: '14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={13} color="#7c3aed" />
                      <span>Autonomous Capabilities &amp; Contact Capture</span>
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                      WhatsApp &amp; Web
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '6px' }}>
                    {AUTONOMOUS_CAPABILITIES.map((cap) => {
                      const isEnabled = enabledCapabilities.includes(cap.id);
                      const CapIcon = ICON_MAP[cap.iconName] || CheckCircle2;

                      return (
                        <div
                          key={cap.id}
                          onClick={() => handleToggleCapability(cap.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: isEnabled ? '#ffffff' : 'transparent',
                            border: isEnabled ? '1px solid #cbd5e1' : '1px solid transparent',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => {}}
                            style={{ cursor: 'pointer', accentColor: '#7c3aed' }}
                          />
                          <CapIcon size={13} color={isEnabled ? '#7c3aed' : '#94a3b8'} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', fontWeight: isEnabled ? 700 : 500, color: isEnabled ? '#0f172a' : '#64748b' }}>
                            {cap.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  placeholder="e.g. You are Suresh's Digital Agency AI representative. Be polite, explain our web development packages ($499-$2500), and capture lead contact info..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* SOURCE 3: BUSINESS KNOWLEDGE & CATALOG */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <FileText size={18} color="#0891b2" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Business Knowledge &amp; Pricing Catalog
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#71717a', margin: '0 0 12px 0' }}>
                  Detailed facts, services, package prices, turnaround times, and refund policies.
                </p>

                <textarea
                  rows={6}
                  value={businessKnowledge}
                  onChange={(e) => setBusinessKnowledge(e.target.value)}
                  placeholder="Add details: Services, Pricing tiers ($499, $999, $1499), Tech stack, Delivery timelines, Contact info..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* SOURCE 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <HelpCircle size={18} color="#ea580c" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Q&amp;A Knowledge Pairs (FAQs)
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#71717a', margin: '0 0 14px 0' }}>
                  Add common customer questions and the exact answers your AI bot should provide.
                </p>

                {/* FAQ List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {faqs.map((faq, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', position: 'relative' }}>
                      <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a', marginBottom: '3px' }}>
                        Q: {faq.question}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        A: {faq.answer}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new FAQ inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Question</label>
                    <input
                      type="text"
                      placeholder="e.g. Do you provide post-launch support?"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Answer</label>
                    <input
                      type="text"
                      placeholder="e.g. Yes, 30 days free support included."
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="btn-secondary"
                    style={{ padding: '7px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: APPEARANCE & WIDGET */}
          {/* ========================================================================= */}
          {activeTab === 'appearance' && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e4e4e7',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Bot / Agent Name:
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Primary Brand Color:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Welcome Greeting Message:
                </label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Input Placeholder Text:
                </label>
                <input
                  type="text"
                  value={placeholderText}
                  onChange={(e) => setPlaceholderText(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WHATSAPP & CHANNELS */}
          {/* ========================================================================= */}
          {activeTab === 'channels' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* WhatsApp Connection Status Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e4e4e7',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={20} color="#10b981" />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      WhatsApp Channel Hub
                    </h3>
                  </div>

                  <span style={{
                    backgroundColor: waStatus.status === 'connected' ? '#dcfce7' : '#f4f4f5',
                    color: waStatus.status === 'connected' ? '#166534' : '#71717a',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontWeight: 700
                  }}>
                    {waStatus.status === 'connected' ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {waStatus.status === 'connected' ? (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                      Linked Number: {waStatus.phoneNumber}
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#15803d', margin: '4px 0 16px 0' }}>
                      All incoming messages on this WhatsApp number are answered by your trained AI model.
                    </p>
                    <button
                      onClick={() => navigate('/channels/whatsapp')}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12.5px', backgroundColor: '#10b981' }}
                    >
                      Open WhatsApp Testing Hub
                    </button>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <Smartphone size={36} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                      Pair WhatsApp Device (No API Key Required)
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#64748b', maxWidth: '420px', margin: '0 auto 16px auto' }}>
                      Scan QR code or use an 8-Digit code to link your WhatsApp number directly to this bot.
                    </p>
                    <button
                      onClick={() => navigate(`/channels/whatsapp?botId=${activeBotId}`)}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '12.5px', backgroundColor: '#10b981' }}
                    >
                      Pair WhatsApp Device Now &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Trigger Filter & Keywords Settings */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #e0e7ff',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Filter size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Auto-Reply Policy &amp; Trigger Keywords
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px 0' }}>
                  Choose whether the AI should answer all incoming messages or only trigger when specific business keywords are detected.
                </p>

                {/* Professional Segmented Control Mode Toggle (No emojis) */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '14px'
                }}>
                  <button
                    type="button"
                    onClick={() => setReplyMode('all')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: replyMode === 'all' ? '1px solid #e2e8f0' : 'none',
                      backgroundColor: replyMode === 'all' ? '#ffffff' : 'transparent',
                      color: replyMode === 'all' ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: replyMode === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Zap size={13} color={replyMode === 'all' ? '#16a34a' : '#94a3b8'} />
                    <span>All Incoming Messages</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReplyMode('keywords')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: replyMode === 'keywords' ? '1px solid #e2e8f0' : 'none',
                      backgroundColor: replyMode === 'keywords' ? '#ffffff' : 'transparent',
                      color: replyMode === 'keywords' ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: replyMode === 'keywords' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Filter size={13} color={replyMode === 'keywords' ? '#4f46e5' : '#94a3b8'} />
                    <span>Keyword Triggers Only</span>
                  </button>
                </div>

                {replyMode === 'keywords' && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Active Trigger Keywords:
                    </label>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {keywords.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#1e293b'
                          }}
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(tag)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <form onSubmit={handleAddKeyword} style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Add keyword tag (e.g. package, website, quote)..."
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <button
                        type="submit"
                        disabled={!newKeyword.trim()}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} />
                        <span>Add Tag</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Live Interactive Sandbox Chat */}
        <div style={{
          position: 'sticky',
          top: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #d1d5db',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '620px'
        }}>
          {/* Chat Header */}
          <div style={{
            backgroundColor: primaryColor,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                {botName ? botName.charAt(0) : 'B'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>{botName} (Live Preview)</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>Trained AI Assistant</div>
              </div>
            </div>

            <button
              onClick={() => setSandboxMessages([{ sender: 'bot', content: welcomeMessage, time: 'Just now' }])}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
              title="Reset Preview Chat"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            ref={sandboxBoxRef}
            style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {sandboxMessages.map((m, idx) => {
              const isUser = m.sender === 'user';
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%',
                    backgroundColor: isUser ? primaryColor : '#ffffff',
                    color: isUser ? '#ffffff' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    fontSize: '13px',
                    lineHeight: 1.45
                  }}>
                    <TypewriterMessage
                      text={m.content}
                      isStreaming={m.isStreaming}
                      speed={18}
                      formatter={formatWhatsAppText}
                      onStreamEnd={() => { m.isStreaming = false; }}
                    />
                  </div>
                </div>
              );
            })}

            {sandboxTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={12} className="animate-spin" color={primaryColor} />
                  <span>{botName} is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendSandbox}
            style={{
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question to test AI training..."
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
            <button
              type="submit"
              disabled={sandboxTyping || !sandboxInput.trim()}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: primaryColor,
                color: '#ffffff',
                border: 'none',
                cursor: sandboxTyping || !sandboxInput.trim() ? 'not-allowed' : 'pointer',
                opacity: sandboxTyping || !sandboxInput.trim() ? 0.6 : 1
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
