import React, { useState } from 'react';
import { X, Bot, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getInitialColor, getInitialLetter } from '../../utils/avatarUtils';

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed'  // Purple
];

export default function BotBuilderModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    bot_name: '',
    primary_color: COLOR_PRESETS[0],
    welcome_message: 'Hello! How can I help you today?',
    placeholder_text: 'Type your message...',
    system_instructions: 'You are a polite, helpful, and knowledgeable AI sales representative. Guide the customer and capture their contact info when relevant.',
    business_knowledge: '',
    quick_prompts: ['What services do you offer?', 'Pricing details', 'Talk to support']
  });

  const [loading, setLoading] = useState(false);

  const botInitial = getInitialLetter(formData.bot_name || 'Bot');
  const botInitialBg = getInitialColor(formData.bot_name || 'Bot');

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
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '680px',
        maxWidth: '100%',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        padding: '28px',
        position: 'relative',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Create New AI Chatbot</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Configure identity, theme, and knowledge base.
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
          {/* Bot Name & Initial Badge Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Chatbot Name *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: botInitialBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#ffffff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}>
                  {botInitial}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Zenith Support"
                  value={formData.bot_name}
                  onChange={(e) => setFormData({ ...formData, bot_name: e.target.value })}
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Brand Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                {COLOR_PRESETS.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setFormData({ ...formData, primary_color: color })}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: formData.primary_color === color ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="form-group">
            <label className="form-label">Welcome Message</label>
            <input
              type="text"
              className="form-input"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            />
          </div>

          {/* Business Knowledge Base (RAG Training) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Knowledge Base (FAQs, Services, Pricing)
              </label>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                Gemini Active
              </span>
            </div>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              placeholder="Provide information about your business:&#10;- Services offered: Web development, AI Chatbots&#10;- Pricing: Starter is ₹4,999, Pro is ₹14,999&#10;- Working hours: 9 AM - 6 PM IST"
              value={formData.business_knowledge}
              onChange={(e) => setFormData({ ...formData, business_knowledge: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
            >
              <Sparkles size={15} />
              <span>{loading ? 'Creating...' : 'Create Chatbot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
