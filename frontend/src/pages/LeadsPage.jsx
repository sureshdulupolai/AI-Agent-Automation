import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Download, 
  Upload,
  Plus,
  MessageSquare, 
  Globe, 
  Phone, 
  Mail, 
  Filter,
  ArrowUpDown,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Send,
  Check
} from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';

// SVG Channels
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none">
    <circle cx="512" cy="512" r="512" fill="#25D366" />
    <path fill="#ffffff" d="M783.3 243.2C714 173.8 621.8 135.6 523.6 135.6c-202.4 0-367.1 164.7-367.2 367.1-.03 64.7 16.9 127.9 49 183.5L153.3 876.4l194.7-51c53.6 29.2 114 44.7 175.5 44.7h.1c202.4 0 367.1-164.7 367.2-367.1.04-98.1-38.1-190.3-107.5-259.8zM523.5 808h-.1c-54.8-.02-108.5-14.7-155.3-42.5l-11.1-6.6-115.5 30.3 30.8-112.6-7.3-11.5C234.6 616.5 218.4 560.4 218.5 502.7c.07-168.2 137-305.1 305.3-305.1 81.5.03 158.2 31.8 215.8 89.5s89.3 134.3 89.3 215.9c-.07 168.2-137 305.1-305.4 305.1zm167.4-228.5c-9.2-4.6-54.3-26.8-62.7-29.8-8.4-3.1-14.5-4.6-20.6 4.6-6.1 9.2-23.7 29.8-29.1 36-5.4 6.1-10.7 6.9-19.9 2.3-9.2-4.6-38.7-14.3-73.8-45.5-27.3-24.3-45.7-54.4-51-63.5-5.4-9.2-.6-14.1 4-18.7 4.1-4.1 9.2-10.7 13.8-16.1 4.6-5.4 6.1-9.2 9.2-15.3 3.1-6.1 1.5-11.5-.8-16.1-2.3-4.6-20.6-49.7-28.3-68.1-7.4-17.9-15-15.5-20.6-15.7-5.3-.3-11.5-.3-17.6-.3s-16.1 2.3-24.5 11.5-32.1 31.4-32.1 76.5c0 45.1 32.9 88.8 37.5 94.9 4.6 6.1 64.7 98.8 156.7 138.5 21.9 9.5 39 15.1 52.3 19.3 22 7 42 6 57.8 3.6 17.6-2.6 54.3-22.2 61.9-43.6 7.6-21.4 7.6-39.8 5.4-43.6-2.3-3.8-8.4-6.1-17.6-10.7z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 382 382" fill="#0077B5">
    <path d="M347.4 0H34.6C15.5 0 0 15.5 0 34.6v312.9C0 366.5 15.5 382 34.6 382h312.9c19.1 0 34.5-15.5 34.5-34.5V34.6C382 15.5 366.5 0 347.4 0zM118.2 329.8c0 5.6-4.5 10.1-10.1 10.1H65.3c-5.6 0-10.1-4.5-10.1-10.1V150.4c0-5.6 4.5-10.1 10.1-10.1h42.8c5.6 0 10.1 4.5 10.1 10.1v179.4zm-31.5-206.4c-22.5 0-40.7-18.2-40.7-40.7S64.3 42.1 86.7 42.1s40.7 18.2 40.7 40.7-18.2 40.6-40.7 40.6zm255.2 207.3c0 5.1-4.1 9.2-9.2 9.2h-45.9c-5.1 0-9.2-4.1-9.2-9.2v-84.2c0-12.6 3.7-55-32.8-55-28.3 0-34.1 29.1-35.2 42.1v97.1c0 5.1-4.1 9.2-9.2 9.2h-44.4c-5.1 0-9.2-4.1-9.2-9.2V149.6c0-5.1 4.1-9.2 9.2-9.2h44.4c5.1 0 9.2 4.1 9.2 9.2v15.7c10.5-15.8 26.1-27.9 59.3-27.9 73.6 0 73.1 68.7 73.1 106.5v97.6z"/>
  </svg>
);

