import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Sun, Moon, Globe } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage, theme, onToggleTheme }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '62px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Brand */}
      <div 
        onClick={() => onNavigate('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
        }}>
          <Bot size={20} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            OmniBot
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            background: 'var(--bg-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 7px',
            borderRadius: '6px'
          }}>
            PRO
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '8px' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#4f46e5" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Live Demo Site Button */}
        <button
          onClick={() => onNavigate('demo-site')}
          className="btn-secondary"
          style={{ padding: '6px 13px', fontSize: '12.5px', borderRadius: '8px' }}
        >
          <Globe size={14} />
          <span>Demo Site</span>
        </button>

        {/* User Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          background: 'var(--bg-subtle)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px',
            color: '#ffffff'
          }}>
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.full_name}</span>
        </div>
      </div>
    </header>
  );
}
