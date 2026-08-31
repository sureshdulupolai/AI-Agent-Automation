import { db } from '../config/database.js';

export async function listLeads(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const { botId, channel, status, search, listId } = req.query;

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

export async function createLead(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const { lead_name, lead_phone, lead_email, lead_requirement, channel, bot_id, status } = req.body;

    if (!lead_name && !lead_phone && !lead_email) {
      return res.status(400).json({ error: 'At least a name, phone, or email is required' });
    }

    const newLead = await db.createLead({
      user_id: userId,
      bot_id: bot_id || 'bot-ec0db899',
      lead_name: lead_name || 'Contact',
      lead_phone: lead_phone || null,
      lead_email: lead_email || null,
      lead_requirement: lead_requirement || 'Directly created from Contacts CRM',
      channel: channel || 'whatsapp',
      status: status || 'new',
      session_id: lead_phone ? `wa-${lead_phone.replace(/[^0-9]/g, '')}` : `contact-${Date.now()}`
    });

    return res.status(201).json({ lead: newLead });
  } catch (err) {
    console.error('Create lead error:', err);
    return res.status(500).json({ error: 'Failed to create contact' });
  }
}

export async function deleteLead(req, res) {
  try {
    const { leadId } = req.params;
    await db.deleteLead(leadId);
    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Delete lead error:', err);
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
}

export async function updateLead(req, res) {
  try {
    const { leadId } = req.params;
    const { lead_name, lead_phone, lead_email, lead_requirement, status } = req.body;

    const updates = {};
    if (lead_name !== undefined) updates.lead_name = lead_name;
    if (lead_phone !== undefined) {
      let cleanPhone = lead_phone ? lead_phone.trim() : null;
      if (cleanPhone && !cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone.replace(/[^0-9]/g, '');
      }
      updates.lead_phone = cleanPhone;
    }
    if (lead_email !== undefined) updates.lead_email = lead_email ? lead_email.trim() : null;
    if (lead_requirement !== undefined) updates.lead_requirement = lead_requirement;
    if (status !== undefined) updates.status = status;

    const updated = await db.updateLead(leadId, updates);
    if (!updated) return res.status(404).json({ error: 'Contact not found' });

    return res.json({ success: true, lead: updated });
  } catch (err) {
    console.error('Update lead error:', err);
    return res.status(500).json({ error: 'Failed to update contact' });
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

// LISTS & SEGMENTS ENDPOINTS
export async function listSegments(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const segments = await db.getSegments(userId);
    return res.json({ segments });
  } catch (err) {
    console.error('List segments error:', err);
    return res.status(500).json({ error: 'Failed to retrieve lists & segments' });
  }
}

export async function createSegment(req, res) {
  try {
    const { name, type, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newSegment = await db.createSegment({
      name: name.trim(),
      type: type || 'list',
      description: description?.trim() || ''
    });
    return res.status(201).json({ segment: newSegment });
  } catch (err) {
    console.error('Create segment error:', err);
    return res.status(500).json({ error: 'Failed to create segment' });
  }
}

export async function deleteSegment(req, res) {
  try {
    const { segmentId } = req.params;
    await db.deleteSegment(segmentId);
    return res.json({ success: true, message: 'Segment deleted successfully' });
  } catch (err) {
    console.error('Delete segment error:', err);
    return res.status(500).json({ error: 'Failed to delete segment' });
  }
}
