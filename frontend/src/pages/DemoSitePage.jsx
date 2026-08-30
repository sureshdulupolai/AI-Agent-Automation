import React, { useEffect, useState } from 'react';
import { Bot, ArrowRight, Check, Star, ShieldCheck, Zap, Sparkles, MessageSquare } from 'lucide-react';

export default function DemoSitePage({ bots = [] }) {
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id || 'bot-apex-agency');
  const activeBot = bots.find(b => b.id === selectedBotId) || bots[0];

  // Dynamically inject widget.js when mounting or changing bot
  useEffect(() => {
    // Remove previous widget host if any
    const existingHost = document.getElementById('omnibot-widget-host');
    if (existingHost) existingHost.remove();
    window.__OMNIBOT_INITIALIZED__ = false;

    // Inject widget script
    const script = document.createElement('script');
    script.src = '/widget.js';
    script.setAttribute('data-bot-id', selectedBotId);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const host = document.getElementById('omnibot-widget-host');
      if (host) host.remove();
      window.__OMNIBOT_INITIALIZED__ = false;
      script.remove();
    };
  }, [selectedBotId]);

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', position: 'relative' }}>
      {/* SaaS Simulation Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #4f46e5, #0891b2)',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          <span>Live Client Website Simulation: Testing <strong>{activeBot?.bot_name}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>Switch Active Demo Bot:</span>
          <select
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{
              background: '#090d16',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            {bots.map(b => (
              <option key={b.id} value={b.id}>{b.bot_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Demo Site Navbar */}
      <header style={{
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#020617" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Apex Digital Studio</span>
        </div>

        <nav style={{ display: 'flex', gap: '28px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
          <span style={{ color: '#ffffff', cursor: 'pointer' }}>Services</span>
          <span style={{ cursor: 'pointer' }}>Case Studies</span>
          <span style={{ cursor: 'pointer' }}>Pricing</span>
          <span style={{ cursor: 'pointer' }}>About Us</span>
        </nav>

        <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '80px 24px 60px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '9999px',
          fontSize: '13px',
          color: '#38bdf8',
          marginBottom: '24px'
        }}>
          <Star size={14} fill="#38bdf8" />
          <span>Award-Winning Web & AI SaaS Development Agency</span>
        </div>

        <h1 style={{
          fontSize: '52px',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '20px',
          letterSpacing: '-0.03em'
        }}>
          We Engineer High-Performance <br />
          <span style={{
            background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Websites, SaaS & AI Automation
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          maxWidth: '680px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          From custom full-stack web applications to automated WhatsApp chatbots, we deliver turnkey digital solutions that scale your business.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            <span>Explore Services</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
            <span>View Pricing</span>
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 100px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '32px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#ffffff' }}>Custom Web & SaaS Apps</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Tailored React, Next.js, and Node.js solutions built for performance, security, and global scale.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>From $2,500</span>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '32px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#ffffff' }}>AI Chatbot & WhatsApp RAG</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Autonomous 24/7 customer support, lead capture, and instant booking trained on your knowledge base.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>From $999</span>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '32px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#ffffff' }}>High-Converting Funnels</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Blazing fast landing pages engineered to maximize conversions and generate inbound pipeline.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>From $1,200</span>
          </div>
        </div>
      </section>

      {/* Floating Prompt Box pointing to Widget */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        maxWidth: '300px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #6366f1',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            Embedded Widget Active
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
          Look below! The floating chat bubble is the live OmniBot widget embedded via 1 line of code. Click to test!
        </p>
      </div>
    </div>
  );
}
