import React from 'react';
import { 
  Bot, 
  Inbox, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Globe, 
  CloudLightning, 
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'AI Bots Studio', icon: Bot },
    { id: 'inbox', label: 'Live Inbox', icon: Inbox },
    { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare },
    { id: 'leads', label: 'Leads CRM', icon: Users },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3 },
    { id: 'demo-site', label: 'Client Demo Site', icon: Globe },
    { id: 'deployment', label: 'Cloud Deployment', icon: CloudLightning }
  ];

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '12px 10px',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 8px 8px 8px'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
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
                padding: '8px 10px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '12.5px',
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
              <Icon size={15} color={isActive ? 'var(--primary)' : 'currentColor'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Clean Status Card */}
      <div style={{
        padding: '10px',
        background: 'var(--bg-subtle)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ShieldCheck size={15} color="#059669" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>System Operational</span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Gemini & Local DB</span>
        </div>
      </div>
    </aside>
  );
}
