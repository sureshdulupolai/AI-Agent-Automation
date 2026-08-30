import React from 'react';
import { 
  Bot, 
  Inbox, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Globe, 
  CloudLightning, 
  ShieldCheck,
  Radio
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'AI Bots Studio', icon: Bot },
    { id: 'inbox', label: 'Conversations', icon: Inbox },
    { id: 'leads', label: 'Leads CRM', icon: Users },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3 },
  ];

  const channelNavItems = [
    { id: 'website-channel', label: 'Website Widget', icon: Globe },
    { id: 'whatsapp', label: 'WhatsApp Testing', icon: MessageSquare },
  ];

  const toolsNavItems = [
    { id: 'demo-site', label: 'Client Demo Site', icon: Radio },
    { id: 'deployment', label: 'Cloud Deployment', icon: CloudLightning }
  ];

  const renderNavGroup = (title, items) => (
    <div style={{ marginBottom: '10px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding: '4px 8px 6px 8px'
      }}>
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                outline: 'none',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={14} color={isActive ? 'var(--primary)' : 'currentColor'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside style={{
      width: '210px',
      flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '12px 8px',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div>
        {renderNavGroup('Core Platform', mainNavItems)}
        {renderNavGroup('Channels', channelNavItems)}
        {renderNavGroup('Simulation & Deploy', toolsNavItems)}
      </div>

      {/* Clean Status Card */}
      <div style={{
        padding: '8px 10px',
        background: 'var(--bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ShieldCheck size={14} color="#059669" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>System Live</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gemini & SQLite</span>
        </div>
      </div>
    </aside>
  );
}
