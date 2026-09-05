import React, { useState } from 'react';
import { 
  X, 
  Bot, 
  Sparkles,
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
  Check,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INDUSTRY_PRESETS, AUTONOMOUS_CAPABILITIES } from '../../data/industryTemplates';

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed'  // Purple
];

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

export default function BotBuilderModal({ onClose, onCreated }) {
  const [selectedPresetId, setSelectedPresetId] = useState(INDUSTRY_PRESETS[2].id); // Default to Software Agency
  const defaultPreset = INDUSTRY_PRESETS[2];

  const [formData, setFormData] = useState({
    bot_name: defaultPreset.recommendedBotName,
    primary_color: defaultPreset.primaryColor,
    welcome_message: defaultPreset.welcomeMessage,
    placeholder_text: 'Type your message...',
    system_instructions: defaultPreset.systemInstructions,
    business_knowledge: defaultPreset.businessKnowledge,
    quick_prompts: defaultPreset.quickPrompts,
    industry_template: defaultPreset.id,
    training_goals: defaultPreset.defaultCapabilities
  });

  const [enabledCapabilities, setEnabledCapabilities] = useState(defaultPreset.defaultCapabilities);
  const [showAdvancedKnowledge, setShowAdvancedKnowledge] = useState(false);
  const [loading, setLoading] = useState(false);

  // Normalize color for dynamic styling
  const activeColor = (formData.primary_color && formData.primary_color.trim())
    ? (formData.primary_color.trim().startsWith('#') ? formData.primary_color.trim() : `#${formData.primary_color.trim()}`)
    : '#4f46e5';

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFormData(prev => ({
      ...prev,
      industry_template: preset.id,
      bot_name: preset.recommendedBotName,
      primary_color: preset.primaryColor,
      welcome_message: preset.welcomeMessage,
      system_instructions: preset.systemInstructions,
      business_knowledge: preset.businessKnowledge,
      quick_prompts: preset.quickPrompts,
      training_goals: preset.defaultCapabilities
    }));
    setEnabledCapabilities(preset.defaultCapabilities);
  };

  const handleToggleCapability = (capId) => {
    const updated = enabledCapabilities.includes(capId)
      ? enabledCapabilities.filter(id => id !== capId)
      : [...enabledCapabilities, capId];
    setEnabledCapabilities(updated);
    setFormData(prev => ({ ...prev, training_goals: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bot_name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          primary_color: activeColor,
          training_goals: enabledCapabilities
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create bot');

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });

      onCreated(data.bot);
    } catch (err) {
      alert('Error creating bot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '780px',
        maxWidth: '100%',
        maxHeight: '92vh',
        backgroundColor: '#ffffff',
        padding: '28px',
        position: 'relative',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '11px',
              background: `linear-gradient(135deg, ${activeColor}, #0f172a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${activeColor}50`,
              transition: 'all 0.3s ease',
              flexShrink: 0
            }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Create Autonomous AI Agent
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Select an industry template to automatically configure behavior, knowledge, and lead capture.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: Industry Persona Presets */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color={activeColor} />
                <span>1. Select Industry Persona (One-Click Auto-Train)</span>
              </label>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
                Auto-configures prompts, knowledge, and welcome message
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '10px'
            }}>
              {INDUSTRY_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const IconComponent = ICON_MAP[preset.iconName] || Bot;

                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${preset.primaryColor}` : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? `${preset.primaryColor}0c` : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? `0 4px 12px ${preset.primaryColor}25` : '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: preset.primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Check size={11} color="#ffffff" strokeWidth={3} />
                      </div>
                    )}

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? preset.primaryColor : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      transition: 'all 0.18s ease'
                    }}>
                      <IconComponent size={17} color={isSelected ? '#ffffff' : '#475569'} />
                    </div>

                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isSelected ? preset.primaryColor : '#0f172a',
                      lineHeight: 1.3,
                      marginBottom: '3px'
                    }}>
                      {preset.name}
                    </span>

                    <span style={{
                      fontSize: '10.5px',
                      color: '#64748b',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {preset.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Autonomous Capabilities & Contact Capture */}
          <div style={{
            marginBottom: '22px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color={activeColor} />
                <span>2. Autonomous Capabilities & Contact Capture</span>
              </label>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '9999px' }}>
                Active on WhatsApp & Web
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '8px' }}>
              {AUTONOMOUS_CAPABILITIES.map((cap) => {
                const isEnabled = enabledCapabilities.includes(cap.id);
                const CapIcon = ICON_MAP[cap.iconName] || CheckCircle2;

                return (
                  <div
                    key={cap.id}
                    onClick={() => handleToggleCapability(cap.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '9px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isEnabled ? '#ffffff' : 'transparent',
                      border: isEnabled ? '1px solid #cbd5e1' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}} // Handled by parent div
                      style={{ marginTop: '3px', cursor: 'pointer', accentColor: activeColor }}
                    />
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <CapIcon size={14} color={isEnabled ? activeColor : '#94a3b8'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: isEnabled ? '#0f172a' : '#64748b' }}>
                          {cap.name}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.25 }}>
                          {cap.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Agent Identity & Brand Styling */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Chatbot Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CarePlus Assistant"
                value={formData.bot_name}
                onChange={(e) => setFormData({ ...formData, bot_name: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Brand Color</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {activeColor}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {COLOR_PRESETS.map((color) => {
                    const isSelected = activeColor.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setFormData({ ...formData, primary_color: color })}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: isSelected ? '2.5px solid #0f172a' : '2px solid transparent',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          cursor: 'pointer',
                          boxShadow: isSelected ? `0 2px 8px ${color}80` : '0 1px 3px rgba(0,0,0,0.15)',
                          transition: 'all 0.15s ease',
                          padding: 0
                        }}
                      />
                    );
                  })}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '2px 8px',
                  gap: '6px',
                  height: '30px',
                  boxSizing: 'border-box'
                }}>
                  <label style={{ position: 'relative', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0 }}>
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(activeColor) ? activeColor : '#4f46e5'}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      style={{
                        opacity: 0,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      backgroundColor: activeColor,
                      border: '1px solid rgba(0,0,0,0.15)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>#</span>
                  <input
                    type="text"
                    placeholder="4F46E5"
                    maxLength={6}
                    value={activeColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                      setFormData({ ...formData, primary_color: clean ? `#${clean}` : '' });
                    }}
                    style={{
                      width: '58px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none',
                      padding: 0,
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Initial Greeting / Welcome Message</label>
            <input
              type="text"
              className="form-input"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            />
          </div>

          {/* Advanced Training & Knowledge Base Accordion */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <button
              type="button"
              onClick={() => setShowAdvancedKnowledge(!showAdvancedKnowledge)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#f8fafc',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Knowledge Base, FAQs & Custom Instructions
                </span>
                <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600, backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                  Pre-Trained
                </span>
              </div>
              {showAdvancedKnowledge ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
            </button>

            {showAdvancedKnowledge && (
              <div style={{ padding: '14px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '11.5px' }}>
                    Business Knowledge & Scope (Auto-populated from industry preset)
                  </label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '90px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.45 }}
                    value={formData.business_knowledge}
                    onChange={(e) => setFormData({ ...formData, business_knowledge: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px' }}>
                    System Instructions / Behavioral Directives
                  </label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '90px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.45 }}
                    value={formData.system_instructions}
                    onChange={(e) => setFormData({ ...formData, system_instructions: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.bot_name.trim()}
              className="btn-primary"
              style={{
                backgroundColor: activeColor,
                borderColor: activeColor,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} />
              <span>{loading ? 'Deploying...' : 'Deploy Chatbot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

