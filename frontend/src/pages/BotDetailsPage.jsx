import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Bot, 
  Sparkles, 
  Send, 
  Trash2, 
  Code, 
  BookOpen, 
  Sliders, 
  Palette, 
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import EmbedSnippetModal from '../components/bots/EmbedSnippetModal';

const COLOR_PRESETS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#e11d48', '#7c3aed'];

export default function BotDetailsPage({ botId, onBack, onOpenWhatsApp }) {
  const [bot, setBot] = useState(null);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  // Playground state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `play-${Math.random().toString(36).substring(2, 9)}`);
  const chatBottomRef = useRef(null);

  // Fetch bot details
  useEffect(() => {
    async function loadBot() {
      try {
        const res = await fetch(`/api/bots/${botId}`);
        const data = await res.json();
        if (data.bot) {
          setBot(data.bot);
          // Initial greeting in sandbox
          setMessages([
            {
              sender: 'bot',
              content: data.bot.welcome_message || 'Hello! How can I help you today?',
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load bot:', err);
      }
    }
    loadBot();
  }, [botId]);

  // Auto scroll sandbox
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSave = async () => {
    if (!bot) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bots/${bot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bot)
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      alert('Error saving bot: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend || !textToSend.trim() || isTyping) return;

    setInputText('');
    const userMsg = {
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch(`/api/chat/${bot.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          sessionId
        })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            content: data.reply,
            timestamp: data.timestamp || new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          content: 'Error connecting to AI service.',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSimulateLead = () => {
    const sampleLeads = [
      "Hi! I'm John Doe, john.doe@acme.com, phone +1 (555) 345-6789. What would a custom package cost?",
      "My name is Sarah Miller, sarah@cloudpulse.io. Can we schedule a demo call?",
      "Hello, I am Vikram (+91 98123 45678). Interested in pricing and setup."
    ];
    const picked = sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    handleSendMessage(picked);
  };

  if (!bot) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p>Loading Bot Studio...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Navigation & Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="btn-outline" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            <span>Back to Bots</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={bot.bot_avatar_url}
              alt={bot.bot_name}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                objectFit: 'cover',
                border: `2px solid ${bot.primary_color || '#6366f1'}`
              }}
            />
            <div>
              <h1 style={{ fontSize: '22px', color: '#ffffff' }}>{bot.bot_name}</h1>
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
                ● Online • Multi-Channel Ready
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => onOpenWhatsApp(bot)}
            className="btn-secondary"
          >
            <MessageSquare size={16} color="#38bdf8" />
            <span>WhatsApp: {bot.whatsapp_status === 'connected' ? 'Connected' : 'Connect'}</span>
          </button>

          <button
            onClick={() => setIsEmbedModalOpen(true)}
            className="btn-secondary"
          >
            <Code size={16} color="#c084fc" />
            <span>Embed Widget</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ minWidth: '130px' }}
          >
            {saveSuccess ? <CheckCircle2 size={16} color="#34d399" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Config, Right Live Sandbox */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(380px, 0.8fr)',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Studio Tabs */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#090d16',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            {[
              { id: 'knowledge', label: 'Business Knowledge (RAG)', icon: BookOpen },
              { id: 'identity', label: 'Visual & Identity', icon: Palette },
              { id: 'prompt', label: 'AI Guardrails & Prompt', icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '10px',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '4px' }}>
                  Business Knowledge Base & FAQ Training
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Provide your pricing tables, products, service descriptions, policies, and contact information. Gemini AI will answer visitor queries strictly based on this content.
                </p>
              </div>

              <div className="form-group">
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '340px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                  value={bot.business_knowledge || ''}
                  onChange={(e) => setBot({ ...bot, business_knowledge: e.target.value })}
                  placeholder="Paste your business details, pricing lists, services, FAQs, etc."
                />
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '12.5px',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Sparkles size={16} />
                <span>
                  Tip: Use clear headers (e.g. <code>SERVICES:</code>, <code>PRICING:</code>, <code>HOURS:</code>) for maximum AI retrieval precision.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL & IDENTITY */}
          {activeTab === 'identity' && (
            <div className="animate-fade-in">
              <div className="form-group">
                <label className="form-label">Bot Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={bot.bot_name}
                  onChange={(e) => setBot({ ...bot, bot_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={bot.bot_avatar_url}
                  onChange={(e) => setBot({ ...bot, bot_avatar_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Theme Color Accent</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBot({ ...bot, primary_color: color })}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: bot.primary_color === color ? '3px solid #ffffff' : 'none',
                        cursor: 'pointer',
                        boxShadow: bot.primary_color === color ? `0 0 12px ${color}` : 'none'
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={bot.primary_color || '#4f46e5'}
                    onChange={(e) => setBot({ ...bot, primary_color: e.target.value })}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Welcome Message / Initial Greeting</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  value={bot.welcome_message}
                  onChange={(e) => setBot({ ...bot, welcome_message: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chat Input Placeholder</label>
                <input
                  type="text"
                  className="form-input"
                  value={bot.placeholder_text || ''}
                  onChange={(e) => setBot({ ...bot, placeholder_text: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROMPT GUARDRAILS */}
          {activeTab === 'prompt' && (
            <div className="animate-fade-in">
              <div className="form-group">
                <label className="form-label">System Personality & Role</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '120px' }}
                  value={bot.system_instructions || ''}
                  onChange={(e) => setBot({ ...bot, system_instructions: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allowed Embedding Domains (CORS Security)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. * or yourwebsite.com, myshopify.com"
                  value={(bot.allowed_domains || ['*']).join(', ')}
                  onChange={(e) => setBot({ ...bot, allowed_domains: e.target.value.split(',').map(s => s.trim()) })}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-dark)', marginTop: '4px' }}>
                  Use <code>*</code> to permit all domains, or specify exact domains separated by commas.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Sandbox */}
        <div className="glass-panel" style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          height: '620px',
          backgroundColor: '#0c121e',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}>
          {/* Sandbox Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                Live AI Sandbox
              </span>
              <span className="badge badge-green" style={{ fontSize: '10px', padding: '1px 6px' }}>
                Realtime
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleSimulateLead}
                className="btn-outline"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Send simulated contact message to test lead capture"
              >
                <UserCheck size={12} />
                <span>Test Lead Capture</span>
              </button>

              <button
                onClick={() => setMessages([{ sender: 'bot', content: bot.welcome_message, timestamp: new Date().toISOString() }])}
                className="btn-outline"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                title="Clear chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Sandbox Chat Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '6px',
            marginBottom: '14px'
          }}>
            {messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    backgroundColor: isBot ? '#1e293b' : (bot.primary_color || '#4f46e5'),
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    borderBottomLeftRadius: isBot ? '3px' : '14px',
                    borderBottomRightRadius: isBot ? '14px' : '3px',
                    fontSize: '13px',
                    lineHeight: 1.45,
                    border: isBot ? '1px solid var(--border-color)' : 'none',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#1e293b',
                padding: '8px 14px',
                borderRadius: '14px',
                borderBottomLeftRadius: '3px',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                Typing...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick prompt suggestions */}
          {bot.quick_prompts && bot.quick_prompts.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
              {bot.quick_prompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp)}
                  style={{
                    whiteSpace: 'nowrap',
                    background: '#131d31',
                    border: '1px solid var(--border-color)',
                    color: '#38bdf8',
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    cursor: 'pointer'
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Chat input footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
              placeholder={bot.placeholder_text || 'Type your message...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="btn-primary"
              style={{ padding: '8px 14px' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {isEmbedModalOpen && (
        <EmbedSnippetModal
          bot={bot}
          onClose={() => setIsEmbedModalOpen(false)}
        />
      )}
    </div>
  );
}
