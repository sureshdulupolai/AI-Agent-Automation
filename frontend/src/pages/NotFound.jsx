import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, Sparkles, Compass, MessageSquare, Activity, Cpu } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '48px 36px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Top Glow */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }}></div>

        {/* 404 Badge Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4f46e5',
          margin: '0 auto 20px auto',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.15)'
        }}>
          <FileQuestion size={36} />
        </div>

        {/* Status Tag */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 12px',
          borderRadius: '16px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#dc2626',
          fontSize: '12px',
          fontWeight: 800,
          marginBottom: '12px',
          letterSpacing: '0.04em'
        }}>
          HTTP 404 • Page Not Found
        </span>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          color: 'var(--text-primary)',
          margin: '0 0 10px 0',
          letterSpacing: '-0.02em'
        }}>
          Lost in the Autonomous Cloud?
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          margin: '0 0 32px 0',
          lineHeight: 1.6
        }}>
          The page or dynamic resource you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 20px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <Home size={15} />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Helpful Quick Navigation Links */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Quick Links:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => navigate('/universal-studio')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <Cpu size={14} color="#4f46e5" />
              <span>Universal AI Studio</span>
            </button>

            <button
              onClick={() => navigate('/campaigns')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <MessageSquare size={14} color="#16a34a" />
              <span>Campaigns Hub</span>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <Activity size={14} color="#7c3aed" />
              <span>Task Command Center</span>
            </button>

            <button
              onClick={() => navigate('/inbox')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              <Compass size={14} color="#0284c7" />
              <span>Omni-Channel Inbox</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
