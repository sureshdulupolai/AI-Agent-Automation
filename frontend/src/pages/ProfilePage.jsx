import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  ShieldCheck,
  Check,
  Zap,
  AlertCircle,
  Sparkles,
  Wand2,
  Bot,
  Cpu,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  Key,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function ProfilePage({ bots = [] }) {
  const navigate = useNavigate();

  // Billing & Service Controls State
  const [billingData, setBillingData] = useState({
    client_profile: {
      name: 'Suresh Polai',
      email: 'suresh.polai@novabyte.ai',
      mobile: '+91 98765 43210',
      organization: 'NovaByte Solutions Lead AI',
      plan: 'Enterprise Autonomous AI',
      billing_cycle: 'Monthly',
      currency: 'INR',
      currency_symbol: '₹',
      wallet_balance: 2500.00
    },
    services: {
      prompt_architect: {
        id: 'prompt_architect',
        name: 'AI Business & Automation Prompt Architect',
        page_location: 'http://localhost:3000/universal-studio (Step 0)',
        free_limit: 3,
        used_count: 0,
        rate_per_action: 5.00,
        auto_metered_enabled: true,
        currency: 'INR',
        currency_symbol: '₹',
        accrued_cost: 0.00
      },
      chatbot_simulator: {
        id: 'chatbot_simulator',
        name: 'OmniBot Neural Simulator & In-House Testing',
        page_location: 'http://localhost:3000/universal-studio (Right Panel)',
        free_limit: 10,
        rate_per_query: 3.00,
        auto_metered_enabled: true,
        currency: 'INR',
        currency_symbol: '₹'
      },
      live_integrations: {
        id: 'live_integrations',
        name: 'Production Channel Routing (WhatsApp & Web Embed Traffic)',
        page_location: 'Public Web Widget & Baileys Local WhatsApp Engine',
        rate_per_request: 0.60,
        currency: 'INR',
        currency_symbol: '₹',
        auto_metered_enabled: true
      },
      chatbot_deployments: {
        id: 'chatbot_deployments',
        name: 'Autonomous Chatbot Deployment Slots',
        max_limit: 3,
        current_count: bots.length || 2,
        slots_remaining: Math.max(0, 3 - (bots.length || 2)),
        is_limit_reached: (bots.length || 2) >= 3
      }
    }
  });

  const [loading, setLoading] = useState(true);
  const [togglingService, setTogglingService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // 10-Key Rotation Health State
  const [keysHealth, setKeysHealth] = useState({
    total_slots: 10,
    active_count: 1,
    over_quota_count: 0,
    standby_count: 9,
    slots: []
  });
  const [testingSlot, setTestingSlot] = useState(null);
  const [editSlotModal, setEditSlotModal] = useState(null); // { slot_number, label, key }
  const [savingKey, setSavingKey] = useState(false);

  // Fetch Billing Controls
  const fetchBillingControls = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/controls');
      const data = await res.json();
      if (data.success) {
        setBillingData(prev => ({
          ...prev,
          ...data,
          services: {
            ...prev.services,
            ...(data.services || {})
          }
        }));
      }
    } catch (err) {
      console.warn('Failed to load billing controls:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Keys Health
  const fetchKeysHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/keys-health');
      const data = await res.json();
      if (data.success) {
        setKeysHealth(data);
      }
    } catch (err) {
      console.warn('Failed to load keys health:', err);
    }
  }, []);

  useEffect(() => {
    fetchBillingControls();
    fetchKeysHealth();
  }, [fetchBillingControls, fetchKeysHealth]);

  const showNotification = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Auto-Metered Billing for a service
  const handleToggleService = async (serviceId, currentVal) => {
    const newVal = !currentVal;
    setTogglingService(serviceId);
    try {
      const res = await fetch('/api/billing/controls/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, auto_metered_enabled: newVal })
      });
      const data = await res.json();
      if (data.success) {
        setBillingData(prev => ({
          ...prev,
          services: {
            ...prev.services,
            [serviceId]: {
              ...prev.services[serviceId],
              auto_metered_enabled: newVal
            }
          }
        }));
        showNotification(
          `Auto-metered billing for ${billingData.services[serviceId]?.name || 'Service'} set to ${newVal ? 'ENABLED' : 'DISABLED'}.`
        );
      }
    } catch (err) {
      showNotification('Failed to update service toggle', 'error');
    } finally {
      setTogglingService(null);
    }
  };

  // Test API Key Ping
  const handleTestKeySlot = async (slotNumber) => {
    setTestingSlot(slotNumber);
    try {
      const res = await fetch('/api/billing/keys-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber })
      });
      const data = await res.json();
      showNotification(data.message, data.success ? 'success' : 'error');
      fetchKeysHealth();
    } catch (err) {
      showNotification('Key test ping failed', 'error');
    } finally {
      setTestingSlot(null);
    }
  };

  // Save/Update Key Slot
  const handleSaveKeySlot = async (e) => {
    e.preventDefault();
    if (!editSlotModal || !editSlotModal.key?.trim()) return;

    setSavingKey(true);
    try {
      const res = await fetch('/api/billing/keys-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotNumber: editSlotModal.slot_number,
          label: editSlotModal.label,
          key: editSlotModal.key
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setEditSlotModal(null);
        fetchKeysHealth();
      } else {
        showNotification(data.error || 'Failed to save key', 'error');
      }
    } catch (err) {
      showNotification('Error saving key slot', 'error');
    } finally {
      setSavingKey(false);
    }
  };

  const pArchitect = billingData.services?.prompt_architect || {};
  const cSimulator = billingData.services?.chatbot_simulator || {};
  const lIntegrations = billingData.services?.live_integrations || {};
  const cDeployments = billingData.services?.chatbot_deployments || {};

  const architectUsed = Number(pArchitect.used_count) || 0;
  const architectFreeRemaining = Math.max(0, (pArchitect.free_limit || 3) - architectUsed);
  const architectIsLocked = architectUsed >= (pArchitect.free_limit || 3) && !pArchitect.auto_metered_enabled;

  const currentBotsCount = bots.length || cDeployments.current_count || 2;
  const isMaxBotsReached = currentBotsCount >= 3;

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '28px',
          zIndex: 9999,
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: toastMessage.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '13px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.25s ease'
        }}>
          {toastMessage.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '26px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Client Profile &amp; Service Governance
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '999px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              Enterprise Tier
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Unified client credentials, auto-metered consumption policies, service lock guards, and 10-key rotating Gemini API pools.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              fetchBillingControls();
              fetchKeysHealth();
              showNotification('Refreshed live account telemetry.');
            }}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 14px' }}
          >
            <RefreshCw size={13} />
            <span>Sync Telemetry</span>
          </button>

          <button
            onClick={() => navigate('/universal-studio')}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '8px 16px' }}
          >
            <Wand2 size={14} />
            <span>Open Universal Studio</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Client Profile Header Card */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '26px',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(79, 70, 229, 0.03) 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 900,
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)',
              position: 'relative'
            }}>
              SP
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '3px solid var(--bg-surface)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {billingData.client_profile?.name || 'Suresh Polai'}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669'
                }}>
                  Verified Client
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                {billingData.client_profile?.organization || 'NovaByte Solutions Lead AI'} &bull; {billingData.client_profile?.plan || 'Enterprise Autonomous AI'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <Mail size={13} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>{billingData.client_profile?.email || 'suresh.polai@novabyte.ai'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <Phone size={13} color="#0891b2" />
                  <span style={{ fontWeight: 600 }}>{billingData.client_profile?.mobile || '+91 98765 43210'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)' }}>
                  <Building size={13} color="#6366f1" />
                  <span>HQ: Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              minWidth: '140px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                Wallet Balance
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
                ₹{Number(billingData.client_profile?.wallet_balance || 2500).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Auto-Refill Active
              </div>
            </div>

            <div style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              minWidth: '140px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                Chatbot Slots
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: isMaxBotsReached ? '#dc2626' : 'var(--primary)' }}>
                {currentBotsCount} / 3 Slots
              </div>
              <div style={{ fontSize: '10.5px', color: isMaxBotsReached ? '#dc2626' : '#059669', fontWeight: 600, marginTop: '2px' }}>
                {isMaxBotsReached ? 'Capacity Reached' : `${3 - currentBotsCount} Slot Available`}
              </div>
            </div>

            <div style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              minWidth: '140px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                API Rotation Pool
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0891b2' }}>
                10 Keys Active
              </div>
              <div style={{ fontSize: '10.5px', color: '#0891b2', fontWeight: 600, marginTop: '2px' }}>
                100% Uptime Engine
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status Footer Note */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px dashed var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: 'var(--text-muted)'
        }}>
          <Info size={13} color="var(--primary)" />
          <span>
            Client credentials are saved for administrative governance and will automatically synchronize with the dedicated Single Sign-On auto client portal once connected.
          </span>
        </div>
      </div>

      {/* SECTION 2: Service Governance & Auto-Metered Controls (Line-by-Line with Toggles) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Service Policies &amp; Metered Billing Controls
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Control automated quota limits, per-action consumption charges, and strict execution lock flags.
            </p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Instant Cloud Synchronization
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* SERVICE 1: AI Prompt Architect */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: '12px',
            border: architectIsLocked ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
            backgroundColor: architectIsLocked ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: architectIsLocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  color: architectIsLocked ? '#dc2626' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {architectIsLocked ? <Lock size={20} /> : <Wand2 size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      AI Business &amp; Automation Prompt Architect
                    </span>
                    {architectIsLocked ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Lock size={11} /> Button Locked in Studio
                      </span>
                    ) : architectUsed < 3 ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669'
                      }}>
                        {architectFreeRemaining} / 3 Free Runs Left
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        color: 'var(--primary)'
                      }}>
                        Metered: ₹5.00 / action
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Synthesizes complete enterprise master prompts from business descriptions on <code>/universal-studio</code>.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Rate: <strong>₹5.00 per action</strong> beyond 3 free</span>
                    <span>&bull;</span>
                    <span>Total Runs: <strong>{architectUsed}</strong></span>
                    <span>&bull;</span>
                    <span>Accrued Cost: <strong>₹{Number(pArchitect.accrued_cost || 0).toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: pArchitect.auto_metered_enabled ? '#16a34a' : 'var(--text-muted)' }}>
                    {pArchitect.auto_metered_enabled ? 'Auto-Metered ON (₹5/run)' : 'Auto-Metered OFF'}
                  </span>

                  <button
                    type="button"
                    disabled={togglingService === 'prompt_architect'}
                    onClick={() => handleToggleService('prompt_architect', pArchitect.auto_metered_enabled)}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '999px',
                      backgroundColor: pArchitect.auto_metered_enabled ? '#10b981' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                      outline: 'none',
                      padding: 0
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: pArchitect.auto_metered_enabled ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>

                <span style={{ fontSize: '10.5px', color: architectIsLocked ? '#dc2626' : 'var(--text-muted)', maxWidth: '240px', textAlign: 'right' }}>
                  {architectIsLocked
                    ? 'Quota exhausted & auto-pay is OFF. Universal Studio button is completely locked.'
                    : pArchitect.auto_metered_enabled
                      ? 'AI will seamlessly charge ₹5/run after 3 free runs.'
                      : 'AI will stop and lock button once 3 free runs are consumed.'}
                </span>
              </div>
            </div>
          </div>

          {/* SERVICE 2: Chatbot Simulator */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(8, 145, 178, 0.1)',
                  color: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      OmniBot Neural Simulator &amp; In-House Testing
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(8, 145, 178, 0.1)',
                      color: '#0891b2'
                    }}>
                      10 Free Inquiries / Bot Model
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Live interactive sandbox testing right panel on <code>/universal-studio</code>. Evaluates lead scoring and persona directives.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Rate: <strong>₹3.00 per inquiry</strong> beyond 10 complimentary</span>
                    <span>&bull;</span>
                    <span>Independent 10 Free Tier Per Model</span>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: cSimulator.auto_metered_enabled ? '#16a34a' : 'var(--text-muted)' }}>
                    {cSimulator.auto_metered_enabled ? 'Auto-Metered ON (₹3/query)' : 'Auto-Metered OFF'}
                  </span>

                  <button
                    type="button"
                    disabled={togglingService === 'chatbot_simulator'}
                    onClick={() => handleToggleService('chatbot_simulator', cSimulator.auto_metered_enabled)}
                    style={{
                      width: '46px',
                      height: '24px',
                      borderRadius: '999px',
                      backgroundColor: cSimulator.auto_metered_enabled ? '#10b981' : '#cbd5e1',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                      outline: 'none',
                      padding: 0
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: cSimulator.auto_metered_enabled ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '240px', textAlign: 'right' }}>
                  Allows testing beyond 10 free queries at ₹3.00/query.
                </span>
              </div>
            </div>
          </div>

          {/* SERVICE 3: Live Channels & Integrations */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Activity size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Production Realtime Channels (WhatsApp &amp; Web Embed)
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669'
                    }}>
                      Live Production Active
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Incoming visitor traffic from deployed website embeds and connected Baileys WhatsApp sessions.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Rate: <strong>₹0.60 per request</strong> (60 paise / req)</span>
                    <span>&bull;</span>
                    <span>Multi-tenant secure encryption active</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Routing Enabled (₹0.60/req)
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '240px', textAlign: 'right' }}>
                  Metered directly upon genuine inbound customer messages.
                </span>
              </div>
            </div>
          </div>

          {/* SERVICE 4: Chatbot Slots & Cap Guard */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: '12px',
            border: isMaxBotsReached ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: isMaxBotsReached ? 'rgba(245, 158, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  color: isMaxBotsReached ? '#d97706' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Autonomous Chatbot Deployment Slots
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: isMaxBotsReached ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: isMaxBotsReached ? '#dc2626' : '#059669'
                    }}>
                      {currentBotsCount} / 3 Maximum Cap
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                    Client accounts are capped at a maximum of 3 active AI bots. Further bot creation is restricted.
                  </p>

                  {/* Active Bots Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {bots.map((b, idx) => (
                      <span
                        key={b.id || idx}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Bot size={12} color="var(--primary)" />
                        {b.bot_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <span>Manage Chatbots</span>
                  <ArrowUpRight size={13} />
                </button>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  {isMaxBotsReached ? 'Delete a bot to free up a slot' : 'Slots available for new bots'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Daily Multi-API Key Health & Rotation Monitor (10 Rotating Keys) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Daily Multi-API Key Health &amp; Rotation Pool (10 Keys Engine)
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              System rotates through 10 API keys. When a key hits its daily limit or rate-limit, the gateway instantly auto-routes to the next healthy slot.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669'
            }}>
              Active: {keysHealth.active_count}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: keysHealth.over_quota_count > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-page)',
              color: keysHealth.over_quota_count > 0 ? '#dc2626' : 'var(--text-muted)'
            }}>
              Over Quota: {keysHealth.over_quota_count}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(8, 145, 178, 0.1)',
              color: '#0891b2'
            }}>
              Standby: {keysHealth.standby_count}
            </span>
          </div>
        </div>

        {/* 10-Slot Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '14px'
        }}>
          {(keysHealth.slots || []).map((slot) => {
            const isActive = slot.status === 'active';
            const isOverQuota = slot.status === 'over_quota';
            const isRateLimited = slot.status === 'rate_limited';
            const isStandby = slot.status === 'standby';

            return (
              <div
                key={slot.slot_number}
                className="glass-panel"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: slot.is_current_active
                    ? '2px solid var(--primary)'
                    : isOverQuota
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-subtle)',
                  backgroundColor: slot.is_current_active
                    ? 'rgba(79, 70, 229, 0.02)'
                    : isOverQuota
                      ? 'rgba(239, 68, 68, 0.02)'
                      : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Row: Slot # & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: slot.is_current_active ? 'var(--primary)' : 'var(--bg-page)',
                        color: slot.is_current_active ? '#ffffff' : 'var(--text-secondary)'
                      }}>
                        Slot #{slot.slot_number.toString().padStart(2, '0')}
                      </span>
                      {slot.is_current_active && (
                        <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800 }}>
                          Primary
                        </span>
                      )}
                    </div>

                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: isActive
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isOverQuota
                          ? 'rgba(239, 68, 68, 0.15)'
                          : isRateLimited
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(100, 116, 139, 0.15)',
                      color: isActive
                        ? '#059669'
                        : isOverQuota
                          ? '#dc2626'
                          : isRateLimited
                            ? '#d97706'
                            : '#64748b'
                    }}>
                      {isActive
                        ? 'Active & Ready'
                        : isOverQuota
                          ? 'Daily Limit Over'
                          : isRateLimited
                            ? 'Cooling Down'
                            : 'Standby'}
                    </span>
                  </div>

                  {/* Slot Label & Masked Key */}
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {slot.label}
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-page)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {slot.masked_key}
                  </div>

                  {/* Daily Quota Progress */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span>Daily Requests</span>
                      <span>{slot.daily_requests_used} / {slot.daily_requests_limit}</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-page)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, ((slot.daily_requests_used || 0) / (slot.daily_requests_limit || 1500)) * 100)}%`,
                        height: '100%',
                        backgroundColor: isOverQuota ? '#ef4444' : isActive ? '#10b981' : '#0891b2',
                        borderRadius: '999px'
                      }} />
                    </div>
                  </div>

                  {/* Latency & Last Checked */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    <span>Latency: <strong>{slot.latency_ms > 0 ? `${slot.latency_ms}ms` : '--'}</strong></span>
                    <span>Last: <strong>{slot.last_tested}</strong></span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <button
                    type="button"
                    disabled={testingSlot === slot.slot_number || !slot.raw_key_available}
                    onClick={() => handleTestKeySlot(slot.slot_number)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'transparent',
                      color: slot.raw_key_available ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: (testingSlot === slot.slot_number || !slot.raw_key_available) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {testingSlot === slot.slot_number ? 'Testing...' : 'Ping Test'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditSlotModal({ slot_number: slot.slot_number, label: slot.label, key: '' })}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(79, 70, 229, 0.3)',
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      color: 'var(--primary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Configure / Change Key Slot */}
      {editSlotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Configure Gemini Slot #{editSlotModal.slot_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditSlotModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveKeySlot}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Slot Identifier / Label
                </label>
                <input
                  type="text"
                  value={editSlotModal.label || ''}
                  onChange={(e) => setEditSlotModal({ ...editSlotModal, label: e.target.value })}
                  placeholder={`Gemini Multi-Key Slot #${editSlotModal.slot_number}`}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Google Gemini API Key *
                </label>
                <input
                  type="password"
                  value={editSlotModal.key || ''}
                  onChange={(e) => setEditSlotModal({ ...editSlotModal, key: e.target.value })}
                  placeholder="Enter Gemini API key (AIzaSy...)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Key will be added to the rotating pool and verified with a health ping.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditSlotModal(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingKey || !editSlotModal.key?.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '12.5px' }}
                >
                  {savingKey ? 'Activating Key...' : 'Save & Activate Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
