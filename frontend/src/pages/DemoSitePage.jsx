import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Zap } from 'lucide-react';

export default function DemoSitePage({ bots = [] }) {
  const selectedBotId = bots[0]?.id || 'bot-apex-agency';

  // Dynamically inject widget.js when mounting
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
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', position: 'relative' }}>
      {/* Demo Site Navbar */}
      <header style={{
        padding: '18px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.25)',
          borderRadius: '9999px',
          fontSize: '13px',
          color: '#4f46e5',
          marginBottom: '24px',
          fontWeight: 600
        }}>
          <Star size={14} fill="#4f46e5" />
          <span>Award-Winning Web & AI SaaS Development Agency</span>
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
            Websites, SaaS & AI Automation
          </span>
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#475569',
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
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Custom Web & SaaS Apps</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Tailored React, Next.js, and Node.js solutions built for performance, security, and global scale.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#4f46e5' }}>From ₹25,000</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>AI Chatbot & WhatsApp RAG</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Autonomous 24/7 customer support, lead capture, and instant booking trained on your knowledge base.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#4f46e5' }}>From ₹9,999</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>High-Converting Funnels</h3>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Blazing fast landing pages engineered to maximize conversions and generate inbound pipeline.
            </p>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#4f46e5' }}>From ₹12,000</span>
          </div>
        </div>
      </section>
    </div>
  );
}
