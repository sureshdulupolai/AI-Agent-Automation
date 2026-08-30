import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NameJourneyModal({ template, onClose, onCreate }) {
  const [journeyName, setJourneyName] = useState(template?.title || 'My Automation Journey');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!journeyName.trim() || loading) return;
    setLoading(true);
    onCreate(journeyName.trim(), template);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        width: '460px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px 28px',
        border: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        {/* Header with Title and Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Name your journey
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '22px' }}>
          Building from <strong style={{ color: 'var(--text-primary)' }}>{template?.title || 'Template'}</strong>. You can change everything once it opens in the studio.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Journey Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              autoFocus
              className="form-input"
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              placeholder="e.g. Use AI Agent on WhatsApp"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13.5px',
                borderRadius: '8px',
                border: '1.5px solid var(--border-subtle)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons matching Chatzy Image 2 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: 'none',
                color: 'var(--primary)',
                padding: '9px 24px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !journeyName.trim()}
              style={{
                backgroundColor: '#4f46e5',
                border: 'none',
                color: '#ffffff',
                padding: '9px 28px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
