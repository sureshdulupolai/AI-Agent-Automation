import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Zap, ArrowLeft, Globe, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DemoSitePage({ bots = [], onNavigate }) {
  const queryParams = new URLSearchParams(window.location.search);
  const urlBotId = queryParams.get('botId');
  const urlColor = queryParams.get('color') || queryParams.get('bot_color');
  const selectedBotId = urlBotId || bots[0]?.id || 'bot-apex-agency';

  // Dynamically inject widget.js when mounting
  useEffect(() => {
    // Remove previous widget host if any
    const existingHost = document.getElementById('omnibot-widget-host');
    if (existingHost) existingHost.remove();
    window.__OMNIBOT_INITIALIZED__ = false;

    // Inject widget script
    const script = document.createElement('script');
    script.src = urlColor ? `/widget.js?color=${encodeURIComponent(urlColor)}` : '/widget.js';
    script.setAttribute('data-bot-id', selectedBotId);
    if (urlColor) {
      script.setAttribute('data-color', urlColor);
    }
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const host = document.getElementById('omnibot-widget-host');
      if (host) host.remove();
      window.__OMNIBOT_INITIALIZED__ = false;
      script.remove();
    };
  }, [selectedBotId, urlColor]);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', position: 'relative', overflowX: 'hidden' }}>
      {/* Top Floating Simulation Bar to Return to Platform */}
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
        padding: '7px 18px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
        fontSize: '12.5px',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span>Client Website Simulation (Widget Active)</span>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          style={{
            backgroundColor: '#4f46e5',
            border: 'none',
            color: '#ffffff',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
        >
          <ArrowLeft size={13} />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Demo Site Header / Navbar */}
      <header style={{
        padding: '18px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div 
          onClick={() => onNavigate && onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#ffffff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>Apex Digital Studio</span>
        </div>

        <nav style={{ display: 'flex', gap: '28px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
          <span style={{ color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Services</span>
          <span style={{ cursor: 'pointer' }}>Case Studies</span>
          <span style={{ cursor: 'pointer' }}>Pricing</span>
          <span style={{ cursor: 'pointer' }}>About Us</span>
        </nav>

        <button 
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="btn-primary" 
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '90px 24px 60px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.25)',
          borderRadius: '9999px',
          fontSize: '13px',
          color: '#4f46e5',
          marginBottom: '24px',
          fontWeight: 600
        }}>
          <Star size={14} fill="#4f46e5" />
          <span>Award-Winning Web &amp; AI SaaS Development Agency</span>
        </div>

        <h1 style={{
          fontSize: '50px',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '20px',
          letterSpacing: '-0.03em',
          color: '#0f172a'
        }}>
          We Engineer High-Performance <br />
          <span style={{
            background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Websites, SaaS &amp; AI Automation
          </span>
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#475569',
          maxWidth: '650px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          From custom full-stack web applications to automated WhatsApp chatbots, we deliver turnkey digital solutions that scale your business.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
          <button 
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="btn-primary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <span>Explore Services</span>
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="btn-secondary" 
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            View Pricing
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Custom Web &amp; SaaS Apps</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Tailored React, Next.js, and Node.js solutions built for performance, security, and global scale.
            </p>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5' }}>From ₹25,000</span>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>AI Chatbot &amp; WhatsApp RAG</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Autonomous 24/7 customer support, lead capture, and instant booking trained on your knowledge base.
            </p>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5' }}>From ₹9,999</span>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>High-Converting Funnels</h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Blazing fast landing pages engineered to maximize conversions and generate inbound pipeline.
            </p>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#4f46e5' }}>From ₹12,000</span>
          </div>
        </div>
      </section>
    </div>
  );
}
