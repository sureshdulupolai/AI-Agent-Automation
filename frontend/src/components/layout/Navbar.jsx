import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Globe } from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../../utils/avatarUtils';

export default function Navbar({ onNavigate, currentPage }) {
  const { user } = useAuth();
  const userName = user?.full_name || 'Suresh Polai';
  const initial = getInitialLetter(userName);
  const avatarBg = getInitialColor(userName);

  return (
    <header style={{
      height: '60px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
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
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
        }}>
          <Bot size={18} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16.5px', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: '#0f172a' }}>
            OmniBot
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            background: 'var(--bg-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 6px',
            borderRadius: '5px'
          }}>
            PRO
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live Demo Site Button */}
        <button
          onClick={() => onNavigate('demo-site')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '7px' }}
        >
          <Globe size={14} />
          <span>Demo Site</span>
        </button>

        {/* User Profile Badge with Deterministic Initial Color */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px 4px 6px',
          background: 'var(--bg-subtle)',
          borderRadius: '20px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
            color: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {initial}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
