import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Sparkles, Zap, Globe, ShieldCheck } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand */}
      <div 
        onClick={() => onNavigate('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Bot size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '19px', fontWeight: 800, fontFamily: 'var(--font-heading)' }} className="gradient-text">
              OmniBot
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '6px',
              letterSpacing: '0.05em'
            }}>
              SAAS FREE
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dark)' }}>
            100% Free AI Chatbot & WhatsApp Platform
          </span>
        </div>
      </div>

      {/* Center status badge */}
      <div style={{
        display: 'none',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        padding: '6px 14px',
        borderRadius: '9999px',
        fontSize: '12.5px',
        color: '#34d399'
      }} className="pulse-green md-flex">
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
        <span style={{ fontWeight: 600 }}>Gemini 2.0 Flash & Baileys QR: 100% Active</span>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => onNavigate('demo-site')}
          className="btn-secondary"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <Globe size={16} color="#38bdf8" />
          <span>Live Demo Site</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px'
          }}>
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{user?.full_name}</span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>₹0 Free Pro Plan</span>
          </div>
        </div>
      </div>
    </header>
  );
}
