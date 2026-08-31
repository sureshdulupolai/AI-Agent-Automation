import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  GitBranch, 
  Clock, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Settings, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  AlertCircle,
  Play,
  ArrowRight
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none">
    <circle cx="512" cy="512" r="512" fill="#25D366" />
    <path fill="#ffffff" d="M783.3 243.2C714 173.8 621.8 135.6 523.6 135.6c-202.4 0-367.1 164.7-367.2 367.1-.03 64.7 16.9 127.9 49 183.5L153.3 876.4l194.7-51c53.6 29.2 114 44.7 175.5 44.7h.1c202.4 0 367.1-164.7 367.2-367.1.04-98.1-38.1-190.3-107.5-259.8zM523.5 808h-.1c-54.8-.02-108.5-14.7-155.3-42.5l-11.1-6.6-115.5 30.3 30.8-112.6-7.3-11.5C234.6 616.5 218.4 560.4 218.5 502.7c.07-168.2 137-305.1 305.3-305.1 81.5.03 158.2 31.8 215.8 89.5s89.3 134.3 89.3 215.9c-.07 168.2-137 305.1-305.4 305.1zm167.4-228.5c-9.2-4.6-54.3-26.8-62.7-29.8-8.4-3.1-14.5-4.6-20.6 4.6-6.1 9.2-23.7 29.8-29.1 36-5.4 6.1-10.7 6.9-19.9 2.3-9.2-4.6-38.7-14.3-73.8-45.5-27.3-24.3-45.7-54.4-51-63.5-5.4-9.2-.6-14.1 4-18.7 4.1-4.1 9.2-10.7 13.8-16.1 4.6-5.4 6.1-9.2 9.2-15.3 3.1-6.1 1.5-11.5-.8-16.1-2.3-4.6-20.6-49.7-28.3-68.1-7.4-17.9-15-15.5-20.6-15.7-5.3-.3-11.5-.3-17.6-.3s-16.1 2.3-24.5 11.5-32.1 31.4-32.1 76.5c0 45.1 32.9 88.8 37.5 94.9 4.6 6.1 64.7 98.8 156.7 138.5 21.9 9.5 39 15.1 52.3 19.3 22 7 42 6 57.8 3.6 17.6-2.6 54.3-22.2 61.9-43.6 7.6-21.4 7.6-39.8 5.4-43.6-2.3-3.8-8.4-6.1-17.6-10.7z" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
  </svg>
);

