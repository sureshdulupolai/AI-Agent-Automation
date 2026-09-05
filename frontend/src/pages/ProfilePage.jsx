import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ArrowUpRight,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Play,
  Pause,
  Loader2
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
        rate_per_action_managed: 5.00,
        rate_per_action_byok: 1.00,
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
        rate_per_query_managed: 3.00,
        rate_per_query_byok: 1.00,
        rate_per_query: 3.00,
        auto_metered_enabled: true,
        currency: 'INR',
        currency_symbol: '₹'
      },
      live_integrations: {
        id: 'live_integrations',
        name: 'Production Channel Routing (WhatsApp & Web Embed Traffic)',
        page_location: 'Public Web Widget & Baileys Local WhatsApp Engine',
        rate_per_request_managed: 1.00,
        rate_per_request_byok: 0.50,
        rate_per_request: 1.00,
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
  const toastTimeoutRef = useRef(null);

  // Dynamic Gemini API Keys & Priority BYOK Routing State
  const [keysHealth, setKeysHealth] = useState({
    routing_policy: {
      use_custom_keys: false,
      fallback_to_managed: true,
      managed_rate_per_request: 1.00,
      byok_rate_per_request: 0.50
    },
    total_keys: 1,
    active_count: 1,
    over_quota_count: 0,
    standby_count: 0,
    keys: []
  });

  const [testingKeyId, setTestingKeyId] = useState(null);
  const [togglingKeyId, setTogglingKeyId] = useState(null);
  const [deletingKeyId, setDeletingKeyId] = useState(null);
  const [syncingTelemetry, setSyncingTelemetry] = useState(false);
  const [togglingPolicy, setTogglingPolicy] = useState(false);
  const [addKeyModalOpen, setAddKeyModalOpen] = useState(false);
  const [addKeyForm, setAddKeyForm] = useState({ label: '', key: '' });
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [addingKey, setAddingKey] = useState(false);
  const [editKeyModal, setEditKeyModal] = useState(null); // { id, label, key: '' }
  const [editingKey, setEditingKey] = useState(false);
  const [showEditKeySecret, setShowEditKeySecret] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

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

  const showNotification = useCallback((msg, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ msg, type, visible: true });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToastMessage(null), 400);
    }, 4500);
  }, []);

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

  // Toggle Master BYOK Routing Policy (Instant Optimistic & Robust)
  const handleToggleRoutingPolicy = async () => {
    if (togglingPolicy) return;
    const currentVal = Boolean(keysHealth.routing_policy?.use_custom_keys);
    const newVal = !currentVal;

    // Instant optimistic update
    setKeysHealth(prev => ({
      ...prev,
      routing_policy: {
        ...prev.routing_policy,
        use_custom_keys: newVal
      }
    }));
    setTogglingPolicy(true);

    try {
      const res = await fetch('/api/billing/keys-routing-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ use_custom_keys: newVal })
      });
      const data = await res.json();
      if (data.success) {
        setKeysHealth(prev => ({
          ...prev,
          routing_policy: data.routing_policy
        }));
        showNotification(
          newVal
            ? 'Custom Gemini Key Routing (Priority #1) enabled @ ₹0.50/query.'
            : 'Platform Managed Engine active @ ₹1.00/query.'
        );
      } else {
        // Revert on failure
        setKeysHealth(prev => ({
          ...prev,
          routing_policy: {
            ...prev.routing_policy,
            use_custom_keys: currentVal
          }
        }));
        showNotification(data.error || 'Failed to update routing policy', 'error');
      }
    } catch (err) {
      setKeysHealth(prev => ({
        ...prev,
        routing_policy: {
          ...prev.routing_policy,
          use_custom_keys: currentVal
        }
      }));
      showNotification('Failed to update routing policy', 'error');
    } finally {
      setTogglingPolicy(false);
    }
  };

  // Sync Telemetry Handler with smooth spin loading state (No extra timers)
  const handleSyncTelemetry = async () => {
    if (syncingTelemetry) return;
    setSyncingTelemetry(true);
    try {
      await Promise.all([fetchBillingControls(), fetchKeysHealth()]);
      showNotification('Refreshed live account telemetry.');
    } catch (err) {
      showNotification('Failed to refresh telemetry', 'error');
    } finally {
      setSyncingTelemetry(false);
    }
  };

  // Test Real API Key Ping (live Google Gemini request - 100% Free - No extra timers)
  const handleTestKey = async (keyId) => {
    setTestingKeyId(keyId);
    try {
      const res = await fetch('/api/billing/keys-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          `Ping Verified (${data.latency_ms}ms, ${data.model_used}): "${data.response_snippet || 'OK'}"`,
          'success'
        );
      } else {
        showNotification(data.error || data.message || 'Key test failed', 'error');
      }
      await fetchKeysHealth();
    } catch (err) {
      showNotification('Key test ping network failure', 'error');
    } finally {
      setTestingKeyId(null);
    }
  };

  // Toggle Key Active / Standby Status
  const handleToggleKeyStatus = async (keyId) => {
    if (togglingKeyId) return;
    setTogglingKeyId(keyId);
    try {
      const res = await fetch(`/api/billing/keys/${keyId}/toggle`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        await fetchKeysHealth();
      }
    } catch (err) {
      showNotification('Failed to toggle key status', 'error');
    } finally {
      setTogglingKeyId(null);
    }
  };

  // Delete Key from Pool
  const handleDeleteKey = async (keyId, label) => {
    if (!window.confirm(`Are you sure you want to remove "${label || 'this key'}" from your pool?`)) {
      return;
    }
    setDeletingKeyId(keyId);
    try {
      const res = await fetch(`/api/billing/keys/${keyId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        await fetchKeysHealth();
      } else {
        showNotification(data.error || 'Failed to delete key', 'error');
      }
    } catch (err) {
      showNotification('Error deleting key', 'error');
    } finally {
      setDeletingKeyId(null);
    }
  };

  // Edit Existing Key
  const handleEditKey = async (e) => {
    e.preventDefault();
    if (!editKeyModal) return;
    setEditingKey(true);
    try {
      const res = await fetch(`/api/billing/keys/${editKeyModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editKeyModal.label,
          key: editKeyModal.key
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, 'success');
        setEditKeyModal(null);
        fetchKeysHealth();
      } else {
        showNotification(data.error || 'Failed to update key', 'error');
      }
    } catch (err) {
      showNotification('Error updating key credentials', 'error');
    } finally {
      setEditingKey(false);
    }
  };

  // Add New Custom Gemini Key
  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!addKeyForm.key?.trim()) {
      showNotification('Please enter a Google Gemini API key', 'error');
      return;
    }
    setAddingKey(true);
    try {
      const res = await fetch('/api/billing/keys-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: addKeyForm.label,
          key: addKeyForm.key
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, 'success');
        setAddKeyModalOpen(false);
        setAddKeyForm({ label: '', key: '' });
        fetchKeysHealth();
      } else {
        showNotification(data.error || 'Failed to add key', 'error');
      }
    } catch (err) {
      showNotification('Error connecting to add key endpoint', 'error');
    } finally {
      setAddingKey(false);
    }
  };

  // Copy Masked Key Helper
  const handleCopyKey = (keyId, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
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
      {/* Top-Right Animated Studio-Style Single-Line Toast Notification (No cross button, auto-dismiss 4.5s) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 999999,
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          border: toastMessage.type === 'error'
            ? '1.5px solid rgba(239, 68, 68, 0.45)'
            : toastMessage.type === 'info'
              ? '1.5px solid rgba(79, 70, 229, 0.45)'
              : '1.5px solid rgba(34, 197, 94, 0.45)',
          boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transform: toastMessage.visible ? 'translateX(0) translateY(0)' : 'translateX(120%) translateY(0)',
          opacity: toastMessage.visible ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
          pointerEvents: 'none',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: toastMessage.type === 'error'
              ? 'rgba(239, 68, 68, 0.12)'
              : toastMessage.type === 'info'
                ? 'rgba(79, 70, 229, 0.12)'
                : 'rgba(34, 197, 94, 0.12)',
            color: toastMessage.type === 'error'
              ? '#dc2626'
              : toastMessage.type === 'info'
                ? '#4f46e5'
                : '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {toastMessage.type === 'error' ? (
              <AlertCircle size={16} />
            ) : toastMessage.type === 'info' ? (
              <Sparkles size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap'
          }}>
            {toastMessage.msg}
          </span>
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Client Profile &amp; Service Governance
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Unified client credentials, auto-metered consumption policies, service lock guards, and 10-key rotating Gemini API pools.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleSyncTelemetry}
            disabled={syncingTelemetry}
            className="btn-secondary"
            title="Refresh live account telemetry"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12.5px',
              padding: '8px 14px',
              minWidth: '135px',
              height: '36px',
              cursor: syncingTelemetry ? 'not-allowed' : 'pointer'
            }}
          >
            {syncingTelemetry ? (
              <Loader2 size={14} className="spin" />
            ) : (
              <>
                <RefreshCw size={13} />
                <span>Sync Telemetry</span>
              </>
            )}
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
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lock size={12} /> Button Locked (Turn Auto-Metered ON to Unlock)
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: architectUsed < 3 ? '#059669' : '#4f46e5' }}>
                          &bull; {architectUsed < 3 ? `${architectFreeRemaining} / 3 Free Left` : '3 Free Consumed'}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2' }}>
                          &bull; ₹1.00 with Custom Key &bull; ₹5.00 Managed
                        </span>
                      </>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Synthesizes complete enterprise master prompts from business descriptions on <code>/universal-studio</code>.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Rate: <strong>₹5.00 / action</strong> (<strong>₹1.00</strong> with custom API key)</span>
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
                    {pArchitect.auto_metered_enabled ? 'Auto-Metered ON (₹1 Custom / ₹5 Managed)' : 'Auto-Metered OFF (Locked after 3 free)'}
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

                <span style={{ fontSize: '10.5px', color: architectIsLocked ? '#dc2626' : 'var(--text-muted)', maxWidth: '280px', textAlign: 'right' }}>
                  {architectIsLocked
                    ? 'Quota exhausted & auto-pay is OFF. Universal Studio button is completely locked.'
                    : pArchitect.auto_metered_enabled
                      ? 'When ON: ₹1.00 with custom key, ₹5.00 on managed engine beyond 3 free.'
                      : 'When OFF: AI halts after 3 free runs. Turn ON to enable at ₹1.00 or ₹5.00.'}
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
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0891b2' }}>
                      &bull; 10 Free Inquiries / Model
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                      &bull; ₹1.00 with Custom Key &bull; ₹3.00 Managed
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Live interactive sandbox testing right panel on <code>/universal-studio</code>. Evaluates lead scoring and persona directives.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Rate: <strong>₹3.00 / query</strong> (<strong>₹1.00</strong> with custom API key)</span>
                    <span>&bull;</span>
                    <span>Independent 10 Free Tier Per Model</span>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: cSimulator.auto_metered_enabled ? '#16a34a' : 'var(--text-muted)' }}>
                    {cSimulator.auto_metered_enabled ? 'Auto-Metered ON (₹1 Custom / ₹3 Managed)' : 'Auto-Metered OFF (10 Free Only)'}
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
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '280px', textAlign: 'right' }}>
                  {cSimulator.auto_metered_enabled
                    ? 'When ON: ₹1.00 with custom key, ₹3.00 on platform beyond 10 free.'
                    : 'When OFF: Testing limited to 10 free queries per model.'}
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
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                      &bull; ₹0.50 with Custom Key &bull; ₹1.00 Managed
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                    Incoming visitor traffic from deployed website embeds and connected Baileys WhatsApp sessions.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Rate: <strong>₹0.50 / req</strong> (Custom Key) &bull; <strong>₹1.00 / req</strong> (Platform Managed)</span>
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
                  Routing Active ({keysHealth.routing_policy?.use_custom_keys ? '₹0.50/req Custom Key' : '₹1.00/req Managed'})
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '280px', textAlign: 'right' }}>
                  {keysHealth.routing_policy?.use_custom_keys
                    ? 'When Custom Keys ON: ₹0.50/req (Priority #1 routing).'
                    : 'When Custom Keys OFF: ₹1.00/req (OmniBot managed engine).'}
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
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isMaxBotsReached ? '#dc2626' : '#059669' }}>
                      &bull; {currentBotsCount} / 3 Maximum Cap
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

      {/* SECTION 3: Client Gemini API Key Vault & Priority BYOK Engine */}
      <div style={{ marginBottom: '36px' }}>
        {/* Section Header with Add Key Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Client Gemini API Key Vault &amp; Priority BYOK Engine
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Manage your custom Google Gemini keys. When enabled, your keys receive <strong>Priority #1</strong> rotation (₹0.50/req). Auto-failover routes to the Managed Engine @ ₹1.00/req.
            </p>
          </div>

          {/* ONLY the + Add Gemini API Key Button on right side */}
          <button
            type="button"
            onClick={() => {
              setAddKeyForm({ label: `Gemini Key #${(keysHealth.keys?.length || 0) + 1}`, key: '' });
              setAddKeyModalOpen(true);
            }}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              padding: '8px 16px',
              fontWeight: 700,
              borderRadius: '8px'
            }}
          >
            <Plus size={14} />
            <span>Add Gemini API Key</span>
          </button>
        </div>

        {/* Master BYOK Priority Switch Card - Identical clean border and surface styling as upper Service Cards */}
        <div className="glass-panel" style={{
          padding: '18px 24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Client Custom API Key Routing (BYOK - Priority #1)
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: keysHealth.routing_policy?.use_custom_keys ? '#16a34a' : 'var(--text-muted)'
                  }}>
                    &bull; {keysHealth.routing_policy?.use_custom_keys
                      ? 'Active: ₹0.50 / req (Priority #1)'
                      : 'Inactive: ₹1.00 / req (Managed Safety Net)'}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 6px' }}>
                  Priority #1 multi-key sequential rotation across all your client keys (₹0.50/req). Auto-failover to Managed Safety Net (₹1.00/req) if client quota runs out.
                </p>

                {/* Routing Strategy Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}>
                    <Zap size={11} color="#f59e0b" />
                    <strong>Priority 1:</strong> Client Keys (₹0.50/req &bull; ₹1.00 studio)
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}>
                    <Activity size={11} color="#10b981" />
                    <strong>Backup:</strong> Managed Engine (₹1.00/req &bull; ₹5.00 studio)
                  </span>
                </div>
              </div>
            </div>

            {/* Master Switch */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: keysHealth.routing_policy?.use_custom_keys ? '#16a34a' : 'var(--text-muted)' }}>
                  {keysHealth.routing_policy?.use_custom_keys ? 'Custom Keys ON (₹0.50 / req)' : 'Custom Keys OFF (₹1.00 / req)'}
                </span>

                <button
                  type="button"
                  disabled={togglingPolicy}
                  onClick={handleToggleRoutingPolicy}
                  style={{
                    width: '46px',
                    height: '24px',
                    borderRadius: '999px',
                    backgroundColor: keysHealth.routing_policy?.use_custom_keys ? '#10b981' : '#cbd5e1',
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
                    left: keysHealth.routing_policy?.use_custom_keys ? '25px' : '3px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '280px', textAlign: 'right' }}>
                {keysHealth.routing_policy?.use_custom_keys
                  ? 'When ON: ₹0.50/req (Client keys tried first. Auto-failover to ₹1.00/req).'
                  : 'When OFF: ₹1.00/req (Always routes via Platform Managed Engine).'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Key Cards List (ONLY configured keys shown - No fake empty slots) */}
        {(!keysHealth.keys || keysHealth.keys.length === 0) ? (
          <div className="glass-panel" style={{
            padding: '40px 24px',
            textAlign: 'center',
            borderRadius: '14px',
            border: '1px dashed var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(79, 70, 229, 0.08)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Key size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              No Custom Gemini API Keys Added Yet
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 18px', lineHeight: '1.5' }}>
              Traffic is currently routed 100% reliably through the OmniBot Platform Managed Engine @ ₹0.60 per query. Click below to add your own Google AI Studio key for Priority #1 routing.
            </p>
            <button
              type="button"
              onClick={() => {
                setAddKeyForm({ label: 'Primary Google AI Studio Key', key: '' });
                setAddKeyModalOpen(true);
              }}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '10px 20px' }}
            >
              <Plus size={15} />
              <span>Add Your First Gemini Key</span>
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {keysHealth.keys.map((keyObj, idx) => {
              const isActive = keyObj.status === 'active';
              const isOverQuota = keyObj.status === 'over_quota';
              const isStandby = keyObj.status === 'standby';
              const isInvalid = keyObj.status === 'invalid';
              const isTesting = testingKeyId === keyObj.id;

              return (
                <div
                  key={keyObj.id || idx}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    border: keyObj.is_primary
                      ? '2px solid var(--primary)'
                      : isOverQuota
                        ? '1px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid var(--border-subtle)',
                    backgroundColor: keyObj.is_primary
                      ? 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(79, 70, 229, 0.02) 100%)'
                      : isOverQuota
                        ? 'rgba(239, 68, 68, 0.02)'
                        : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Top Row: Priority & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: keyObj.is_primary ? 'var(--primary)' : 'var(--bg-page)',
                          color: keyObj.is_primary ? '#ffffff' : 'var(--text-secondary)'
                        }}>
                          Priority #{keyObj.priority || (idx + 1)}
                        </span>
                        {keyObj.is_primary && (
                          <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 800 }}>
                            Primary Key
                          </span>
                        )}
                      </div>

                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: isActive
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isOverQuota
                            ? 'rgba(239, 68, 68, 0.15)'
                            : isInvalid
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(100, 116, 139, 0.15)',
                        color: isActive
                          ? '#059669'
                          : isOverQuota
                            ? '#dc2626'
                            : isInvalid
                              ? '#dc2626'
                              : '#64748b'
                      }}>
                        {isActive
                          ? 'Active & Verified'
                          : isOverQuota
                            ? 'Daily Quota Limit (429)'
                            : isInvalid
                              ? 'Invalid Key'
                              : 'Standby'}
                      </span>
                    </div>

                    {/* Key Label */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {keyObj.label}
                    </div>

                    {/* Masked Key & Copy Button */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-page)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{ fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {keyObj.masked_key}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(keyObj.id, keyObj.masked_key)}
                        title="Copy Key Reference"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: copiedKeyId === keyObj.id ? '#10b981' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          padding: '2px 4px'
                        }}
                      >
                        {copiedKeyId === keyObj.id ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedKeyId === keyObj.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Telemetry Row: Latency, Last Checked, Models */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '12px',
                      padding: '0 2px'
                    }}>
                      <span>Latency: <strong style={{ color: keyObj.latency_ms > 0 ? '#10b981' : 'inherit' }}>{keyObj.latency_ms > 0 ? `${keyObj.latency_ms}ms` : '--'}</strong></span>
                      <span>Model: <strong>{keyObj.models_available?.[0] || 'gemini-3.6-flash'}</strong></span>
                      <span>Tested: <strong>{keyObj.last_tested}</strong></span>
                    </div>

                    {/* Live Gemini Response & Dynamic Token Meter Box */}
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.05)' : isOverQuota ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-page)',
                      border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : isOverQuota ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: isActive ? '#059669' : isOverQuota ? '#dc2626' : 'var(--text-muted)',
                        marginBottom: '4px'
                      }}>
                        <span>Latest Gemini Ping Telemetry</span>
                        {keyObj.tokens_used && (
                          <span>{keyObj.tokens_used.totalTokenCount || keyObj.tokens_used.total || 0} Total Tokens</span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '11.5px',
                        color: 'var(--text-primary)',
                        fontStyle: 'italic',
                        marginBottom: keyObj.tokens_used ? '6px' : '0',
                        lineHeight: '1.4'
                      }}>
                        "{keyObj.last_ping_response || 'Click Ping Test to verify live connectivity and measure latency.'}"
                      </div>

                      {keyObj.tokens_used && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          paddingTop: '6px',
                          borderTop: '1px dashed var(--border-subtle)'
                        }}>
                          <span>Prompt: <strong>{keyObj.tokens_used.promptTokenCount || 0}</strong></span>
                          <span>&bull;</span>
                          <span>Output: <strong>{keyObj.tokens_used.candidatesTokenCount || 0}</strong></span>
                          <span>&bull;</span>
                          <span>Total: <strong>{keyObj.tokens_used.totalTokenCount || 0}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    {/* Left: Quick Status Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#10b981' : '#94a3b8'
                      }} />
                      <span>{isActive ? 'Active Priority #1' : 'Paused / Standby'}</span>
                      {keyObj.latency_ms && <span>&bull; {keyObj.latency_ms}ms</span>}
                    </div>

                    {/* Right: Icon-Only Action Buttons (Ping Test FIRST) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* 1. Ping Test Icon Button (FIRST in card actions) */}
                      <button
                        type="button"
                        disabled={isTesting || !keyObj.raw_key_available}
                        onClick={() => handleTestKey(keyObj.id)}
                        title={isTesting ? 'Pinging Gemini 3.6 Flash (Free)...' : 'Live Connectivity & Latency Ping Test (Free)'}
                        style={{
                          width: '32px',
                          height: '30px',
                          borderRadius: '6px',
                          border: isTesting ? '1px solid var(--primary)' : '1px solid rgba(79, 70, 229, 0.3)',
                          backgroundColor: isTesting ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.08)',
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isTesting ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isTesting ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <Activity size={13} />
                        )}
                      </button>

                      {/* 2. Start / Pause Icon Toggle */}
                      {isActive ? (
                        <button
                          type="button"
                          disabled={togglingKeyId === keyObj.id}
                          onClick={() => handleToggleKeyStatus(keyObj.id)}
                          title="Pause Key (Set to Standby)"
                          style={{
                            width: '32px',
                            height: '30px',
                            borderRadius: '6px',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            backgroundColor: 'rgba(245, 158, 11, 0.08)',
                            color: '#d97706',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: togglingKeyId === keyObj.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {togglingKeyId === keyObj.id ? (
                            <Loader2 size={13} className="spin" />
                          ) : (
                            <Pause size={13} />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={togglingKeyId === keyObj.id}
                          onClick={() => handleToggleKeyStatus(keyObj.id)}
                          title="Activate Key (Start Priority #1 Routing)"
                          style={{
                            width: '32px',
                            height: '30px',
                            borderRadius: '6px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            color: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: togglingKeyId === keyObj.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {togglingKeyId === keyObj.id ? (
                            <Loader2 size={13} className="spin" />
                          ) : (
                            <Play size={13} />
                          )}
                        </button>
                      )}

                      {/* 3. Edit Key Icon Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditKeyModal({ id: keyObj.id, label: keyObj.label, key: '' });
                          setShowEditKeySecret(false);
                        }}
                        title="Edit Key Label & Secret"
                        style={{
                          width: '32px',
                          height: '30px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-page)',
                          color: 'var(--text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Pencil size={13} />
                      </button>

                      {/* 4. Delete Key Icon Button */}
                      <button
                        type="button"
                        disabled={deletingKeyId === keyObj.id}
                        onClick={() => handleDeleteKey(keyObj.id, keyObj.label)}
                        title="Delete Key from Vault"
                        style={{
                          width: '32px',
                          height: '30px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          backgroundColor: 'rgba(239, 68, 68, 0.06)',
                          color: '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: deletingKeyId === keyObj.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {deletingKeyId === keyObj.id ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add New Gemini Key */}
      {addKeyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '26px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Key size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Add New Google Gemini API Key
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Tested live with Gemini 3.6 Flash before saving.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddKeyModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddKey}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Key Identifier / Label *
                </label>
                <input
                  type="text"
                  required
                  value={addKeyForm.label}
                  onChange={(e) => setAddKeyForm({ ...addKeyForm, label: e.target.value })}
                  placeholder="e.g. Production Gemini 3.6 Flash Key"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Google Gemini API Key (AIzaSy... or AQ...) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    required
                    value={addKeyForm.key}
                    onChange={(e) => setAddKeyForm({ ...addKeyForm, key: e.target.value })}
                    placeholder="Enter your Gemini API key"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
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
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showKeySecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}>
                  <span>Your key is tested immediately with Google Cloud.</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>Get Key from Google</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                border: '1px solid rgba(79, 70, 229, 0.15)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
                  Safety-Net Guarantee:
                </div>
                When BYOK is enabled, this key receives Priority #1 (₹0.50/req). If it ever exceeds quota, OmniBot auto-routes to our managed engine @ ₹1.00/req so you never miss a client lead.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddKeyModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingKey || !addKeyForm.key?.trim()}
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minWidth: '150px',
                    height: '36px',
                    cursor: addingKey ? 'not-allowed' : 'pointer'
                  }}
                >
                  {addingKey ? (
                    <Loader2 size={15} className="spin" />
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Verify & Add Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Gemini Key */}
      {editKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '26px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Edit Google Gemini API Key
                  </h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Update key label or replace API secret credentials.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditKeyModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditKey}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Key Identifier / Label *
                </label>
                <input
                  type="text"
                  required
                  value={editKeyModal.label || ''}
                  onChange={(e) => setEditKeyModal({ ...editKeyModal, label: e.target.value })}
                  placeholder="e.g. Primary Production Gemini Key"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>
                  New Google Gemini API Key (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showEditKeySecret ? 'text' : 'password'}
                    value={editKeyModal.key || ''}
                    onChange={(e) => setEditKeyModal({ ...editKeyModal, key: e.target.value })}
                    placeholder="Leave blank to keep current verified key"
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
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
                  <button
                    type="button"
                    onClick={() => setShowEditKeySecret(!showEditKeySecret)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showEditKeySecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p style={{ margin: '5px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  If a new key is entered, it is tested live with Gemini 3.6 Flash before saving.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditKeyModal(null)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editingKey || !editKeyModal.label?.trim()}
                  className="btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minWidth: '150px',
                    height: '36px',
                    cursor: editingKey ? 'not-allowed' : 'pointer'
                  }}
                >
                  {editingKey ? (
                    <Loader2 size={15} className="spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Key Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
