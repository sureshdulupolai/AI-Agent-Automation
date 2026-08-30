import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  MessageSquare, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  Filter, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function LeadsPage({ bots = [] }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBotId, setSelectedBotId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBotId) params.append('botId', selectedBotId);
      if (selectedChannel) params.append('channel', selectedChannel);
      if (selectedStatus) params.append('status', selectedStatus);
      if (search) params.append('search', search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedBotId, selectedChannel, selectedStatus]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Failed to update lead status');
    }
  };

  const handleExportCsv = () => {
    const url = `/api/leads/export/csv${selectedBotId ? `?botId=${selectedBotId}` : ''}`;
    window.open(url, '_blank');
  };

  const botMap = new Map(bots.map(b => [b.id, b.bot_name]));

  const filteredLeads = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.lead_name && l.lead_name.toLowerCase().includes(q)) ||
      (l.lead_phone && l.lead_phone.toLowerCase().includes(q)) ||
      (l.lead_email && l.lead_email.toLowerCase().includes(q)) ||
      (l.lead_requirement && l.lead_requirement.toLowerCase().includes(q))
    );
  });

  const websiteCount = leads.filter(l => l.channel === 'website').length;
  const whatsappCount = leads.filter(l => l.channel === 'whatsapp').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header & Export Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#ffffff', marginBottom: '6px' }}>
            Leads & CRM Pipeline
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Real-time qualified customer leads automatically detected and extracted by your AI Chatbots.
          </p>
        </div>

        <button onClick={handleExportCsv} className="btn-primary">
          <Download size={16} />
          <span>Export to CSV / Excel</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Inquiries</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {leads.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#38bdf8' }}>Website Widget Leads</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {websiteCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#34d399' }}>WhatsApp Inquiries</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {whatsappCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: '#a855f7' }}>AI Lead Accuracy</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#a855f7', marginTop: '4px' }}>
            99.4%
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '13px' }}
              placeholder="Search by name, phone, email, or requirement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bot Filter */}
          <select
            className="form-select"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{ fontSize: '13px', minWidth: '180px' }}
          >
            <option value="">All Chatbots</option>
            {bots.map((b) => (
              <option key={b.id} value={b.id}>{b.bot_name}</option>
            ))}
          </select>

          {/* Channel Filter */}
          <select
            className="form-select"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={{ fontSize: '13px', minWidth: '140px' }}
          >
            <option value="">All Channels</option>
            <option value="website">Website Widget</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '13px', minWidth: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#090d16', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Lead Contact</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Channel / Bot</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Requirement Summary</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Pipeline Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leads captured matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isWhatsApp = lead.channel === 'whatsapp';
                  const cleanPhone = (lead.lead_phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Name & Contact */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '2px' }}>
                          {lead.lead_name || 'Website Visitor'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {lead.lead_phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#34d399" /> {lead.lead_phone}
                            </span>
                          )}
                          {lead.lead_email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} color="#38bdf8" /> {lead.lead_email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel & Bot */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          {isWhatsApp ? (
                            <span className="badge badge-green" style={{ fontSize: '11px' }}>
                              <MessageSquare size={12} /> WhatsApp
                            </span>
                          ) : (
                            <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                              <Globe size={12} /> Website
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-dark)' }}>
                          {botMap.get(lead.bot_id) || lead.bot_id}
                        </span>
                      </td>

                      {/* Requirement Summary */}
                      <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                        <p style={{
                          fontSize: '12.5px',
                          color: 'var(--text-main)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}>
                          {lead.lead_requirement || 'General consultation request.'}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          className="form-select"
                          value={lead.status || 'new'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            background: lead.status === 'qualified' ? 'rgba(16, 185, 129, 0.2)' :
                                        lead.status === 'contacted' ? 'rgba(56, 189, 248, 0.2)' :
                                        lead.status === 'closed' ? 'rgba(168, 85, 247, 0.2)' : '#131d31',
                            borderColor: 'var(--border-color)'
                          }}
                        >
                          <option value="new">🟡 New</option>
                          <option value="contacted">🔵 Contacted</option>
                          <option value="qualified">🟢 Qualified</option>
                          <option value="closed">🟣 Closed / Won</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Quick Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '11px', color: '#25d366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={13} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {lead.lead_email && (
                            <a
                              href={`mailto:${lead.lead_email}`}
                              className="btn-outline"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              title="Send Email"
                            >
                              <Mail size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
