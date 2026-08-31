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
      height: '50px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      flexShrink: 0,
      zIndex: 40,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Brand */}
      <div 
        onClick={() => onNavigate('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <img 
          src="/novabyte_logo.jpg" 
          alt="NovaByte AI" 
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            objectFit: 'cover',
            boxShadow: '0 2px 5px rgba(79, 70, 229, 0.25)'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: '#0f172a' }}>
            NovaByte
          </span>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 700,
            background: 'var(--bg-subtle)',
            color: 'var(--primary)',
            border: '1px solid var(--border-subtle)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>
            AI
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Live Demo Site Button */}
        <button
          onClick={() => onNavigate('demo-site')}
          className="btn-secondary"
          style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px' }}
        >
          <Globe size={13} />
          <span>Demo Site</span>
        </button>

        {/* User Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '3px 8px 3px 5px',
          background: 'var(--bg-subtle)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px',
            color: '#ffffff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {initial}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
