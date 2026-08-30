import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Code, 
  Settings, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function BotCard({ 
  bot, 
  onSelect, 
  onOpenEmbed, 
  onOpenWhatsApp,
  onDelete
}) {
  const isWhatsAppConnected = bot.whatsapp_status === 'connected';

  return (
    <div className="glass-panel glass-panel-hover animate-fade-in" style={{
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar with Avatar, Name, Status */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={bot.bot_avatar_url}
                alt={bot.bot_name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: `2px solid ${bot.primary_color || 'var(--primary)'}`
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid var(--bg-surface)'
              }} />
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                {bot.bot_name}
              </h3>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className="badge badge-green" style={{ fontSize: '10.5px', padding: '1px 7px' }}>
                  Live on Edge
                </span>
                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: bot.primary_color || 'var(--primary)',
                  display: 'inline-block'
                }} title="Brand color" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(bot.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Delete bot"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Welcome Message preview */}
        <p style={{
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          "{bot.welcome_message || 'Hello! How can I help you today?'}"
        </p>

        {/* WhatsApp Connection Tag */}
        <div style={{
          padding: '9px 12px',
          borderRadius: '10px',
          background: isWhatsAppConnected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-subtle)',
          border: `1px solid ${isWhatsAppConnected ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <MessageSquare size={15} color={isWhatsAppConnected ? '#059669' : 'var(--text-muted)'} />
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isWhatsAppConnected ? '#059669' : 'var(--text-secondary)'
            }}>
              {isWhatsAppConnected ? (bot.whatsapp_number || 'WhatsApp Connected') : 'WhatsApp Automation'}
            </span>
          </div>

          <button
            onClick={onOpenWhatsApp}
            style={{
              border: 'none',
              background: 'transparent',
              color: isWhatsAppConnected ? '#059669' : 'var(--primary)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isWhatsAppConnected ? 'Manage' : 'Link'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onSelect}
          className="btn-primary"
          style={{ padding: '8px 12px', fontSize: '12.5px' }}
        >
          <Settings size={14} />
          <span>Studio & Icons</span>
        </button>

        <button
          onClick={onOpenEmbed}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '12.5px' }}
        >
          <Code size={14} />
          <span>Embed Code</span>
        </button>
      </div>
    </div>
  );
}
