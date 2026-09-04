import React, { useState, useEffect } from 'react';
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
  DollarSign,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Lock,
  AlertTriangle,
  Flame,
  Layers,
  Activity,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DeploymentGuidePage() {
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'security' | 'deployment'
  const [copiedKey, setCopiedKey] = useState(null);

  // Wallet State
  const [wallet, setWallet] = useState({
    balance: 500.00,
    currency: 'INR',
    cost_per_sms: 0.08,
    cost_per_marketing: 0.11,
    is_unlimited: true,
    total_messages_sent: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Fetch live wallet details
  const fetchWallet = async () => {
    try {
      setLoadingWallet(true);
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        setTransactions(data.recentTransactions || []);
      }
    } catch (err) {
      console.warn('Using local demo wallet state:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopUp = async (amount) => {
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethod: 'free_sandbox_credit' })
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setTransactions(prev => [data.transaction, ...prev]);
        setTopUpSuccess(true);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setTopUpSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Top-up error:', err);
    }
  };

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
      desc: 'Create your free Google AI Studio API key for gemini-2.0-flash / gemini-1.5-flash with zero credit card required.',
      actionUrl: 'https://aistudio.google.com/',
      code: 'GEMINI_API_KEY=your_gemini_api_key_here'
    },
    {
      title: '2. Database & Auth — Local Embedded JSON or Supabase (100% Free)',
      icon: Database,
      cost: '₹0 / $0',
      badge: 'Zero Cloud Setup Needed',
      desc: 'Runs out-of-the-box with local embedded JSON DB, or connect free cloud Supabase PostgreSQL (500MB + 50k MAU free).',
      actionUrl: 'https://supabase.com/',
      code: `USE_SUPABASE=false\n# Optional Cloud Supabase:\nSUPABASE_URL=https://your-project.supabase.co\nSUPABASE_SERVICE_ROLE_KEY=your_key`
    },
    {
      title: '3. Backend Web Service — Render.com / Koyeb (100% Free)',
      icon: Server,
      cost: '₹0 / $0',
      badge: 'Free Web Service',
      desc: 'Deploy backend/ to Render or Koyeb with continuous deployment from your GitHub repo (Node.js runtime, start: node server.js).',
      actionUrl: 'https://render.com/',
      code: `PORT=5000\nNODE_ENV=production\nJWT_SECRET=super_secure_production_secret`
    },
    {
      title: '4. Frontend & Web Widget Global CDN — Vercel / Cloudflare Pages',
      icon: Globe,
      cost: '₹0 / $0',
      badge: 'Unlimited Global CDN',
      desc: 'Deploy frontend/ to Vercel with 1 click. Connect your GitHub repository and set Root Directory to "frontend".',
      actionUrl: 'https://vercel.com/',
      code: 'npm run build'
    }
  ];

  const securityAudits = [
    {
      name: 'Anti-Brute Force Dual Rate Limiter',
      status: 'Active & Enforced',
      desc: '250 req/15min global API cap + 20 attempts/15min strict auth limiter to block automated password cracking.',
      tag: 'Express Rate Limit'
    },
    {
      name: 'Anti-SSRF Private Network Guard',
      status: 'Active & Enforced',
      desc: 'Blocks malicious probes targeting internal loopbacks (127.0.0.1), LANs (10.x, 192.168.x), and cloud metadata (169.254.169.254).',
      tag: 'Network Security'
    },
    {
      name: 'Bcrypt Hash Security & Backdoor Elimination',
      status: 'Active & Enforced',
      desc: 'Strict salted Bcrypt verification (cost factor 10) with all master password shortcuts completely eliminated.',
      tag: 'Authentication'
    },
    {
      name: 'XSS & NoSQL Payload Sanitizer',
      status: 'Active & Enforced',
      desc: 'Recursively neutralizes script injection, dangerous protocol tags (javascript:), and MongoDB/NoSQL query operators ($gt, $ne).',
      tag: 'Input Sanitization'
    },
    {
      name: 'Helmet Security Headers & HPP Guard',
      status: 'Active & Enforced',
      desc: 'Mitigates clickjacking, cross-site script inclusion, MIME sniffing, and HTTP Parameter Pollution attacks.',
      tag: 'HTTP Headers'
    },
    {
      name: 'Multi-Tenant Data Isolation Guard',
      status: 'Active & Enforced',
      desc: 'Verifies JWT tenant claim and scopes all read/write operations to strictly prevent unauthorized cross-tenant data leakage.',
      tag: 'Tenant Isolation'
    },
    {
      name: 'WhatsApp Anti-Ban & Opt-Out Compliance',
      status: 'Active & Enforced',
      desc: 'Humanized typing simulation, random jitter delays, group whitelisting, and automated opt-out ("Reply STOP to opt-out") to prevent WhatsApp bans.',
      tag: 'Meta Compliance'
    }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
          <Zap size={14} />
          <span>100% Free &amp; Unlimited Architecture • Bulletproof Security</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Control Center: Billing, Security &amp; Deployment
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Manage your free self-hosted messaging wallet, inspect automated cyber defenses against hackers, and access zero-cost cloud deployment guides.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px'
      }}>
        <button
          onClick={() => setActiveTab('wallet')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'wallet' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'wallet' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'wallet' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer'
          }}
        >
          <Wallet size={16} />
          <span>Free &amp; Unlimited Wallet Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'security' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={16} />
          <span>Cyber Defense &amp; Anti-Hacker Guard</span>
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'deployment' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'deployment' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'deployment' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer'
          }}
        >
          <CloudLightning size={16} />
          <span>Zero-Cost Cloud Deployment</span>
        </button>
      </div>

      {/* TAB 1: WALLET & BILLING */}
      {activeTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Balance Banner */}
          <div className="glass-panel" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04), rgba(8, 145, 178, 0.08))',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Available Message Credits</span>
                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                  {wallet.is_unlimited ? '100% Free & Unlimited Mode' : 'Metered Mode'}
                </span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                ₹{Number(wallet.balance).toFixed(2)}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {wallet.is_unlimited 
                  ? '⚡ Self-hosted Baileys QR Engine active: Unlimited messages sent with ₹0 per-message Meta fees.'
                  : 'Agency Client Reselling Active: Messages deducted from tenant balance.'}
              </p>
            </div>

            {/* Quick Top-Up Sandbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handleTopUp(100)}
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
              >
                +₹100
              </button>
              <button
                onClick={() => handleTopUp(500)}
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '8px 14px' }}
              >
                +₹500
              </button>
              <button
                onClick={() => handleTopUp(1000)}
                className="btn-primary"
                style={{ fontSize: '12.5px', padding: '8px 16px' }}
              >
                <Plus size={14} />
                <span>+₹1,000 Sandbox Credit</span>
              </button>
            </div>
          </div>

          {topUpSuccess && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#059669',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>Wallet topped up successfully! Balance updated.</span>
            </div>
          )}

          {/* Pricing Rate Cards from 15 Images */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Standard Bulk SMS Rate</h3>
                <span className="badge badge-blue">Shree Deep Tier</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
                8 Paisa <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ msg (₹0.08)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                High-volume transactional notification tier. Supports PDFs, Images with DP, and Quick Buttons.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Marketing Campaign Rate</h3>
                <span className="badge badge-purple">KKHS Media Tier</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#9333ea', marginBottom: '6px' }}>
                0.11 Paisa <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ msg (₹0.11)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Targeted marketing broadcast tier with automated opt-out detection ("Reply STOP to opt-out").
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Self-Hosted Baileys QR</h3>
                <span className="badge badge-green">100% Free Forever</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                ₹0.00 <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ unlimited msgs</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pair any WhatsApp number via QR code or 8-digit pairing code. Zero API cost, unlimited outreach.
              </p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Transaction Activity</h3>
              <button onClick={fetchWallet} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                <RefreshCw size={12} className={loadingWallet ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {transactions.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                No transaction records yet. Top up credits above to test the ledger!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Transaction ID</th>
                      <th style={{ padding: '8px 12px' }}>Type</th>
                      <th style={{ padding: '8px 12px' }}>Description</th>
                      <th style={{ padding: '8px 12px' }}>Amount</th>
                      <th style={{ padding: '8px 12px' }}>Balance After</th>
                      <th style={{ padding: '8px 12px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={tx.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{tx.id}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${tx.type === 'credit' ? 'badge-green' : 'badge-amber'}`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{tx.description}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: tx.type === 'credit' ? '#059669' : '#dc2626' }}>
                          {tx.type === 'credit' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>₹{Number(tx.balance_after).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CYBER DEFENSE & ANTI-HACKER AUDIT */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <ShieldCheck size={20} color="#059669" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                System Cyber Posture: 100% Hardened &amp; Hacker-Proof
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              All 7 core cybersecurity standards are actively enforced on the backend. Attack surfaces including SSRF, NoSQL injection, XSS, token forgery, and brute-force cracking are blocked at the middleware gateway.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {securityAudits.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h4>
                  <span className="badge badge-green" style={{ fontSize: '10.5px' }}>{item.status}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={12} color="var(--primary)" />
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{item.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOYMENT GUIDE */}
      {activeTab === 'deployment' && (
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
      )}
    </div>
  );
}
