import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  Plus, 
  ArrowDown, 
  MoreHorizontal, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Play, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  Bot, 
  Mail, 
  Clock, 
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Inline Instagram SVG
const InstagramIcon = ({ size = 18, color = '#e11d48' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function MyJourneysPage() {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilterTab, setActiveFilterTab] = useState('All'); // 'All', 'Active', 'Inactive'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'runs'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/journeys');
      const data = await res.json();
      if (data.journeys) {
        setJourneys(data.journeys);
      }
    } catch (err) {
      console.error('Error fetching journeys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const handleToggleStatus = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/journeys/${id}/toggle-status`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setJourneys(journeys.map(j => j.id === id ? { ...j, status: data.status } : j));
        if (data.status === 'active') {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this journey?')) return;
    try {
      await fetch(`/api/journeys/${id}`, { method: 'DELETE' });
      setJourneys(journeys.filter(j => j.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      alert('Failed to delete journey');
    }
  };

  const handleSimulateRun = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/journeys/${id}/simulate-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        fetchJourneys();
        setOpenMenuId(null);
      }
    } catch (err) {
      alert('Simulation error');
    }
  };

  // Filter Journeys
  const filteredJourneys = journeys.filter(j => {
    if (activeFilterTab === 'Active') return j.status === 'active';
    if (activeFilterTab === 'Inactive') return j.status === 'inactive';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'runs') return (b.stats?.total_runs || 0) - (a.stats?.total_runs || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'instagram':
        return (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <InstagramIcon size={18} color="#e11d48" />
          </div>
        );
      case 'whatsapp':
        return (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            flexShrink: 0
          }}>
            <MessageSquare size={18} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0
          }}>
            <GitBranch size={18} />
          </div>
        );
    }
  };

  const getNodeStepIcon = (type, channel) => {
    if (channel === 'instagram' && type === 'send_message') {
      return <InstagramIcon size={13} color="#4f46e5" />;
    }
    switch (type) {
      case 'assign_agent': return <Bot size={13} color="#4f46e5" />;
      case 'wait_delay': return <Clock size={13} color="#4f46e5" />;
      case 'send_message': return <Mail size={13} color="#4f46e5" />;
      default: return <Bot size={13} color="#4f46e5" />;
    }
  };

  return (
    <div ref={menuRef} style={{ padding: '28px 36px', maxWidth: '1360px', margin: '0 auto', position: 'relative' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Journeys
        </h1>
      </div>

      {/* Filter Tabs & Right Actions matching Chatzy Image 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px', flexWrap: 'wrap', gap: '16px' }}>
        {/* Left: Filter Tabs (All, Active, Inactive) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '3px'
        }}>
          {['All', 'Active', 'Inactive'].map((tab) => {
            const isSelected = activeFilterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                style={{
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Sort + Create Journey Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowUpDown size={14} color="var(--primary)" />
              <span style={{ textTransform: 'capitalize' }}>{sortBy === 'newest' ? 'Newest' : sortBy}</span>
            </button>

            {showSortMenu && (
              <div className="animate-fade-in" style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                width: '150px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                padding: '4px',
                zIndex: 100
              }}>
                {[
                  { id: 'newest', label: 'Newest' },
                  { id: 'oldest', label: 'Oldest' },
                  { id: 'name', label: 'Name A-Z' },
                  { id: 'runs', label: 'Most Runs' }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setSortBy(opt.id);
                      setShowSortMenu(false);
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: sortBy === opt.id ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                      color: sortBy === opt.id ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: sortBy === opt.id ? 700 : 500
                    }}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.id && <Check size={13} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* + Create Journey Button */}
          <button
            onClick={() => navigate('/journeys/templates')}
            style={{
              backgroundColor: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Create Journey</span>
          </button>
        </div>
      </div>

      {/* Journeys Visual Flow Cards Grid (3-column) matching Chatzy Image 1 */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ fontSize: '13px' }}>Loading automation journeys...</p>
        </div>
      ) : filteredJourneys.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <GitBranch size={42} color="var(--primary)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '17px', color: 'var(--text-primary)', marginBottom: '6px' }}>No {activeFilterTab !== 'All' ? activeFilterTab : ''} Journeys Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Build your first automated conversational journey using pre-made templates.
          </p>
          <button onClick={() => navigate('/journeys/templates')} className="btn-primary" style={{ padding: '8px 18px' }}>
            <Plus size={14} /> Browse Templates
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '22px'
        }}>
          {filteredJourneys.map((j) => {
            const isActive = j.status === 'active';
            const nodes = j.nodes || [];
            const displayNodes = nodes.slice(0, 2);
            const remainingSteps = nodes.length > 2 ? nodes.length - 2 : 0;
            const isMenuOpen = openMenuId === j.id;

            return (
              <div
                key={j.id}
                onClick={() => navigate(`/journeys/${j.id}?tab=runs`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border-subtle)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.4)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* 1. Card Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      {getChannelIcon(j.channel)}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {j.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>{j.channel_label || (j.channel === 'instagram' ? 'Instagram' : 'WhatsApp')}</span>
                          <span>•</span>
                          <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {j.channel === 'instagram' ? '@apex_agency_official' : '+91 98206 46838'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* 3-Dot More Menu */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : j.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {isMenuOpen && (
                        <div className="animate-fade-in" style={{
                          position: 'absolute',
                          top: '30px',
                          right: 0,
                          width: '180px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                          padding: '6px',
                          zIndex: 100
                        }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/journeys/journey-studio/${j.id}`);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Edit3 size={14} color="var(--primary)" />
                            <span>Edit in Studio</span>
                          </div>

                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/journeys/${j.id}?tab=runs`);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              color: 'var(--text-primary)',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <ExternalLink size={14} color="var(--text-secondary)" />
                            <span>View Runs &amp; Stats</span>
                          </div>

                          <div
                            onClick={(e) => handleSimulateRun(e, j.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              color: 'var(--primary)',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Play size={14} />
                            <span>Simulate Run</span>
                          </div>

                          <div
                            onClick={(e) => handleDelete(e, j.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              color: '#ef4444',
                              cursor: 'pointer',
                              borderTop: '1px solid var(--border-subtle)',
                              marginTop: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.06)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={14} />
                            <span>Delete Journey</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Mini Flowchart Preview Box matching Chatzy Image 1 */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 14px',
                    marginBottom: '16px'
                  }}>
                    {/* Trigger Top Pill */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 10px',
                      marginBottom: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9.5px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                          <span>TRIGGER</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {j.channel === 'instagram' ? '@apex_agency_official' : '+91 98206 46838'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {j.channel === 'instagram' ? <InstagramIcon size={13} color="#e11d48" /> : <MessageSquare size={13} color="#10b981" />}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {j.trigger?.label || 'Conversation'}
                        </span>
                      </div>
                    </div>

                    {/* Step Nodes Stack with Connecting Arrow Lines */}
                    {displayNodes.map((n, idx) => (
                      <React.Fragment key={n.id || idx}>
                        {/* Down Arrow Connector */}
                        <div style={{ display: 'flex', justifyContent: 'center', height: '14px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1 }}>↓</span>
                        </div>

                        {/* Step Card Box */}
                        <div style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          padding: '7px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          {getNodeStepIcon(n.type, j.channel)}
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {n.title}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Remaining Steps Badge if >2 steps */}
                    {remainingSteps > 0 && (
                      <div style={{
                        marginTop: '8px',
                        padding: '4px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-muted)'
                      }}>
                        +{remainingSteps} more step{remainingSteps > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Card Footer with Status Switch & Version Timestamp matching Chatzy Image 1 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px'
                }}>
                  {/* Status Toggle */}
                  <div 
                    onClick={(e) => handleToggleStatus(e, j.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <div style={{
                      width: '32px',
                      height: '18px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                      position: 'relative',
                      padding: '2px',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        transform: isActive ? 'translateX(14px)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>

                    <span style={{ fontWeight: 700, color: isActive ? '#059669' : '#64748b', fontSize: '12px' }}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Version & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    <span style={{ fontWeight: 700, backgroundColor: 'var(--bg-subtle)', padding: '1px 5px', borderRadius: '4px' }}>
                      {j.version || 'v1'}
                    </span>
                    <span>{j.formatted_date || '30 Aug \'26 at 7:37 PM'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
