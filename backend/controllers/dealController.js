import * as dealModel from '../models/dealModel.js';

export function listDeals(req, res) {
  try {
    let deals = dealModel.readDeals();
    
    // If no deals exist, seed high-value initial pipeline deals
    if (deals.length === 0) {
      const seeded = [
        dealModel.createDeal({
          title: 'Custom SaaS Platform & AI Bot',
          contact_name: 'Rahul Sharma',
          contact_phone: '+91 98206 46838',
          contact_email: 'rahul.s@techcorp.in',
          value: 12500,
          stage: 'qualified',
          lead_score: 92,
          lead_temperature: '🔥 Hot',
          source: 'whatsapp_ai',
          notes: 'Looking for full-stack Next.js website + WhatsApp automation bot.'
        }),
        dealModel.createDeal({
          title: 'Clinic Booking & Dental Automation',
          contact_name: 'Dr. Anita Mehta',
          contact_phone: '+91 98765 12340',
          contact_email: 'dr.anita@apexcare.com',
          value: 8500,
          stage: 'proposal_sent',
          lead_score: 88,
          lead_temperature: '🔥 Hot',
          source: 'website_widget',
          notes: 'Sent project scope proposal. Awaiting confirmation deposit.'
        }),
        dealModel.createDeal({
          title: 'Real Estate Lead Gen Campaign',
          contact_name: 'Vikram Malhotra',
          contact_phone: '+971 50 123 4567',
          contact_email: 'vikram@dubailuxury.ae',
          value: 24000,
          stage: 'closed_won',
          lead_score: 95,
          lead_temperature: '🔥 Hot',
          source: 'campaign_broadcast',
          notes: 'Contract signed. Initial 50% milestone received.'
        })
      ];
      deals = dealModel.readDeals();
    }

    const totalPipelineValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const wonRevenue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    return res.json({
      success: true,
      deals,
      metrics: {
        total_deals: deals.length,
        total_pipeline_value: totalPipelineValue,
        won_revenue: wonRevenue,
        conversion_rate: deals.length > 0 ? ((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100).toFixed(1) + '%' : '0%'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createDeal(req, res) {
  try {
    const newDeal = dealModel.createDeal(req.body);
    return res.status(201).json({ success: true, deal: newDeal });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function updateStage(req, res) {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const updated = dealModel.updateDealStage(id, stage);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }
    return res.json({ success: true, deal: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function updateDeal(req, res) {
  try {
    const { id } = req.params;
    const updated = dealModel.updateDeal(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }
    return res.json({ success: true, deal: updated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function deleteDeal(req, res) {
  try {
    const { id } = req.params;
    const deleted = dealModel.deleteDeal(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }
    return res.json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
