import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Palette, 
  Shield, 
  Code2, 
  Save, 
  Send, 
  Check, 
  Copy, 
  MessageSquare, 
  Headphones, 
  CheckCircle2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';

export default function BotDetailsPage({ botId, onBack, onOpenEmbed }) {
  const [bot, setBot] = useState(null);
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [botName, setBotName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [placeholderText, setPlaceholderText] = useState('Type your message...');
  const [businessKnowledge, setBusinessKnowledge] = useState('');
  const [systemInstructions, setSystemInstructions] = useState('');
  const [launcherIcon, setLauncherIcon] = useState('chat');
  const [launcherPosition, setLauncherPosition] = useState('bottom-right');
  const [teaserText, setTeaserText] = useState('How can I help you today?');
  const [showTeaser, setShowTeaser] = useState(true);

  // Interactive Sandbox Chat State
  const [sandboxMessages, setSandboxMessages] = useState([]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxTyping, setSandboxTyping] = useState(false);

  const fetchBot = async () => {
    try {
      const res = await fetch(`/api/bots/${botId}`);
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
        setLauncherIcon(b.launcher_icon || 'chat');
        setLauncherPosition(b.launcher_position || 'bottom-right');
        setTeaserText(b.teaser_text || 'How can I help you today?');
        setShowTeaser(b.show_teaser !== false);

        setSandboxMessages([
          { sender: 'bot', content: b.welcome_message || 'Hello! How can I help you today?' }
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
  }, [botId]);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_name: botName,
          primary_color: primaryColor,
          welcome_message: welcomeMessage,
          placeholder_text: placeholderText,
          business_knowledge: businessKnowledge,
          system_instructions: systemInstructions,
          launcher_icon: launcherIcon,
          launcher_position: launcherPosition,
          teaser_text: teaserText,
          show_teaser: showTeaser
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving bot:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSandboxSend = async (e) => {
    e.preventDefault();
    if (!sandboxInput.trim() || sandboxTyping) return;

    const userText = sandboxInput.trim();
    setSandboxInput('');

    setSandboxMessages(prev => [...prev, { sender: 'user', content: userText }]);
    setSandboxTyping(true);

    try {
      const res = await fetch(`/api/chat/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId: 'sandbox-session-preview'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSandboxMessages(prev => [...prev, { sender: 'bot', content: data.reply }]);
      }
    } catch (err) {
      setSandboxMessages(prev => [...prev, { sender: 'bot', content: 'Connection issue. Please verify backend is running.' }]);
    } finally {
      setSandboxTyping(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
        <p style={{ fontSize: '13px' }}>Loading configuration...</p>
      </div>
    );
  }

  const colorPresets = [
    { label: 'Indigo', color: '#4f46e5' },
    { label: 'Emerald', color: '#059669' },
    { label: 'Violet', color: '#7c3aed' },
    { label: 'Cyan', color: '#0891b2' },
    { label: 'Rose', color: '#e11d48' },
    { label: 'Slate', color: '#334155' }
  ];

  const iconOptions = [
    { id: 'chat', label: 'Chat Bubble', icon: MessageSquare },
    { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
    { id: 'headset', label: 'Support', icon: Headphones },
    { id: 'bot', label: 'Assistant', icon: Bot }
  ];

  const botInitial = getInitialLetter(botName || 'Bot');
  const botInitialBg = getInitialColor(botName || 'Bot');

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12.5px' }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{botName || 'Chatbot'} Studio</h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Configure appearance, icons, knowledge base, and live preview.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onOpenEmbed(bot)} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }}>
            <Code2 size={14} /> Embed Code
          </button>

          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            {savedSuccess ? <CheckCircle2 size={15} /> : <Save size={15} />}
            <span>{saving ? 'Saving...' : savedSuccess ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Tabs/Settings, Right Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Settings Panel */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            marginBottom: '18px'
          }}>
            {[
              { id: 'appearance', label: 'Widget & Icons', icon: Palette },
              { id: 'knowledge', label: 'Knowledge Base', icon: Sparkles },
              { id: 'personality', label: 'Instructions & Tone', icon: Shield },
              { id: 'embed', label: 'Embed Script', icon: Code2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'transparent',
                    backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Widget & Icon Appearance */}
          {activeTab === 'appearance' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Launcher Icon Style */}
              <div>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Launcher Icon Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = launcherIcon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLauncherIcon(opt.id)}
                        style={{
                          padding: '12px 8px',
                          borderRadius: '8px',
                          border: `1.5px solid ${isSelected ? primaryColor : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <Icon size={18} color={isSelected ? primaryColor : 'var(--text-secondary)'} />
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Position */}
              <div className="form-group">
                <label className="form-label">Launcher Position</label>
                <select
                  value={launcherPosition}
                  onChange={(e) => setLauncherPosition(e.target.value)}
                  className="form-select"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              {/* 3. Popup Teaser Callout */}
              <div className="form-group" style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Greeting Callout Bubble
                  </label>
                  <input
                    type="checkbox"
                    checked={showTeaser}
                    onChange={(e) => setShowTeaser(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: primaryColor }}
                  />
                </div>
                <input
                  type="text"
                  value={teaserText}
                  onChange={(e) => setTeaserText(e.target.value)}
                  placeholder="e.g. How can I help you today?"
                  className="form-input"
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              {/* 4. Brand Color */}
              <div className="form-group">
                <label className="form-label">Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {colorPresets.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setPrimaryColor(p.color)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        border: primaryColor === p.color ? '2.5px solid var(--text-primary)' : '1px solid transparent',
                        cursor: 'pointer'
                      }}
                      title={p.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="form-input"
                    style={{ width: '90px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              {/* 5. Display Name */}
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* 6. Welcome Message */}
              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '65px' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Knowledge Base */}
          {activeTab === 'knowledge' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Business Knowledge & FAQs</label>
                <textarea
                  value={businessKnowledge}
                  onChange={(e) => setBusinessKnowledge(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '260px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
                  placeholder="Enter services, pricing, company policies, FAQs, working hours..."
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  The AI model references this knowledge base to generate responses.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Personality */}
          {activeTab === 'personality' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">System Instructions</label>
                <textarea
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '200px' }}
                  placeholder="You are an expert sales consultant for our agency. Always be professional, helpful..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: Embed Code */}
          {activeTab === 'embed' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Add this script tag to your website:
              </p>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: 'var(--bg-subtle)',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  overflowX: 'auto',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {`<script src="http://localhost:5000/widget.js" data-bot-id="${botId}"></script>`}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(`<script src="http://localhost:5000/widget.js" data-bot-id="${botId}"></script>`)}
                  className="btn-secondary"
                  style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', fontSize: '11px' }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Interactive Preview */}
        <div style={{ position: 'sticky', top: '75px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Interactive Preview
            </span>
            <span className="badge badge-green" style={{ fontSize: '10.5px' }}>
              Live
            </span>
          </div>

          {/* Widget Preview Container */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '520px'
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: primaryColor,
              padding: '12px 16px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: botInitialBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255,255,255,0.7)'
                }}>
                  {botInitial}
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>{botName}</h4>
                  <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)' }}>Online</span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {sandboxMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '9px 13px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: 1.45,
                    backgroundColor: msg.sender === 'user' ? primaryColor : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  {msg.content}
                </div>
              ))}

              {sandboxTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '7px 11px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)'
                }}>
                  Thinking...
                </div>
              )}
            </div>

            {/* Chat Footer */}
            <form
              onSubmit={handleSandboxSend}
              style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--border-subtle)',
                background: '#ffffff',
                display: 'flex',
                gap: '6px'
              }}
            >
              <input
                type="text"
                placeholder={placeholderText}
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                style={{
                  flex: 1,
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '7px 11px',
                  fontSize: '12.5px',
                  background: '#f1f5f9',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: primaryColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Launcher Preview */}
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: launcherPosition === 'bottom-left' ? 'flex-start' : 'flex-end', alignItems: 'center', gap: '8px' }}>
            {showTeaser && teaserText && (
              <div style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '6px 11px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)'
              }}>
                {teaserText}
              </div>
            )}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: primaryColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}>
              {launcherIcon === 'sparkles' ? (
                <Sparkles size={20} />
              ) : launcherIcon === 'headset' ? (
                <Headphones size={20} />
              ) : launcherIcon === 'bot' ? (
                <Bot size={20} />
              ) : (
                <MessageSquare size={20} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
