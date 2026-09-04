import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Zap,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User,
  Calendar,
  Layers,
  X,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Send,
  XCircle,
  MessageSquare,
  Building2,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Target,
  ExternalLink,
  Edit3,
  Eye,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutList,
  Plus,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';

// Enterprise Pipeline Stages
const STAGES = [
  {
    id: 'new_deal',
    title: 'New Deal',
    code: 'NEW',
    color: '#4f46e5',
    bgBadge: 'rgba(79, 70, 229, 0.1)',
    textColor: '#4338ca',
    borderColor: '#c7d2fe'
  },
  {
    id: 'qualified',
    title: 'Qualified',
    code: 'QUAL',
    color: '#ea580c',
    bgBadge: 'rgba(234, 88, 12, 0.1)',
    textColor: '#c2410c',
    borderColor: '#fed7aa'
  },
  {
    id: 'proposal_sent',
    title: 'Proposal Sent',
    code: 'PROP',
    color: '#0284c7',
    bgBadge: 'rgba(2, 132, 199, 0.1)',
    textColor: '#0369a1',
    borderColor: '#bae6fd'
  },
  {
    id: 'closed_won',
    title: 'Closed Won',
    code: 'WON',
    color: '#16a34a',
    bgBadge: 'rgba(22, 163, 74, 0.1)',
    textColor: '#15803d',
    borderColor: '#bbf7d0'
  },
  {
    id: 'closed_lost',
    title: 'Closed Lost',
    code: 'LOST',
    color: '#dc2626',
    bgBadge: 'rgba(220, 38, 38, 0.1)',
    textColor: '#b91c1c',
    borderColor: '#fecaca'
  }
];

// Custom Smooth Stage Selector Dropdown (Replaces clunky native select)
function CustomStageDropdown({ currentStageId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentStage = STAGES.find(s => s.id === currentStageId) || STAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          width: '132px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          border: `1px solid ${currentStage.borderColor}`,
          backgroundColor: currentStage.bgBadge,
          color: currentStage.textColor,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentStage.color, flexShrink: 0 }}></span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentStage.title}</span>
        </div>
        <ChevronDown
          size={12}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 200,
          width: '145px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {STAGES.map(s => {
            const isSelected = s.id === currentStageId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelect(s.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? s.textColor : 'var(--text-primary)',
                  backgroundColor: isSelected ? s.bgBadge : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }}></span>
                  <span>{s.title}</span>
                </div>
                {isSelected && <Check size={12} color={s.color} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Priority & Sort Options for Custom Dropdowns
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities', badgeColor: '#94a3b8' },
  { value: 'high', label: 'High Priority (80+)', badgeColor: '#16a34a' },
  { value: 'medium', label: 'Medium Priority (50-79)', badgeColor: '#ea580c' }
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Sort: Most Recent' },
  { value: 'value_desc', label: 'Sort: Value (High to Low)' },
  { value: 'value_asc', label: 'Sort: Value (Low to High)' },
  { value: 'score_desc', label: 'Sort: Highest Score' }
];

