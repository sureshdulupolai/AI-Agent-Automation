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
  onSelectStudio, 
  onOpenEmbed, 
  onOpenWhatsApp,
  onDelete
}) {
  const isWhatsAppConnected = bot.whatsapp_status === 'connected';

  return (
    <div className="glass-panel glass-panel-hover animate-fade-in" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Bar with Avatar, Name, Status */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={bot.bot_avatar_url}
                alt={bot.bot_name}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: `2px solid ${bot.primary_color || '#6366f1'}`
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #0f172a'
              }} />
            </div>

            <div>
              <h3 style={{ fontSize: '17px', color: '#ffffff', marginBottom: '4px' }}>
                {bot.bot_name}
              </h3>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span className="badge badge-green" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Live on Edge
                </span>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: bot.primary_color || '#6366f1',
                  display: 'inline-block'
                }} title="Theme color" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(bot.id)}
            className="btn-outline"
            style={{ padding: '6px', border: 'none', color: 'var(--text-dark)' }}
            title="Delete Bot"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Knowledge Snippet Preview */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {bot.business_knowledge || bot.welcome_message || 'Trained on business FAQs and product catalog.'}
        </p>

        {/* WhatsApp Channel status banner */}
        <div style={{
          background: isWhatsAppConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isWhatsAppConnected ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}`,
          padding: '10px 14px',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} color={isWhatsAppConnected ? '#34d399' : '#94a3b8'} />
            <span style={{ fontSize: '12.5px', color: isWhatsAppConnected ? '#34d399' : 'var(--text-muted)', fontWeight: 500 }}>
              {isWhatsAppConnected ? `WhatsApp: ${bot.whatsapp_number}` : 'WhatsApp: Disconnected'}
            </span>
          </div>

          <button
            onClick={() => onOpenWhatsApp(bot)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isWhatsAppConnected ? 'Manage' : 'Connect QR'}
          </button>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => onSelectStudio(bot)}
          className="btn-primary"
          style={{ padding: '8px 12px', fontSize: '13px' }}
        >
          <Settings size={14} />
          <span>Bot Studio</span>
        </button>

        <button
          onClick={() => onOpenEmbed(bot)}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '13px' }}
        >
          <Code size={14} />
          <span>Embed Code</span>
        </button>
      </div>
    </div>
  );
}
