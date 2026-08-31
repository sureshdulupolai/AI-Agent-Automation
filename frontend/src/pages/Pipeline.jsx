import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Plus,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  MoreVertical,
  Trash2,
  ArrowRight,
  Phone,
  Mail,
  User,
  Calendar,
  Layers,
  X,
  Search,
  Filter,
  RefreshCw,
  Trophy,
  Sparkles,
  Send,
  XCircle,
  MessageSquare,
  Building2,
  Clock,
  ChevronRight,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';

const STAGES = [
  {
    id: 'new_deal',
    title: 'New Deals',
    color: '#64748b',
    borderTop: '#94a3b8',
    icon: Sparkles,
    bgBadge: 'rgba(100, 116, 139, 0.1)',
    textColor: '#475569'
  },
  {
    id: 'qualified',
    title: 'AI Qualified',
    color: '#ea580c',
    borderTop: '#f97316',
    icon: Zap,
    bgBadge: 'rgba(234, 88, 12, 0.1)',
    textColor: '#c2410c'
  },
  {
    id: 'proposal_sent',
    title: 'Proposal Sent',
    color: '#4f46e5',
    borderTop: '#6366f1',
    icon: Send,
    bgBadge: 'rgba(79, 70, 229, 0.1)',
    textColor: '#4338ca'
  },
  {
    id: 'closed_won',
    title: 'Closed / Won',
    color: '#16a34a',
    borderTop: '#22c55e',
    icon: Trophy,
    bgBadge: 'rgba(22, 163, 74, 0.1)',
    textColor: '#15803d'
  },
  {
    id: 'closed_lost',
    title: 'Closed / Lost',
    color: '#dc2626',
    borderTop: '#ef4444',
    icon: XCircle,
    bgBadge: 'rgba(220, 38, 38, 0.1)',
    textColor: '#b91c1c'
  }
];

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [metrics, setMetrics] = useState({
    total_deals: 0,
    total_pipeline_value: 0,
    won_revenue: 0,
    conversion_rate: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    title: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    value: '',
    stage: 'new_deal',
    notes: ''
  });

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleStageChange = async (dealId, nextStage) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: nextStage } : d));

    if (nextStage === 'closed_won') {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }

    try {
      await fetch(`/api/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage })
      });
      fetchDeals();
    } catch (err) {
      console.error('Stage change error:', err);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewDeal({ title: '', contact_name: '', contact_phone: '', contact_email: '', value: '', stage: 'new_deal', notes: '' });
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
        fetchDeals();
      }
    } catch (err) {
      console.error('Create deal error:', err);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Remove this deal from the sales pipeline?')) return;
    try {
      await fetch(`/api/deals/${dealId}`, { method: 'DELETE' });
      setDeals(prev => prev.filter(d => d.id !== dealId));
    } catch (err) {
      console.error('Delete deal error:', err);
    }
  };

  const filteredDeals = deals.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.title || '').toLowerCase().includes(q) ||
      (d.contact_name || '').toLowerCase().includes(q) ||
      (d.contact_phone || '').toLowerCase().includes(q) ||
      (d.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1560px', margin: '0 auto', padding: '28px 24px 60px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)' }}>
            <Kanban size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '23px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Deals &amp; Sales Pipeline
              </h1>
              <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                Live Kanban
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Visual deal tracking synchronized with autonomous multi-channel AI lead qualification.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchDeals}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={15} />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Highlight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Pipeline Value */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Pipeline Value
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              ${metrics.total_pipeline_value?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Won Revenue */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Trophy size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Closed Won Revenue
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
              ${metrics.won_revenue?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 3: Total Deals */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Active Deals
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.total_deals}
            </div>
          </div>
        </div>

        {/* Card 4: Win Rate */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pipeline Win Rate
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
              {metrics.conversion_rate}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 14px', width: '320px' }}>
          <Search size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search deals, prospects, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '100%' }}
          />
        </div>

        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing {filteredDeals.length} of {deals.length} deals
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', alignItems: 'flex-start', minHeight: '620px', overflowX: 'auto', paddingBottom: '16px' }}>
        {STAGES.map(stage => {
          const StageIcon = stage.icon;
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderTop: `3px solid ${stage.borderTop}`,
                borderRadius: '16px',
                padding: '16px 14px',
                minWidth: '270px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: stage.bgBadge, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stage.color }}>
                    <StageIcon size={14} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {stage.title}
                  </span>
                  <span style={{ backgroundColor: 'var(--bg-page)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    {stageDeals.length}
                  </span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: stage.color }}>
                  ${stageValue.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '140px' }}>
                {stageDeals.length === 0 ? (
                  <div style={{ border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <div style={{ opacity: 0.5, marginBottom: '4px' }}>
                      <StageIcon size={20} style={{ margin: '0 auto' }} />
                    </div>
                    No deals in {stage.title}
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const avatarBg = getInitialColor(deal.contact_name || 'Client');
                    const initial = getInitialLetter(deal.contact_name || 'C');

                    return (
                      <div
                        key={deal.id}
                        style={{
                          backgroundColor: 'var(--bg-page)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '14px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Title & Delete Action */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.35 }}>
                            {deal.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            title="Delete deal"
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Contact Avatar & Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: avatarBg, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                            {initial}
                          </div>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {deal.contact_name}
                          </span>
                        </div>

                        {deal.contact_phone && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={12} color="#64748b" />
                            <span>{deal.contact_phone}</span>
                          </div>
                        )}

                        {/* Value & Score Pills */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a' }}>
                            ${Number(deal.value || 0).toLocaleString()}
                          </span>

                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, backgroundColor: deal.lead_temperature?.includes('Hot') ? '#fee2e2' : '#fef3c7', color: deal.lead_temperature?.includes('Hot') ? '#b91c1c' : '#b45309' }}>
                            <Flame size={11} /> {deal.lead_score || 50}/100
                          </span>
                        </div>

                        {/* Stage Selector Dropdown */}
                        <div style={{ marginTop: '10px' }}>
                          <select
                            value={deal.stage}
                            onChange={(e) => handleStageChange(deal.id, e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>Move: {s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '26px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Create New Pipeline Deal
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Add a prospective client opportunity
                  </span>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Deal Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Website Revamp & AI Bot Deployment"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newDeal.contact_name}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newDeal.contact_phone}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>Initial Stage</label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '13px', color: 'var(--text-primary)' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
                >
                  Add to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
