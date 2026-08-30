import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Globe, 
  CloudLightning, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'AI Bots Studio', icon: Bot, badge: 'Active' },
    { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, badge: 'QR/Meta' },
    { id: 'leads', label: 'Leads CRM', icon: Users, badge: 'Realtime' },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3 },
    { id: 'demo-site', label: 'Live Client Demo', icon: Globe, highlight: true },
    { id: 'deployment', label: 'Free Cloud Deploy', icon: CloudLightning }
  ];

  return (
    <aside style={{
      width: '260px',
      borderRight: '1px solid var(--border-color)',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      minHeight: 'calc(100vh - 70px)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-dark)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 12px 8px 12px'
        }}>
          OmniBot Control Center
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
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.1))' 
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(99, 102, 241, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Free Tier Capacity Card */}
      <div className="glass-panel" style={{
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.05))',
        borderColor: 'rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="#34d399" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
            Zero-Cost Stack
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '10px' }}>
          Running on Gemini 2.0 Flash (1.5k free/day), Supabase 500MB DB & Vercel Edge.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#34d399',
          fontWeight: 600
        }}>
          <span>Current Cost: ₹0 / $0</span>
          <span>100% Free</span>
        </div>
      </div>
    </aside>
  );
}