// Custom High-End Select Dropdown (Floating cleanly over the table with guaranteed z-index)
function CustomSelect({ value, onChange, options, minWidth = '150px' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block', zIndex: isOpen ? 9999 : 10 }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          minWidth: minWidth,
          padding: '6px 12px',
          borderRadius: '7px',
          border: isOpen ? '1px solid #4f46e5' : '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px rgba(79, 70, 229, 0.15)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          {selectedOption.badgeColor && (
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: selectedOption.badgeColor,
              flexShrink: 0
            }} />
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown
          size={12}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease'
          }}
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 99999,
          minWidth: '100%',
          width: 'max-content',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 4px 10px -2px rgba(0, 0, 0, 0.08)',
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#4f46e5' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  {opt.badgeColor && (
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: opt.badgeColor,
                      flexShrink: 0
                    }} />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={13} color="#4f46e5" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc'); // 'value_desc' | 'value_asc' | 'date_desc' | 'score_desc'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grouped'
  
  // Fixed 15 Deals Per Page (Locked)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Inspector Drawer & Modal States
  const [activeDealDrawer, setActiveDealDrawer] = useState(null);
  const [isEditingDrawer, setIsEditingDrawer] = useState(false);
  const [drawerFormData, setDrawerFormData] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    title: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    value: '',
    stage: 'new_deal',
    lead_score: 85,
    lead_temperature: 'High Intent',
    source: 'whatsapp_ai',
    notes: ''
  });

  // Fetch Pipeline Deals
  const fetchDeals = async () => {
    setLoading(true);
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

  // Stage Update Handler
  const handleStageChange = async (dealId, nextStage) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: nextStage } : d));
    if (activeDealDrawer && activeDealDrawer.id === dealId) {
      setActiveDealDrawer(prev => ({ ...prev, stage: nextStage }));
    }

    if (nextStage === 'closed_won') {
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
    }

    try {
      await fetch(`/api/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage })
      });
      fetchDeals();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  // Create Deal Handler
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
        setShowCreateModal(false);
        setNewDeal({
          title: '',
          contact_name: '',
          contact_phone: '',
          contact_email: '',
          value: '',
          stage: 'new_deal',
          lead_score: 85,
          lead_temperature: 'High Intent',
          source: 'whatsapp_ai',
          notes: ''
        });
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
        fetchDeals();
      }
    } catch (err) {
      console.error('Create deal error:', err);
    }
  };

  // Save Edits from Inspector Drawer
  const handleSaveDrawerEdits = async () => {
    if (!activeDealDrawer) return;
    try {
      const res = await fetch(`/api/deals/${activeDealDrawer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drawerFormData)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingDrawer(false);
        setActiveDealDrawer(data.deal);
        fetchDeals();
      }
    } catch (err) {
      console.error('Save deal error:', err);
    }
  };

  // Delete Deal Handler
  const handleDeleteDeal = async (dealId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Permanently remove this deal from the pipeline?')) return;
    try {
      await fetch(`/api/deals/${dealId}`, { method: 'DELETE' });
      setDeals(prev => prev.filter(d => d.id !== dealId));
      if (activeDealDrawer && activeDealDrawer.id === dealId) {
        setActiveDealDrawer(null);
      }
    } catch (err) {
      console.error('Delete deal error:', err);
    }
  };

  // Filtered & Sorted Deals List
  const filteredAndSortedDeals = useMemo(() => {
    let result = deals.filter(deal => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (
          (deal.title || '').toLowerCase().includes(q) ||
          (deal.contact_name || '').toLowerCase().includes(q) ||
          (deal.contact_phone || '').toLowerCase().includes(q) ||
          (deal.contact_email || '').toLowerCase().includes(q) ||
          (deal.notes || '').toLowerCase().includes(q)
        );
        if (!matches) return false;
      }

      // Stage Filter
      if (selectedStageFilter !== 'all' && deal.stage !== selectedStageFilter) {
        return false;
      }

      // Priority Filter
      if (selectedPriorityFilter === 'high') {
        const score = Number(deal.lead_score) || 0;
        if (score < 80) return false;
      } else if (selectedPriorityFilter === 'medium') {
        const score = Number(deal.lead_score) || 0;
        if (score < 50 || score >= 80) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'value_desc') return (Number(b.value) || 0) - (Number(a.value) || 0);
      if (sortBy === 'value_asc') return (Number(a.value) || 0) - (Number(b.value) || 0);
      if (sortBy === 'score_desc') return (Number(b.lead_score) || 0) - (Number(a.lead_score) || 0);
      return new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0);
    });

    return result;
  }, [deals, searchQuery, selectedStageFilter, selectedPriorityFilter, sortBy]);

  // Fixed 15 Items Per Page Slice
  const totalPages = Math.ceil(filteredAndSortedDeals.length / PAGE_SIZE) || 1;
  const paginatedDeals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedDeals.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedDeals, currentPage]);

  // Stage Distribution Matrix Stats
  const stageStats = useMemo(() => {
    return STAGES.map(s => {
      const stageDeals = deals.filter(d => d.stage === s.id);
      const totalVal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
      return {
        ...s,
        count: stageDeals.length,
        totalValue: totalVal
      };
    });
  }, [deals]);

  const avgDealValue = deals.length > 0 
    ? Math.round(metrics.total_pipeline_value / deals.length) 
    : 0;

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Inline Animation Styles for Staggered Row Cascade Inflow */}
      <style>{`
        @keyframes rowCascadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pipeline-cascade-row {
          opacity: 0;
          animation: rowCascadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, transform;
        }
      `}</style>

      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Sales Pipeline &amp; Deal Management
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4f46e5' }}></span>
              Live CRM
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
            Executive deal tracking synchronized with autonomous lead qualification and WhatsApp communications.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '3px'
          }}>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#4f46e5' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <TableIcon size={13} />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('grouped')}
              title="By Stage View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'grouped' ? '#4f46e5' : 'transparent',
                color: viewMode === 'grouped' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LayoutList size={13} />
              <span>By Stage</span>
            </button>
          </div>

          <button
            onClick={fetchDeals}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Plus size={15} />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Pipeline Value
            </div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              ${Number(metrics.total_pipeline_value || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Trophy size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Closed Won Revenue
            </div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
              ${Number(metrics.won_revenue || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Opportunities
            </div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.total_deals || 0} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>deals</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#ede9fe',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Conversion Win Rate
            </div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
              {metrics.conversion_rate || '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stage Progression Funnel Matrix (Acts as the Primary Stage Command Filter) */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pipeline Distribution &amp; Volume
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            Average Deal Size: <strong style={{ color: '#16a34a' }}>${avgDealValue.toLocaleString()}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {/* Card 1: All Deals Reset / Overview Card */}
          <div
            onClick={() => {
              setSelectedStageFilter('all');
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: selectedStageFilter === 'all' ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-page)',
              border: selectedStageFilter === 'all' ? '1.5px solid #4f46e5' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: selectedStageFilter === 'all' ? '#4f46e5' : 'var(--text-primary)' }}>
                All Deals
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: selectedStageFilter === 'all' ? 'rgba(79, 70, 229, 0.15)' : 'var(--border-subtle)',
                color: selectedStageFilter === 'all' ? '#4f46e5' : 'var(--text-secondary)'
              }}>
                {deals.length}
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>
              ${Number(metrics.total_pipeline_value || 0).toLocaleString()}
            </div>
          </div>

          {/* Cards 2 to 6: Stage Specific Cards */}
          {stageStats.map(s => {
            const isSelected = selectedStageFilter === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedStageFilter(isSelected ? 'all' : s.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? s.bgBadge : 'var(--bg-page)',
                  border: isSelected ? `1.5px solid ${s.color}` : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? s.color : 'var(--text-primary)' }}>
                    {s.title}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '6px',
                    backgroundColor: s.bgBadge,
                    color: s.color
                  }}>
                    {s.count}
                  </span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>
                  ${s.totalValue.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filter & Search Command Bar (With High-End Custom Dropdowns Floating Over Table) */}
      <div style={{
        position: 'relative',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '340px'
        }}>
          <Search size={14} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search deals, prospects, phone, notes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Controls: Custom High-End Dropdowns Floating On Top of Table */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Custom Priority Filter */}
          <CustomSelect
            value={selectedPriorityFilter}
            onChange={(val) => {
              setSelectedPriorityFilter(val);
              setCurrentPage(1);
            }}
            options={PRIORITY_OPTIONS}
            minWidth="155px"
          />

          {/* Custom Sort By */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={SORT_OPTIONS}
            minWidth="180px"
          />
        </div>
      </div>

      {/* 5. Main Content: Table Matrix View (With Bottom-Pinned Footer & Stagger Cascade) */}
      {viewMode === 'table' ? (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}>
          {/* Scrollable Table Viewport */}
          <div style={{ flex: 1, overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              {/* Locked Column Widths that NEVER Shift on Filter Changes */}
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-page)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Deal Opportunity</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Contact Phone</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Stage</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Deal Value</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Score</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              {/* Dynamic key ensures 100% reliable staggered cascade animation on filter/page switch */}
              <tbody key={`${selectedStageFilter}_${selectedPriorityFilter}_${sortBy}_${currentPage}_${searchQuery.trim()}`}>
                {paginatedDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No deals found matching the current filter.
                    </td>
                  </tr>
                ) : (
                  paginatedDeals.map((deal, idx) => {
                    const score = Number(deal.lead_score) || 50;

                    return (
                      <tr
                        key={deal.id}
                        className="pipeline-cascade-row"
                        onClick={() => {
                          setActiveDealDrawer(deal);
                          setDrawerFormData(deal);
                          setIsEditingDrawer(false);
                        }}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                          height: '46px',
                          animationDelay: `${idx * 20}ms`
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Column 1: Deal Opportunity Title (Ellipsis Truncation) */}
                        <td style={{ padding: '8px 14px', overflow: 'hidden' }}>
                          <div
                            title={deal.title}
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {deal.title}
                          </div>
                        </td>

                        {/* Column 2: Contact Phone Only (Full Name in Inspector Drawer) */}
                        <td style={{ padding: '8px 14px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                            <Phone size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            <span style={{
                              fontWeight: 600,
                              color: deal.contact_phone ? 'var(--text-primary)' : 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: '12px'
                            }}>
                              {deal.contact_phone || 'No phone recorded'}
                            </span>
                          </div>
                        </td>

                        {/* Column 3: Custom Smooth Stage Dropdown */}
                        <td style={{ padding: '8px 14px', overflow: 'visible' }} onClick={(e) => e.stopPropagation()}>
                          <CustomStageDropdown
                            currentStageId={deal.stage}
                            onSelect={(newStage) => handleStageChange(deal.id, newStage)}
                          />
                        </td>

                        {/* Column 4: Deal Value */}
                        <td style={{ padding: '8px 14px', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '13px' }}>
                            ${Number(deal.value || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Column 5: Lead Score Bar */}
                        <td style={{ padding: '8px 14px', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '32px',
                              height: '4px',
                              borderRadius: '2px',
                              backgroundColor: 'var(--border-subtle)',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(score, 100)}%`,
                                height: '100%',
                                backgroundColor: score >= 80 ? '#16a34a' : score >= 50 ? '#ea580c' : '#94a3b8'
                              }} />
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: score >= 80 ? '#16a34a' : score >= 50 ? '#ea580c' : 'var(--text-muted)'
                            }}>
                              {score}
                            </span>
                          </div>
                        </td>

                        {/* Column 6: Actions */}
                        <td style={{ padding: '8px 14px', textAlign: 'right', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                            {deal.contact_phone && (
                              <a
                                href={`https://wa.me/${deal.contact_phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open WhatsApp Chat"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '5px',
                                  backgroundColor: '#dcfce7',
                                  color: '#16a34a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none'
                                }}
                              >
                                <MessageSquare size={12} />
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setActiveDealDrawer(deal);
                                setDrawerFormData(deal);
                                setIsEditingDrawer(false);
                              }}
                              title="Inspect Details"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '5px',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} />
                            </button>

                            <button
                              onClick={(e) => handleDeleteDeal(deal.id, e)}
                              title="Delete Deal"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '5px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination Footer (Zero space underneath, locked to bottom edge) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-page)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            marginTop: 'auto'
          }}>
            <div>
              Showing {filteredAndSortedDeals.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(currentPage * PAGE_SIZE, filteredAndSortedDeals.length)} of {filteredAndSortedDeals.length} deals
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={13} />
              </button>

              <span style={{ fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Alternative View: Stage Grouped Rows */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STAGES.map(stage => {
            const stageDeals = filteredAndSortedDeals.filter(d => d.stage === stage.id);
            const stageSum = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

            return (
              <div
                key={stage.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                {/* Group Header */}
                <div style={{
                  padding: '9px 14px',
                  backgroundColor: 'var(--bg-page)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: stage.bgBadge,
                      color: stage.color
                    }}>
                      {stage.title}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {stageDeals.length} deals
                    </span>
                  </div>

                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#16a34a' }}>
                    ${stageSum.toLocaleString()}
                  </span>
                </div>

                {/* Group Rows */}
                <div>
                  {stageDeals.length === 0 ? (
                    <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No deals currently in {stage.title}
                    </div>
                  ) : (
                    stageDeals.map(deal => (
                      <div
                        key={deal.id}
                        onClick={() => {
                          setActiveDealDrawer(deal);
                          setDrawerFormData(deal);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{deal.title}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '11px' }}>
                            ({deal.contact_name || 'Prospect'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <span style={{ fontWeight: 800, color: '#16a34a' }}>
                            ${Number(deal.value || 0).toLocaleString()}
                          </span>
                          <ChevronRight size={13} color="var(--text-muted)" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Slide-Over Inspector Drawer (Shows Prospect Name, Requirements & All Details) */}
      {activeDealDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '100%',
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: STAGES.find(s => s.id === activeDealDrawer.stage)?.bgBadge || '#e0e7ff',
                    color: STAGES.find(s => s.id === activeDealDrawer.stage)?.color || '#4f46e5'
                  }}>
                    {STAGES.find(s => s.id === activeDealDrawer.stage)?.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ID: {activeDealDrawer.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 0' }}>
                  {isEditingDrawer ? (
                    <input
                      type="text"
                      value={drawerFormData.title || ''}
                      onChange={(e) => setDrawerFormData({ ...drawerFormData, title: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', fontSize: '14px', fontWeight: 700 }}
                    />
                  ) : (
                    activeDealDrawer.title
                  )}
                </h3>
              </div>

              <button
                onClick={() => setActiveDealDrawer(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stage Selector Stepper */}
            <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Pipeline Stage Progression
              </div>
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                {STAGES.map(s => {
                  const isCurrent = activeDealDrawer.stage === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(activeDealDrawer.id, s.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        border: isCurrent ? `1px solid ${s.color}` : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrent ? s.color : 'var(--bg-surface)',
                        color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details Grid: Full Prospect Name Shown Here */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Client / Prospect Name</div>
                {isEditingDrawer ? (
                  <input
                    type="text"
                    value={drawerFormData.contact_name || ''}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, contact_name: e.target.value })}
                    style={{ width: '100%', marginTop: '3px', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                  />
                ) : (
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {activeDealDrawer.contact_name || 'Prospect'}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Deal Value</div>
                {isEditingDrawer ? (
                  <input
                    type="number"
                    value={drawerFormData.value || ''}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, value: e.target.value })}
                    style={{ width: '100%', marginTop: '3px', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                  />
                ) : (
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                    ${Number(activeDealDrawer.value || 0).toLocaleString()}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</div>
                {isEditingDrawer ? (
                  <input
                    type="text"
                    value={drawerFormData.contact_phone || ''}
                    onChange={(e) => setDrawerFormData({ ...drawerFormData, contact_phone: e.target.value })}
                    style={{ width: '100%', marginTop: '3px', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}
                  />
                ) : (
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {activeDealDrawer.contact_phone || 'None'}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Source Origin</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {activeDealDrawer.source || 'Inbound AI'}
                </div>
              </div>
            </div>

            {/* Direct Communication Bar */}
            {activeDealDrawer.contact_phone && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <a
                  href={`https://wa.me/${activeDealDrawer.contact_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Chat</span>
                </a>

                <a
                  href={`tel:${activeDealDrawer.contact_phone}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    fontWeight: 700,
                    fontSize: '11.5px',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={13} />
                  <span>Call Prospect</span>
                </a>
              </div>
            )}

            {/* Notes Section */}
            <div style={{ flex: 1, marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Requirements &amp; Opportunity Notes
              </div>
              {isEditingDrawer ? (
                <textarea
                  rows={4}
                  value={drawerFormData.notes || ''}
                  onChange={(e) => setDrawerFormData({ ...drawerFormData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', resize: 'vertical' }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)'
                }}>
                  {activeDealDrawer.notes || 'No specific notes logged.'}
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={(e) => handleDeleteDeal(activeDealDrawer.id, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '5px',
                  border: '1px solid #fee2e2',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                {isEditingDrawer ? (
                  <>
                    <button
                      onClick={() => setIsEditingDrawer(false)}
                      style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer', fontSize: '11.5px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDrawerEdits}
                      style={{ padding: '6px 14px', borderRadius: '5px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '11.5px' }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingDrawer(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-primary)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Details</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Create New Pipeline Deal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            padding: '22px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Create Pipeline Deal
                </h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Log a new commercial opportunity into the sales pipeline
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Deal Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise AI Automation & Custom Web Portal"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Singhania"
                    value={newDeal.contact_name}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Deal Value ($) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newDeal.value}
                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newDeal.contact_phone}
                    onChange={(e) => setNewDeal({ ...newDeal, contact_phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Initial Stage
                  </label>
                  <select
                    value={newDeal.stage}
                    onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Deal Requirements &amp; Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key deliverables, timeline, or client requirements..."
                  value={newDeal.notes}
                  onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
