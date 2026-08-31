import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Filter,
  ArrowUpDown,
  ListFilter
} from 'lucide-react';

export default function ListsSegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentType, setNewSegmentType] = useState('list');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/segments');
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments || []);
      }
    } catch (err) {
      console.error('Failed to load segments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCreateSegment = async (e) => {
    e.preventDefault();
    if (!newSegmentName.trim() || creating) return;

    try {
      setCreating(true);
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSegmentName.trim(),
          type: newSegmentType,
          description: newSegmentDesc.trim()
        })
      });

      if (res.ok) {
        setNewSegmentName('');
        setNewSegmentDesc('');
        setShowCreateModal(false);
        await fetchSegments();
      }
    } catch (err) {
      console.error('Error creating segment:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (!window.confirm('Are you sure you want to delete this list/segment?')) return;
    try {
      const res = await fetch(`/api/segments/${segmentId}`, { method: 'DELETE' });
      if (res.ok) {
        setSegments(segments.filter(s => s.id !== segmentId));
      }
    } catch (err) {
      console.error('Failed to delete segment:', err);
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header matching Chatzy Image 4 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Lists &amp; Segments
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Organize contacts by source, customer journey status, or marketing campaigns.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px'
          }}
        >
          <Plus size={16} />
          <span>Create</span>
        </button>
      </div>

      {/* Table Card matching Chatzy Image 4 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Name
              </th>
              <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Type
              </th>
              <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Description
              </th>
              <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Members
              </th>
              <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Created at</span>
                  <ArrowUpDown size={12} color="#3b82f6" />
                </div>
              </th>
              <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Updated at</span>
                  <ArrowUpDown size={12} color="#94a3b8" />
                </div>
              </th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  Loading lists &amp; segments...
                </td>
              </tr>
            ) : segments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                  <Layers size={36} style={{ margin: '0 auto 10px auto', opacity: 0.3 }} />
                  <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>No lists or segments created yet</p>
                  <p style={{ fontSize: '12px', margin: 0 }}>Click "+ Create" to segment your leads and contacts.</p>
                </td>
              </tr>
            ) : (
              segments.map((seg) => (
                <tr 
                  key={seg.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s'
                  }}
                  className="hover-row"
                >
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>
                    {seg.name}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      backgroundColor: seg.type === 'segment' ? '#eef2ff' : '#f1f5f9',
                      color: seg.type === 'segment' ? '#4f46e5' : '#475569',
                      textTransform: 'lowercase'
                    }}>
                      {seg.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {seg.description || '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                    {seg.members_count || 0}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                    {new Date(seg.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })} at {new Date(seg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                    {new Date(seg.updated_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })} at {new Date(seg.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      title="Delete"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '460px',
            maxWidth: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Create New List or Segment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSegment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Value SaaS Leads"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Type
                </label>
                <select
                  value={newSegmentType}
                  onChange={(e) => setNewSegmentType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="list">Static List</option>
                  <option value="segment">Dynamic Filter Segment</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief notes about which contacts belong here..."
                  value={newSegmentDesc}
                  onChange={(e) => setNewSegmentDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newSegmentName.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                >
                  {creating ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
