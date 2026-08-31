import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Play, 
  GitBranch, 
  MessageSquare, 
  Mail, 
  Bot, 
  ChevronRight, 
  X, 
  Check, 
  Sparkles,
  ArrowUpDown,
  BarChart2,
  TrendingUp,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Inline Instagram SVG
const InstagramIcon = ({ size = 16, color = '#e11d48' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function JourneyDetailsPage() {
  const { journeyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = searchParams.get('tab') || 'runs'; // 'runs' or 'stats'

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRun, setSelectedRun] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/journeys/${journeyId}`);
      if (res.ok) {
        const data = await res.json();
        setJourney(data.journey);
      }
    } catch (err) {
      console.error('Failed to load journey details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, [journeyId]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleSimulateRun = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/journeys/${journeyId}/simulate-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        fetchJourney();
      }
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const runs = journey?.runs || [];
  const stats = journey?.stats || { total_runs: 0, completed: 0, sent: 0, delivered: 0, read: 0, failed: 0, outcomes: { completed: 0, in_progress: 0, dropped_off: 0, failed: 0 } };

  const filteredRuns = runs.filter(r => 
    r.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.contact_handle && r.contact_handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.last_step && r.last_step.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completionRate = stats.total_runs > 0 ? Math.round((stats.completed / stats.total_runs) * 100) : 0;

  return (
    <div style={{ padding: '24px 36px', maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
      {/* Breadcrumb Navigation matching Chatzy Image 2 & 3 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        <button
          onClick={() => navigate('/journeys')}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          Journeys
        </button>
        <span>&gt;</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Journey Runs ({journey?.name || 'Loading...'})
        </span>
      </div>

      {/* Main Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Journey Runs ({journey?.name || '...'})
        </h1>
      </div>

      {/* Tab Switcher matching Chatzy Image 2 & 3 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => handleTabChange('runs')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '10px 4px 12px 4px',
            fontSize: '14px',
            fontWeight: currentTab === 'runs' ? 800 : 600,
            color: currentTab === 'runs' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <span>Runs</span>
          {currentTab === 'runs' && (
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: 0,
              right: 0,
              height: '2.5px',
              backgroundColor: 'var(--primary)',
              borderRadius: '2px'
            }} />
          )}
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '10px 4px 12px 4px',
            fontSize: '14px',
            fontWeight: currentTab === 'stats' ? 800 : 600,
            color: currentTab === 'stats' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <span>Stats</span>
          {currentTab === 'stats' && (
            <div style={{
              position: 'absolute',
              bottom: '-1px',
              left: 0,
              right: 0,
              height: '2.5px',
              backgroundColor: 'var(--primary)',
              borderRadius: '2px'
            }} />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RUNS VIEW matching Chatzy Image 2 */}
      {/* ========================================================================= */}
      {currentTab === 'runs' && (
        <div>
          {/* Top Search & Actions Bar matching Chatzy Image 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              flex: 1,
              maxWidth: '440px',
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '11px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Contacts (by name, email, or phone number)"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '9px 36px 9px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Simulate Test Run Button */}
              <button
                onClick={handleSimulateRun}
                disabled={simulating}
                style={{
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  border: '1px solid rgba(79, 70, 229, 0.25)',
                  color: 'var(--primary)',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Play size={13} />
                <span>{simulating ? 'Simulating...' : 'Simulate Test Run'}</span>
              </button>

              {/* ↗ Studio Button matching Chatzy Image 2 */}
              <button
                onClick={() => navigate(`/journeys/journey-studio/${journeyId}`)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--primary)',
                  color: 'var(--primary)',
                  padding: '7px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(79, 70, 229, 0.1)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ExternalLink size={14} />
                <span>Studio</span>
              </button>
            </div>
          </div>

          {/* Runs Data Table matching Chatzy Image 2 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            {/* Table Header Row matching Chatzy Image 2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 2fr 1fr 1.5fr 1.5fr',
              padding: '12px 20px',
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '12.5px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              <div>Contact</div>
              <div>State</div>
              <div>Last Step</div>
              <div>Version</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Created at</span>
                <ArrowUpDown size={12} color="var(--primary)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Updated at</span>
                <ArrowUpDown size={12} color="var(--primary)" />
              </div>
            </div>

            {/* Table Body Rows */}
            {filteredRuns.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '13.5px', margin: 0 }}>No runs found</p>
                <p style={{ fontSize: '12px', marginTop: '6px' }}>Click "Simulate Test Run" above to generate live execution logs.</p>
              </div>
            ) : (
              <div>
                {filteredRuns.map((r) => {
                  const isCompleted = r.state === 'completed';
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRun(r)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.2fr 2fr 1fr 1.5fr 1.5fr',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Contact */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '11px'
                        }}>
                          {r.contact_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.contact_name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{r.contact_handle}</div>
                        </div>
                      </div>

                      {/* State */}
                      <div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: isCompleted ? '#059669' : '#2563eb',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'capitalize'
                        }}>
                          {r.state}
                        </span>
                      </div>

                      {/* Last Step */}
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.last_step}
                      </div>

                      {/* Version */}
                      <div>
                        <span style={{ fontWeight: 700, backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px' }}>
                          {r.version}
                        </span>
                      </div>

                      {/* Created at */}
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.created_at}
                      </div>

                      {/* Updated at */}
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.updated_at}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STATS VIEW matching Chatzy Image 3 */}
      {/* ========================================================================= */}
      {currentTab === 'stats' && (
        <div className="animate-fade-in">
          {/* Header Title Bar matching Chatzy Image 3 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <GitBranch size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Journey Statistics
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Runs and WhatsApp delivery for this journey
                </p>
              </div>
            </div>

            <button
              onClick={fetchJourney}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
              title="Refresh statistics"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* 4 Core Metrics Grid matching Chatzy Image 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr 3fr',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* 1. Total Runs Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                <GitBranch size={15} color="var(--primary)" />
                <span>Total Runs</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.total_runs}
              </div>
            </div>

            {/* 2. Completed Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                <CheckCircle2 size={15} color="var(--primary)" />
                <span>Completed</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {stats.total_runs > 0 ? `${completionRate}% completion rate` : 'No runs yet'}
              </div>
            </div>

            {/* 3. Sent / Delivered / Read / Failed Funnel Cards Grid matching Chatzy Image 3 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {/* Sent */}
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span>✓</span> <span>Sent</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {stats.sent}
                </div>
              </div>

              {/* Delivered */}
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span>✓✓</span> <span>Delivered</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {stats.delivered}
                </div>
              </div>

              {/* Read */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.06)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span>✓✓</span> <span>Read</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669' }}>
                  {stats.read}
                </div>
              </div>

              {/* Failed */}
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span>⚠️</span> <span>Failed</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626' }}>
                  {stats.failed}
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Analytics Breakdown matching Chatzy Image 3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Left Card: Run Outcomes */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Run Outcomes
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '20px' }}>
                  Share of every run in this journey
                </p>

                {stats.total_runs === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto'
                    }}>
                      <Mail size={18} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>No runs yet</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>Runs show up here once contacts enter this journey.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Completed Progress */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Completed</span>
                        <span style={{ fontWeight: 700, color: '#059669' }}>{stats.completed} ({completionRate}%)</span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* In Progress */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>In Progress</span>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>{stats.outcomes?.in_progress || 0}</span>
                      </div>
                      <div style={{ height: '7px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${stats.total_runs > 0 ? (stats.outcomes?.in_progress / stats.total_runs) * 100 : 0}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                Metrics refreshed live from event triggers.
              </div>
            </div>

            {/* Right Card: WhatsApp Template Messages matching Chatzy Image 3 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              minHeight: '260px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    WhatsApp Template Messages
                  </h4>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <MessageSquare size={14} />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, marginBottom: '20px' }}>
                  Delivery funnel over time
                </p>

                {stats.total_runs === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto'
                    }}>
                      <Mail size={18} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>No template messages yet</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>WhatsApp template sends from this journey will show up here.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Step-by-step conversion funnel */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '12.5px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1. Trigger Inbound</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{stats.total_runs} events</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '12.5px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>2. Automated Followup Sent</span>
                      <span style={{ fontWeight: 700, color: '#0891b2' }}>{stats.sent} messages</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', fontSize: '12.5px' }}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>3. Customer Read &amp; Conversion</span>
                      <span style={{ fontWeight: 800, color: '#059669' }}>{stats.read} ({stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : 0}%)</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                Channel: {journey?.channel_label || 'WhatsApp'} Automation Flow
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Contact Execution Trace Logs Drawer */}
      {selectedRun && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 25px rgba(0,0,0,0.15)',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Execution Trace
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Run ID: {selectedRun.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRun(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contact Card in Drawer */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {selectedRun.contact_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{selectedRun.contact_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedRun.contact_handle}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', marginTop: '6px' }}>
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                  {selectedRun.state}
                </span>
                <span style={{ backgroundColor: '#ffffff', color: 'var(--text-secondary)', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  Version: {selectedRun.version}
                </span>
              </div>
            </div>

            {/* Step-by-Step Execution Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Step Log Timeline
              </h4>

              {selectedRun.logs && selectedRun.logs.map((l, lIdx) => (
                <div key={lIdx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {l.step}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {l.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setSelectedRun(null)}
              className="btn-primary"
              style={{ width: '100%', padding: '9px 0', fontSize: '13px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
