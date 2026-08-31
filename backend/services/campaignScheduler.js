import { getCampaignsData, executeCampaign } from './campaignService.js';

let schedulerInterval = null;

export function startCampaignScheduler() {
  if (schedulerInterval) return;

  console.log('⏰ OmniBot Campaign Scheduler engine initialized (30s polling cycle).');

  schedulerInterval = setInterval(async () => {
    try {
      const campaigns = getCampaignsData();
      const now = new Date();

      const dueCampaigns = campaigns.filter(c => {
        if (c.status !== 'scheduled' || !c.scheduled_at) return false;
        const schedDate = new Date(c.scheduled_at);
        return schedDate <= now;
      });

      for (const campaign of dueCampaigns) {
        console.log(`🚀 Triggering scheduled ${campaign.channel.toUpperCase()} campaign: "${campaign.name}" (ID: ${campaign.id})`);
        executeCampaign(campaign.id).catch(err => {
          console.error(`Error executing scheduled campaign ${campaign.id}:`, err);
        });
      }
    } catch (err) {
      console.error('Error in campaign scheduler tick:', err);
    }
  }, 30000); // Check every 30 seconds
}

export function stopCampaignScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
