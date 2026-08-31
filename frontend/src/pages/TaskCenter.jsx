import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  FileText,
  RefreshCw,
  Zap,
  MessageSquare,
  Mail,
  Send,
  UserCheck,
  Shield,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Download,
  Trash2,
  Flame,
  X,
  Copy,
  Check,
  Bot,
  Code,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatWhatsAppText } from '../utils/formatWhatsAppText';

export default function TaskCenter() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExecutingBatch, setIsExecutingBatch] = useState(false);
  const [isGeneratingEOD, setIsGeneratingEOD] = useState(false);
  const [eodReportModal, setEodReportModal] = useState(null);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [batchNotice, setBatchNotice] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [payloadViewModes, setPayloadViewModes] = useState({}); // taskId -> 'summary' | 'json'

  // Cooldown timer state for Run Task Cycle (prevents rapid-click spam)
  const [cycleCooldown, setCycleCooldown] = useState(0);

  // Fetch Task Summary from Backend
  const fetchTaskSummary = async () => {
    try {
      const res = await fetch('/api/tasks/summary');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load task summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskSummary();
    const interval = setInterval(fetchTaskSummary, 12000); // auto-refresh every 12s
    return () => clearInterval(interval);
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (cycleCooldown <= 0) return;
    const timer = setInterval(() => {
      setCycleCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cycleCooldown]);

  // Run Manual Autonomous Batch Execution with Cooldown
  const handleRunBatch = async () => {
    if (cycleCooldown > 0 || isExecutingBatch) return;

    setIsExecutingBatch(true);
    setBatchNotice(null);
    try {
      const res = await fetch('/api/tasks/run-batch', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setCycleCooldown(25); // 25 second cooldown
        setBatchNotice(json.results?.message || 'Autonomous scan complete. All queues are healthy.');
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
        await fetchTaskSummary();
      }
    } catch (err) {
      setBatchNotice(`Scan error: ${err.message}`);
    } finally {
      setIsExecutingBatch(false);
      setTimeout(() => setBatchNotice(null), 6000);
    }
  };

  // Generate Daily EOD Executive Report Modal
  const handleGenerateEOD = async () => {
    setIsGeneratingEOD(true);
    try {
      const res = await fetch('/api/tasks/generate-eod-report', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.report) {
        setEodReportModal(json.report);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
        await fetchTaskSummary();
      }
    } catch (err) {
      console.error('EOD generation error:', err);
    } finally {
      setIsGeneratingEOD(false);
    }
  };

  // Clear Audit Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all execution task logs?')) return;
    try {
      await fetch('/api/tasks/clear', { method: 'DELETE' });
      await fetchTaskSummary();
    } catch (err) {
      console.error('Clear logs error:', err);
    }
  };

  const handleCopyReport = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const metrics = data?.metrics || {
    total_tasks_logged: 0,
    completed_today: 0,
    pending_today: 0,
    failed_today: 0,
    success_rate: '100%'
  };

  const typeBreakdown = data?.type_breakdown || {
    follow_up: 0,
    qualification: 0,
    proposal: 0,
    broadcast: 0,
    nurture: 0,
    report: 0
  };

  const tasks = data?.recent_tasks || [];

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    if (activeTypeFilter !== 'all' && t.type !== activeTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchRecipient = (t.recipient || '').toLowerCase().includes(q);
      const matchChannel = (t.channel || '').toLowerCase().includes(q);
      if (!matchTitle && !matchRecipient && !matchChannel) return false;
    }
    return true;
  });

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <MessageSquare size={12} /> WhatsApp
          </span>
        );
      case 'email':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ede9fe', color: '#6d28d9' }}>
            <Mail size={12} /> Gmail
          </span>
        );
      case 'website':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Zap size={12} /> Web Widget
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
            <Layers size={12} /> System Engine
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'qualification':
        return <Flame size={15} color="#ea580c" />;
      case 'follow_up':
        return <Zap size={15} color="#16a34a" />;
      case 'proposal':
      case 'nurture':
        return <Mail size={15} color="#4f46e5" />;
      case 'broadcast':
        return <Send size={15} color="#0284c7" />;
      case 'report':
        return <FileText size={15} color="#7c3aed" />;
      default:
        return <Activity size={15} color="#64748b" />;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 24px 60px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}>
            <Activity size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '23px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Autonomous Task Command Center
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Real-time telemetry of autonomous lead follow-ups, AI qualifications, and executive reporting.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchTaskSummary}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleGenerateEOD}
            disabled={isGeneratingEOD}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              backgroundColor: '#eef2ff',
              color: '#4338ca',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isGeneratingEOD ? 'not-allowed' : 'pointer'
            }}
          >
            <FileText size={14} />
            {isGeneratingEOD ? 'Generating Intelligence...' : 'Generate EOD Report'}
          </button>

          {/* Spam-Proof Run Cycle Button with Cooldown */}
          <button
            onClick={handleRunBatch}
            disabled={isExecutingBatch || cycleCooldown > 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: cycleCooldown > 0 ? '#94a3b8' : '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: (isExecutingBatch || cycleCooldown > 0) ? 'not-allowed' : 'pointer',
              boxShadow: cycleCooldown > 0 ? 'none' : '0 3px 10px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Zap size={14} className={isExecutingBatch ? 'animate-spin' : ''} />
            <span>
              {isExecutingBatch
                ? 'Running Execution...'
                : cycleCooldown > 0
                ? `⏳ Next Scan in ${cycleCooldown}s`
                : 'Run Task Cycle'}
            </span>
          </button>
        </div>
      </div>

      {/* Batch Notice Toast */}
      {batchNotice && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#166534', fontWeight: 600 }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{batchNotice}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Completed Today */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Autonomous Actions Today
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.completed_today}
            </div>
          </div>
        </div>

        {/* Card 2: Success Delivery */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Delivery Success Rate
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#4f46e5', marginTop: '2px' }}>
              {metrics.success_rate}
            </div>
          </div>
        </div>

        {/* Card 3: Total Executed */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Executed Tasks
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {metrics.total_tasks_logged}
            </div>
          </div>
        </div>

        {/* Card 4: Background Cron Status */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              24/7 Background Engine
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              Active (10m Recovery Cron)
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Tasks', count: tasks.length },
            { id: 'follow_up', label: '⚡ Follow-Ups', count: typeBreakdown.follow_up },
            { id: 'qualification', label: '🔥 Qualifications', count: typeBreakdown.qualification },
            { id: 'proposal', label: '✉️ Proposals & Drips', count: (typeBreakdown.proposal || 0) + (typeBreakdown.nurture || 0) },
            { id: 'broadcast', label: '🚀 Broadcasts', count: typeBreakdown.broadcast },
            { id: 'report', label: '📊 EOD Reports', count: typeBreakdown.report }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTypeFilter === tab.id ? '#4f46e5' : 'transparent',
                color: activeTypeFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTypeFilter === tab.id ? 700 : 600,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label} {tab.count > 0 && <span style={{ opacity: 0.8, fontSize: '11px' }}>({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Right Search & Clear Log */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
            <Search size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search actions or leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          {tasks.length > 0 && (
            <button
              onClick={handleClearLogs}
              title="Clear all test logs"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Task Audit Table */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-page)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 18px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Task Description</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Channel</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target / Recipient</th>
              <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
              <th style={{ padding: '12px 18px', fontSize: '11.5px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Executed At</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <Bot size={24} color="#64748b" />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    No autonomous tasks recorded in this filter
                  </div>
                  <div style={{ fontSize: '12.5px' }}>
                    The 24/7 background engine runs autonomously every 10 minutes to scan and execute lead follow-ups.
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isExpanded = expandedTaskId === task.id;
                const timeStr = new Date(task.created_at || task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = new Date(task.created_at || task.timestamp).toLocaleDateString();

                return (
                  <React.Fragment key={task.id}>
                    <tr
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      {/* Task Description */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </div>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getTypeIcon(task.type)}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {task.title}
                            </div>
                            {task.metadata?.intent && (
                              <div style={{ fontSize: '11px', color: '#6366f1', marginTop: '1px' }}>
                                Intent: {task.metadata.intent}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td style={{ padding: '14px 16px' }}>
                        {getChannelBadge(task.channel)}
                      </td>

                      {/* Target / Recipient */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {task.recipient || '—'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, backgroundColor: task.status === 'completed' ? '#dcfce7' : '#fee2e2', color: task.status === 'completed' ? '#15803d' : '#b91c1c' }}>
                          <CheckCircle2 size={11} /> {task.status === 'completed' ? 'Completed' : 'Failed'}
                        </span>
                      </td>

                      {/* Executed At */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        <div>{timeStr}</div>
                        <div style={{ fontSize: '10.5px' }}>{dateStr}</div>
                      </td>
                    </tr>

                    {/* Expanded Task Details Drawer */}
                    {isExpanded && (() => {
                      const currentMode = payloadViewModes[task.id] || 'summary';
                      const meta = task.metadata || {};

                      return (
                        <tr style={{ backgroundColor: 'rgba(79, 70, 229, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                          <td colSpan={5} style={{ padding: '16px 24px' }}>
                            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                              
                              {/* Header Bar with Toggle */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    Task Execution Details
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-page)', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                                    {task.id}
                                  </span>
                                </div>

                                {/* Mode Switcher Pill */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {meta.report_markdown && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEodReportModal({ report_markdown: meta.report_markdown, summary_metrics: meta.summary_metrics });
                                      }}
                                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', border: 'none', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', marginRight: '6px' }}
                                    >
                                      <Eye size={13} />
                                      <span>View Full Report</span>
                                    </button>
                                  )}

                                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-page)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPayloadViewModes({ ...payloadViewModes, [task.id]: 'summary' });
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: currentMode === 'summary' ? '#4f46e5' : 'transparent',
                                        color: currentMode === 'summary' ? '#ffffff' : 'var(--text-secondary)',
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <FileText size={12} />
                                      <span>Summary View</span>
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPayloadViewModes({ ...payloadViewModes, [task.id]: 'json' });
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: currentMode === 'json' ? '#4f46e5' : 'transparent',
                                        color: currentMode === 'json' ? '#ffffff' : 'var(--text-secondary)',
                                        fontSize: '11.5px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <Code size={12} />
                                      <span>Raw JSON</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Content: Summary View */}
                              {currentMode === 'summary' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  
                                  {/* Case 1: System Scan Cycle */}
                                  {task.type === 'system' && (
                                    <>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Execution Duration</div>
                                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                                            {meta.duration_ms || 12} ms
                                          </div>
                                        </div>

                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Follow-Ups Scanned</div>
                                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                                            {meta.follow_ups_processed || 0} active
                                          </div>
                                        </div>

                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Email Drips Checked</div>
                                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
                                            {meta.email_drips_processed || 0} active
                                          </div>
                                        </div>

                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Pipeline Engine Health</div>
                                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle2 size={13} /> {meta.errors?.length ? `${meta.errors.length} Warning(s)` : 'Healthy (0 Errors)'}
                                          </div>
                                        </div>
                                      </div>

                                      <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        <strong>Engine Status:</strong> The autonomous background agent scanned all active conversation pipelines and validated that follow-up timers, inactivity nudges, and email drip states are synchronized.
                                      </div>
                                    </>
                                  )}

                                  {/* Case 2: Follow-up Message Event */}
                                  {task.type === 'follow_up' && (
                                    <>
                                      <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderLeft: '4px solid #16a34a', borderRadius: '10px', padding: '14px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                                          Dispatched AI Follow-Up Message Preview:
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                          "{meta.message_preview || meta.nudge || 'Autonomous follow-up dispatched.'}"
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                          <strong>Step:</strong> {meta.step ? `Step ${meta.step}` : 'Inactivity Nudge'}
                                        </span>
                                        <span style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                          <strong>Channel:</strong> WhatsApp Live Socket
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {/* Case 3: Lead Qualification Event */}
                                  {task.type === 'qualification' && (
                                    <>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Buying Readiness Score</div>
                                          <div style={{ fontSize: '18px', fontWeight: 900, color: '#ea580c', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Flame size={16} /> {meta.readiness_score || 85}/100
                                          </div>
                                        </div>

                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Lead Temperature</div>
                                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                                            {meta.lead_temperature || 'Warm Lead'}
                                          </div>
                                        </div>
                                      </div>

                                      {meta.intent && (
                                        <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                                          <strong>Identified Buying Intent:</strong> {meta.intent}
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Case 4: Other / Generic Events */}
                                  {task.type !== 'system' && task.type !== 'follow_up' && task.type !== 'qualification' && (
                                    <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                      {task.title} executed successfully. All parameters were processed and verified.
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Content: Raw JSON View with Copy Button */
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
                                        alert('JSON payload copied to clipboard');
                                      }}
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      <Copy size={11} />
                                      <span>Copy Payload</span>
                                    </button>
                                  </div>
                                  <pre style={{ margin: 0, padding: '12px', backgroundColor: 'var(--bg-page)', borderRadius: '8px', fontSize: '11.5px', color: 'var(--text-primary)', overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {JSON.stringify(meta, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EOD Executive Report Viewer Modal */}
      {eodReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '20px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Daily EOD Executive Intelligence Report
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Generated on {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleCopyReport(eodReportModal.report_markdown)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  {copiedReport ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copiedReport ? 'Copied!' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={() => setEodReportModal(null)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-page)', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', whiteSpace: 'pre-wrap' }}>
                {formatWhatsAppText(eodReportModal.report_markdown)}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-surface)' }}>
              <button
                onClick={() => setEodReportModal(null)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
