import React, { useState } from 'react';
import { X, Bot, Sparkles, Check, Palette, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
];

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed'  // Purple
];

export default function BotBuilderModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    bot_name: '',
    bot_avatar_url: AVATAR_PRESETS[0],
    primary_color: COLOR_PRESETS[0],
    welcome_message: 'Hi there! 👋 How can I help you today?',
    placeholder_text: 'Type your question here...',
    system_instructions: 'You are a polite, helpful, and highly knowledgeable AI sales representative. Guide the customer and capture their contact info when relevant.',
    business_knowledge: '',
    quick_prompts: ['What are your services?', 'Pricing information', 'Contact support']
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bot_name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '720px',
        maxWidth: '100%',
        maxHeight: '90vh',
        backgroundColor: '#0f172a',
        padding: '28px',
        position: 'relative',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', color: '#ffffff' }}>Create New AI Chatbot</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Configure identity, theme, and train on your business knowledge.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bot Name & Avatar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Chatbot Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Zenith Tech Assistant"
                value={formData.bot_name}
                onChange={(e) => setFormData({ ...formData, bot_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                {COLOR_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormData({ ...formData, primary_color: color })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: formData.primary_color === color ? '2.5px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      boxShadow: formData.primary_color === color ? `0 0 10px ${color}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Avatar Presets */}
          <div className="form-group">
            <label className="form-label">Select Avatar Preset</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              {AVATAR_PRESETS.map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt={`Preset ${idx + 1}`}
                  onClick={() => setFormData({ ...formData, bot_avatar_url: avatar })}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: formData.bot_avatar_url === avatar ? '3px solid #6366f1' : '2px solid #334155',
                    transform: formData.bot_avatar_url === avatar ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Welcome Message */}
          <div className="form-group">
            <label className="form-label">Greeting / Welcome Message</label>
            <input
              type="text"
              className="form-input"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            />
          </div>

          {/* Business Knowledge Base */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Business Knowledge & FAQs (RAG Training)</label>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>Gemini AI Contextual Brain</span>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Paste your business details, pricing tiers, services offered, FAQs, working hours, and contact details here..."
              rows={4}
              value={formData.business_knowledge}
              onChange={(e) => setFormData({ ...formData, business_knowledge: e.target.value })}
            />
          </div>

          {/* System Instructions */}
          <div className="form-group">
            <label className="form-label">AI System Prompt / Personality</label>
            <input
              type="text"
              className="form-input"
              value={formData.system_instructions}
              onChange={(e) => setFormData({ ...formData, system_instructions: e.target.value })}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Sparkles size={16} />
              <span>{loading ? 'Creating Bot...' : 'Deploy AI Bot (₹0 Free)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
