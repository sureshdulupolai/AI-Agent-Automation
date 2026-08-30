import React, { useState } from 'react';
import { 
  CloudLightning, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  DollarSign
} from 'lucide-react';

export default function DeploymentGuidePage() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      title: '1. AI Brain — Google Gemini API (100% Free)',
      icon: Cpu,
      cost: '₹0 / $0',
      badge: '1,500 free requests / day',
      desc: 'Create your free Google AI Studio API key for gemini-2.0-flash / gemini-1.5-flash.',
      actionUrl: 'https://aistudio.google.com/',
      code: 'GEMINI_API_KEY=your_gemini_api_key_here'
    },
    {
      title: '2. Database & Auth — Supabase PostgreSQL (100% Free)',
      icon: Database,
      cost: '₹0 / $0',
      badge: '500MB DB + 50k MAU Free',
      desc: 'Create a free project at Supabase and run the SQL schema script provided in backend/config/schema.sql.',
      actionUrl: 'https://supabase.com/',
      code: `SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
    },
    {
      title: '3. Backend Web Service — Render.com / Koyeb (100% Free)',
      icon: Server,
      cost: '₹0 / $0',
      badge: 'Free Web Service',
      desc: 'Deploy the backend/ folder to Render Web Service (Node.js runtime, build: npm install, start: node server.js).',
      actionUrl: 'https://render.com/',
      code: `PORT=5000
NODE_ENV=production
JWT_SECRET=super_secure_production_secret`
    },
    {
      title: '4. Frontend & Widget Global CDN — Vercel / Cloudflare Pages',
      icon: Globe,
      cost: '₹0 / $0',
      badge: 'Unlimited Global CDN',
      desc: 'Deploy frontend/ to Vercel with 1 click. Connect your GitHub repository and set Root Directory to "frontend".',
      actionUrl: 'https://vercel.com/',
      code: 'npm run build'
    }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
          <DollarSign size={14} />
          <span>Verified ₹0 Free Infrastructure Stack</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Zero-Cost Production Deployment Guide
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Follow this 4-step blueprint to take your OmniBot SaaS platform from local development to worldwide deployment at zero cost.
        </p>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</h3>
                    <span className="badge badge-green" style={{ fontSize: '11px', marginTop: '2px' }}>
                      {step.badge}
                    </span>
                  </div>
                </div>

                <a
                  href={step.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                >
                  <span>Open Free Console</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {step.desc}
              </p>

              {step.code && (
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--primary)',
                    overflowX: 'auto',
                    lineHeight: 1.5
                  }}>
                    {step.code}
                  </pre>
                  <button
                    onClick={() => copyText(step.code, `step-${idx}`)}
                    className="btn-secondary"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 10px',
                      fontSize: '11px'
                    }}
                  >
                    {copiedKey === `step-${idx}` ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                    <span>{copiedKey === `step-${idx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