export default function LeadsPage({ bots = [] }) {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedList, setSelectedList] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  
  // Selected contact for Slide-Over drawer
  const [selectedContact, setSelectedContact] = useState(null);
  
  // Edit mode state inside drawer
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editReq, setEditReq] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Contact Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createReq, setCreateReq] = useState('');
  const [createChannel, setCreateChannel] = useState('whatsapp');
  const [creating, setCreating] = useState(false);

  // Selected row checkboxes
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (selectedContact) {
      setEditName(selectedContact.lead_name || '');
      setEditPhone(selectedContact.lead_phone || '');
      setEditEmail(selectedContact.lead_email || '');
      setEditReq(selectedContact.lead_requirement || '');
      setIsEditing(false);
    }
  }, [selectedContact]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const res = await fetch('/api/segments');
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments || []);
      }
    } catch (err) {
      console.error('Failed to load segments:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSegments();
  }, [search]);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!createName.trim() && !createPhone.trim() && !createEmail.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_name: createName.trim(),
          lead_phone: createPhone.trim(),
          lead_email: createEmail.trim(),
          lead_requirement: createReq.trim(),
          channel: createChannel
        })
      });

      if (res.ok) {
        setCreateName('');
        setCreatePhone('');
        setCreateEmail('');
        setCreateReq('');
        setShowCreateModal(false);
        await fetchLeads();
      }
    } catch (err) {
      console.error('Error creating contact:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveContactEdit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedContact) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/leads/${selectedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_name: editName.trim(),
          lead_phone: editPhone.trim(),
          lead_email: editEmail.trim() || null,
          lead_requirement: editReq.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.lead || {
          ...selectedContact,
          lead_name: editName.trim(),
          lead_phone: editPhone.trim(),
          lead_email: editEmail.trim() || null,
          lead_requirement: editReq.trim()
        };
        setSelectedContact(updated);
        setLeads(leads.map(l => l.id === updated.id ? updated : l));
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving contact edit:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteContact = async (leadId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this contact permanently?')) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== leadId));
        if (selectedContact?.id === leadId) setSelectedContact(null);
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/leads/export/csv', '_blank');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(leads.map(l => l.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getSplitName = (fullName) => {
    if (!fullName) return { first: '-', last: '' };
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return { first: parts[0], last: '-' };
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Main Contacts Content */}
      <div style={{
        flex: 1,
        padding: '24px 32px',
        overflowY: 'auto',
        backgroundColor: '#ffffff'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Contacts
          </h1>
        </div>

        {/* Top Control Bar matching Chatzy Image 2 & HTML */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {/* Filters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            flex: 1,
            maxWidth: '850px',
            alignItems: 'flex-end'
          }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                Search <span style={{ fontSize: '11px', color: '#94a3b8' }}>(by name, email, or phone)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search contacts"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '10px' }} />
              </div>
            </div>

            {/* Select List */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                Filter by List
              </label>
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#334155'
                }}
              >
                <option value="all">Select list</option>
                {segments.map((seg) => (
                  <option key={seg.id} value={seg.id}>{seg.name}</option>
                ))}
              </select>
            </div>

            {/* Select Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                Filter by Tags
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#334155'
                }}
              >
                <option value="all">Select tags</option>
                <option value="inbound">Inbound Leads</option>
                <option value="whatsapp">WhatsApp High Priority</option>
                <option value="qualified">Qualified Opportunity</option>
              </select>
            </div>

            {/* Attributes Button */}
            <div>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Attributes
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleExportCsv}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>Import / Export CSV</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>Create</span>
            </button>
          </div>
        </div>

        {/* Contacts Data Table matching Chatzy Image 2 & HTML */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '12px 14px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Contact
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Email
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Phone
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Created at</span>
                    <ArrowUpDown size={12} color="#3b82f6" />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Updated at</span>
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Loading contacts...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} style={{ margin: '0 auto 10px auto', opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>No contacts found</p>
                    <p style={{ fontSize: '12px', margin: 0 }}>Incoming WhatsApp and Website leads will automatically populate here.</p>
                  </td>
                </tr>
              ) : (
                leads.map((l) => {
                  const isChecked = selectedRows.includes(l.id);
                  const isSelected = selectedContact?.id === l.id;
                  const isWa = l.channel === 'whatsapp';
                  const isLinkedIn = l.channel === 'linkedin';

                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedContact(l)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f0fdf4' : (isChecked ? '#f8fafc' : 'transparent'),
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleRow(l.id, e)}
                        />
                      </td>

                      {/* Contact Avatar & Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: isWa ? '#dcf8c6' : (isLinkedIn ? '#e0f2fe' : '#eef2ff'),
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {isWa ? <WhatsAppIcon /> : isLinkedIn ? <LinkedInIcon /> : <Globe size={18} color="var(--primary)" />}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                              {l.lead_name || 'Anonymous Visitor'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                              {l.channel || 'website'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px', color: l.lead_email ? '#0f172a' : '#94a3b8' }}>
                        {l.lead_email || '-'}
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '12px 16px', color: l.lead_phone ? '#0f172a' : '#94a3b8', fontWeight: l.lead_phone ? 600 : 400 }}>
                        {l.lead_phone || '-'}
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {new Date(l.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })} at {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Updated At */}
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {new Date(l.updated_at || l.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: '2-digit' })} at {new Date(l.updated_at || l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleDeleteContact(l.id, e)}
                          title="Delete Contact"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Results Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#64748b', fontSize: '12.5px' }}>
          <span>Showing 1 to {leads.length} of {leads.length} results</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER CONTACT DETAIL DRAWER (Exact Match to Chatzy Image 3 & HTML)   */}
      {/* ========================================================================= */}
      {selectedContact && (
        <div 
          className="animate-fade-in"
          style={{
            width: '380px',
            height: '100vh',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 50,
            flexShrink: 0
          }}
        >
          {/* Top Bar Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <button
              onClick={() => setSelectedContact(null)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4f46e5'
              }}
              title="Close Drawer"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isEditing ? 'var(--primary)' : '#f8fafc',
                  border: isEditing ? 'none' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isEditing ? '#ffffff' : '#64748b'
                }}
                title={isEditing ? 'Cancel Edit' : 'Edit Details'}
              >
                <Edit2 size={14} />
              </button>

              <button
                onClick={(e) => handleDeleteContact(selectedContact.id, e)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ef4444'
                }}
                title="Delete Contact"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Contact Header Card matching Chatzy Image 3 */}
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: getInitialColor(selectedContact.lead_name || 'Contact'),
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getInitialLetter(selectedContact.lead_name || 'Contact')}
              </div>

              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedContact.lead_name || 'Anonymous Visitor'}
                </h3>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              {selectedContact.channel === 'whatsapp' ? <WhatsAppIcon /> : selectedContact.channel === 'linkedin' ? <LinkedInIcon /> : <Globe size={20} color="var(--primary)" />}
            </div>
          </div>

          {/* Drawer Scrollable Body */}
          <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', fontSize: '12.5px', color: '#64748b' }}>
              <span style={{ fontWeight: 700 }}>Created at:</span>
              <span>{new Date(selectedContact.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedContact.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', fontSize: '12.5px', color: '#64748b' }}>
              <span style={{ fontWeight: 700 }}>Last interacted at:</span>
              <span>{new Date(selectedContact.updated_at || selectedContact.created_at).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedContact.updated_at || selectedContact.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

            {isEditing ? (
              <form onSubmit={handleSaveContactEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  Edit Contact Information
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number (e.g. +91 98206 46838)
                  </label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Project Scope / Requirement
                  </label>
                  <textarea
                    rows={3}
                    value={editReq}
                    onChange={(e) => setEditReq(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12.5px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12.5px', fontWeight: 700 }}
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Basic Information Section */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px 0' }}>
                  Basic Information
                </h4>

                {(() => {
                  const nameParts = getSplitName(selectedContact.lead_name);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>First Name</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{nameParts.first}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Last Name</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{nameParts.last}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Email</span>
                        <span style={{ color: '#0f172a', wordBreak: 'break-all' }}>{selectedContact.lead_email || '-'}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Phone Number</span>
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedContact.lead_phone || '-'}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Channel Identifier</span>
                        <span style={{ color: '#059669', fontWeight: 600, wordBreak: 'break-all', fontSize: '12px' }}>
                          {selectedContact.lead_phone || selectedContact.session_id || 'Direct Inbound'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Project Scope</span>
                        <span style={{ color: '#334155', lineHeight: 1.45 }}>{selectedContact.lead_requirement || '-'}</span>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

            {/* Quick Action CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => navigate('/inbox')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={15} />
                <span>Open Live Chat in Inbox</span>
              </button>

              {selectedContact.lead_phone && (
                <a
                  href={`https://wa.me/${selectedContact.lead_phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #22c55e',
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <WhatsAppIcon />
                  <span>Direct WhatsApp Message</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE NEW CONTACT MODAL                                                  */}
      {/* ========================================================================= */}
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
            width: '480px',
            maxWidth: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Create New Contact
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Kumar Prajapati"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98206 46838"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Channel Source
                </label>
                <select
                  value={createChannel}
                  onChange={(e) => setCreateChannel(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="whatsapp">WhatsApp Inbound</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="website">Website Chatbot</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Requirement / Project Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes about requested budget ($499-$2500), delivery timeline, etc."
                  value={createReq}
                  onChange={(e) => setCreateReq(e.target.value)}
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
                  disabled={creating || (!createName.trim() && !createPhone.trim())}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                >
                  {creating ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
