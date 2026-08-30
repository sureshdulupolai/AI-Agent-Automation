import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Sliders,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MyJourneysPage() {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
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
    } catch (err) {
      alert('Failed to delete journey');
    }
  };

  const filteredJourneys = journeys.filter(j => 
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    (j.trigger?.label && j.trigger.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px 36px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <GitBranch size={19} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My Journeys
            </h1>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage, monitor, and configure your live conversational workflow automations.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/journeys/templates')}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          <Plus size={15} />
          <span>New Journey</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        maxWidth: '400px'
      }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search journeys..."
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            padding: '8px 12px 8px 36px',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Journeys List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ fontSize: '13px' }}>Loading your journeys...</p>
        </div>
      ) : filteredJourneys.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <GitBranch size={36} color="var(--primary)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>No Journeys Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Get started by selecting an automated journey template.
          </p>
          <button onClick={() => navigate('/journeys/templates')} className="btn-primary" style={{ padding: '8px 16px' }}>
            <Plus size={14} /> Browse Templates
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredJourneys.map((j) => {
            const isActive = j.status === 'active';
            return (
              <div
                key={j.id}
                onClick={() => navigate(`/journeys/journey-studio/${j.id}`)}
                className="glass-panel glass-panel-hover animate-fade-in"
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Status Toggle Switch */}
                  <div 
                    onClick={(e) => handleToggleStatus(e, j.id)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: '2px',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}
                    title={isActive ? 'Active (Click to pause)' : 'Inactive (Click to activate)'}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      transform: isActive ? 'translateX(16px)' : 'translateX(0)',
                      transition: 'transform 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {j.name}
                      </h3>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: isActive ? '#059669' : '#64748b',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Trigger: {j.trigger?.label || 'Conversation'}</span>
                      <span>•</span>
                      <span>{j.nodes?.length || 0} step(s)</span>
                      <span>•</span>
                      <span>{j.execution_count || 0} runs</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/journeys/journey-studio/${j.id}`);
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12.5px' }}
                  >
                    <Edit3 size={13} />
                    <span>Edit Studio</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, j.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete journey"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