export default function AutomationsPage() {
  const [activeSection, setActiveSection] = useState('email'); // 'email', 'whatsapp', 'logs'
  const [emailSettings, setEmailSettings] = useState(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp Follow-up state
  const [waAutoFollowUp, setWaAutoFollowUp] = useState(true);
  const [waDelayMinutes, setWaDelayMinutes] = useState(120);

  const fetchEmailAutomationSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/email-automations/settings');
      const data = await res.json();
      if (data.settings) {
        setEmailSettings(data.settings);
      }
      const logsRes = await fetch('/api/email-automations/logs');
      const logsData = await logsRes.json();
      if (logsData.logs) {
        setEmailLogs(logsData.logs);
      }
    } catch (e) {
      console.error('Error loading email automations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailAutomationSettings();
  }, []);

  const handleSaveEmailSettings = async () => {
    if (!emailSettings) return;
    try {
      setSavingEmail(true);
      const res = await fetch('/api/email-automations/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        alert('✓ Email Automation sequence successfully saved!');
      }
    } catch (e) {
      alert('Error saving settings: ' + e.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdateStep = (stepIndex, field, value) => {
    if (!emailSettings) return;
    const updated = { ...emailSettings };
    updated.nurture_sequence[stepIndex][field] = value;
    setEmailSettings(updated);
  };

  return (
    <div style={{ padding: '24px 32px', width: '100%', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Automations &amp; AI Drip Sequences
            </h1>
            <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800 }}>
              24/7 AI Engine
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            Configure autonomous WhatsApp follow-up timers and multi-step automated email nurture sequences.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          backgroundColor: '#e2e8f0', 
          padding: '4px', 
          borderRadius: '12px', 
          gap: '4px',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveSection('email')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeSection === 'email' ? '#ffffff' : 'transparent',
              color: activeSection === 'email' ? '#4338ca' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeSection === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <GoogleLogo />
            <span>Email Drip Sequences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('whatsapp')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeSection === 'whatsapp' ? '#ffffff' : 'transparent',
              color: activeSection === 'whatsapp' ? '#15803d' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeSection === 'whatsapp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <WhatsAppIcon />
            <span>WhatsApp Follow-ups</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('logs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeSection === 'logs' ? '#ffffff' : 'transparent',
              color: activeSection === 'logs' ? '#0f172a' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeSection === 'logs' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={15} />
            <span>Activity Logs ({emailLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EMAIL DRIP SEQUENCES                                          */}
      {/* ========================================================================= */}
      {activeSection === 'email' && emailSettings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Master Control Bar */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GoogleLogo />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Automated Lead Email Nurture
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Connected Gmail Sender: <strong>{emailSettings.sender_account}</strong>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                <input
                  type="checkbox"
                  checked={emailSettings.enabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <span>Automation Active</span>
              </label>

              <button
                type="button"
                onClick={handleSaveEmailSettings}
                disabled={savingEmail}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
              >
                {savingEmail ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Sequence</span>
              </button>
            </div>
          </div>

          {/* Drip Steps Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {emailSettings.nurture_sequence.map((step, idx) => (
              <div
                key={step.step}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                      {step.step}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {step.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        Trigger delay: {step.delay_minutes === 0 ? 'Immediately upon lead capture' : `${step.delay_minutes / 60} hours after lead capture`}
                      </span>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={(e) => handleUpdateStep(idx, 'enabled', e.target.checked)}
                      style={{ accentColor: '#4f46e5' }}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => handleUpdateStep(idx, 'subject', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Email Content
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Available tags: <code style={{ color: '#4f46e5', fontWeight: 700 }}>{'{{name}}'}</code>, <code style={{ color: '#4f46e5', fontWeight: 700 }}>{'{{requirement}}'}</code>
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={step.body}
                      onChange={(e) => handleUpdateStep(idx, 'body', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: WHATSAPP 2-HOUR AUTONOMOUS FOLLOW-UP                          */}
      {/* ========================================================================= */}
      {activeSection === 'whatsapp' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <WhatsAppIcon />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                WhatsApp 2-Hour Autonomous AI Follow-Up Engine
              </h3>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                Automatically engages clients who opened chat but paused or went idle.
              </span>
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              <CheckCircle2 size={16} />
              <span>Smart Follow-up Intelligence Active</span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#15803d', margin: 0 }}>
              The engine automatically skips follow-ups if the client explicitly says 'bye', 'not interested', or books an appointment. Follow-ups survive server restarts via disk persistence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Follow-Up Delay (Minutes)
              </label>
              <input
                type="number"
                value={waDelayMinutes}
                onChange={(e) => setWaDelayMinutes(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                Default is 120 minutes (2 hours).
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                AI Personality Preset
              </label>
              <select style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="consultative">Consultative &amp; Helpful (Recommended)</option>
                <option value="closer">High-Energy Sales Closer</option>
                <option value="support">Support Concierge</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: AUTOMATION ACTIVITY LOGS                                      */}
      {/* ========================================================================= */}
      {activeSection === 'logs' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Automated Drip Execution History
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Real-time log of automated sequence steps sent to captured leads.
              </span>
            </div>
            <button
              onClick={fetchEmailAutomationSettings}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', cursor: 'pointer' }}
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {emailLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Clock size={32} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>No automated triggers logged yet</div>
              <p style={{ fontSize: '12.5px', margin: '4px 0 0 0' }}>
                When leads with email addresses enter via WhatsApp or Website Chat, nurture sequences will execute automatically.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>Lead Name</th>
                    <th style={{ padding: '10px 12px' }}>Recipient Email</th>
                    <th style={{ padding: '10px 12px' }}>Sequence Step</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{log.lead_name || 'Client'}</td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{log.lead_email}</td>
                      <td style={{ padding: '10px 12px', color: '#4338ca', fontWeight: 600 }}>{log.step_name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Delivered</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
