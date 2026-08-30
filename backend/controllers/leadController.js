import { db } from '../config/database.js';

export async function listLeads(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const { botId, channel, status, search } = req.query;

    let leads = await db.getLeads(userId, botId || null);

    if (channel) {
      leads = leads.filter(l => l.channel === channel);
    }
    if (status) {
      leads = leads.filter(l => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(l =>
        (l.lead_name && l.lead_name.toLowerCase().includes(q)) ||
        (l.lead_phone && l.lead_phone.toLowerCase().includes(q)) ||
        (l.lead_email && l.lead_email.toLowerCase().includes(q)) ||
        (l.lead_requirement && l.lead_requirement.toLowerCase().includes(q))
      );
    }

    return res.json({ leads, total: leads.length });
  } catch (err) {
    console.error('List leads error:', err);
    return res.status(500).json({ error: 'Failed to retrieve leads' });
  }
}

export async function updateLeadStatus(req, res) {
  try {
    const { leadId } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'qualified', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await db.updateLeadStatus(leadId, status);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });

    return res.json({ lead: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update lead status' });
  }
}

export async function exportLeadsCsv(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const { botId } = req.query;
    const leads = await db.getLeads(userId, botId || null);
    const bots = await db.getBots(userId);
    const botMap = new Map(bots.map(b => [b.id, b.bot_name]));

    const headers = ['ID', 'Bot Name', 'Lead Name', 'Phone', 'Email', 'Requirement / Message', 'Channel', 'Status', 'Date Captured'];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${(botMap.get(l.bot_id) || l.bot_id).replace(/"/g, '""')}"`,
      `"${(l.lead_name || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.lead_phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.lead_email || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.lead_requirement || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${l.channel || 'website'}"`,
      `"${l.status || 'new'}"`,
      `"${new Date(l.created_at).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=omnibot-leads-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: 'Failed to generate CSV export' });
  }
}
