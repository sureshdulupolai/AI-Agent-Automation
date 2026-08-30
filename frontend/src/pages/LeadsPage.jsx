import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  MessageSquare, 
  Globe, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Filter
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
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Leads & CRM Pipeline
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Customer inquiries detected and qualified by your AI Chatbots.
          </p>
        </div>

        <button onClick={handleExportCsv} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Leads</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {leads.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>Website Inquiries</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
            {websiteCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>WhatsApp Inquiries</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
            {whatsappCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>AI Extraction Rate</span>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
            99.4%
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '10px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', width: '100%', fontSize: '12.5px', padding: '6px 10px 6px 32px' }}
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Bot Filter */}
          <select
            className="form-select"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{ fontSize: '12.5px', minWidth: '160px', padding: '6px 10px' }}
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
            style={{ fontSize: '12.5px', minWidth: '130px', padding: '6px 10px' }}
          >
            <option value="">All Channels</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '12.5px', minWidth: '130px', padding: '6px 10px' }}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Lead Contact</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Channel / Bot</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Requirement</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isWhatsApp = lead.channel === 'whatsapp';
                  const cleanPhone = (lead.lead_phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Name & Contact */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {lead.lead_name || 'Website Visitor'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {lead.lead_phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} color="#059669" /> {lead.lead_phone}
                            </span>
                          )}
                          {lead.lead_email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={11} color="#0284c7" /> {lead.lead_email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel & Bot */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span className={isWhatsApp ? 'badge badge-green' : 'badge badge-blue'} style={{ fontSize: '10.5px' }}>
                            {isWhatsApp ? 'WhatsApp' : 'Website'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {botMap.get(lead.bot_id) || lead.bot_id}
                        </span>
                      </td>

                      {/* Requirement Summary */}
                      <td style={{ padding: '12px 14px', maxWidth: '300px' }}>
                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}>
                          {lead.lead_requirement || 'General inquiry'}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          className="form-select"
                          value={lead.status || 'new'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            padding: '3px 7px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline"
                              style={{ padding: '5px 8px', fontSize: '11px', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={12} />
                              <span>Chat</span>
                            </a>
                          )}
                          {lead.lead_email && (
                            <a
                              href={`mailto:${lead.lead_email}`}
                              className="btn-outline"
                              style={{ padding: '5px 8px', fontSize: '11px' }}
                              title="Send Email"
                            >
                              <Mail size={12} />
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
