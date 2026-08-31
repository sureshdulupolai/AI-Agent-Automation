import { v4 as uuidv4 } from 'uuid';
import { getCampaignsData, saveCampaignsData, executeCampaign, parseExcelOrCsvBuffer } from '../services/campaignService.js';

export const getCampaigns = (req, res) => {
  try {
    const campaigns = getCampaignsData();
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, channel, recipients, message_template, subject, scheduled_at, bot_id, attachment } = req.body;

    if (!name || !channel || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Campaign name, channel, and at least one recipient are required.' });
    }

    const campaignId = uuidv4();
    const isScheduled = Boolean(scheduled_at && new Date(scheduled_at) > new Date());

    const newCampaign = {
      id: campaignId,
      name: name.trim(),
      channel: channel.toLowerCase(), // 'whatsapp' or 'email'
      status: isScheduled ? 'scheduled' : 'pending',
      scheduled_at: isScheduled ? new Date(scheduled_at).toISOString() : null,
      created_at: new Date().toISOString(),
      recipients,
      message_template: message_template || '',
      subject: subject || '',
      bot_id: bot_id || null,
      attachment: attachment || null,
      stats: {
        total: recipients.length,
        sent: 0,
        failed: 0
      },
      logs: []
    };

    const campaigns = getCampaignsData();
    campaigns.unshift(newCampaign);
    saveCampaignsData(campaigns);

    if (!isScheduled) {
      // Execute immediately in background
      executeCampaign(campaignId).catch(err => console.error('Campaign background execution error:', err));
    }

    res.json({
      success: true,
      message: isScheduled 
        ? `Campaign scheduled for ${new Date(scheduled_at).toLocaleString()}` 
        : `Campaign created and dispatch started for ${recipients.length} recipients.`,
      campaign: newCampaign
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const cancelCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const campaigns = getCampaignsData();
    const campaign = campaigns.find(c => c.id === id);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    if (campaign.status === 'completed' || campaign.status === 'running') {
      return res.status(400).json({ success: false, error: `Cannot cancel a campaign that is already ${campaign.status}` });
    }

    campaign.status = 'cancelled';
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData(campaigns);

    res.json({ success: true, message: 'Campaign successfully cancelled', campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCampaign = (req, res) => {
  try {
    const { id } = req.params;
    let campaigns = getCampaignsData();
    campaigns = campaigns.filter(c => c.id !== id);
    saveCampaignsData(campaigns);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
