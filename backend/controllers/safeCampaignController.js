import * as antiBanEngine from '../services/antiBanEngine.js';
import db from '../config/database.js';

/**
 * POST /api/campaigns/safe-dispatch
 * Dispatches a WhatsApp broadcast list with randomized anti-ban delays and cool-down protection
 */
export async function dispatchSafeCampaign(req, res) {
  try {
    const { botId, name, recipients, message, mediaUrl } = req.body;
    const tenantId = req.tenant?.id || 'default-tenant';

    if (!botId) {
      return res.status(400).json({ success: false, error: 'botId is required' });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'recipients list cannot be empty' });
    }

    // Verify daily limit before queueing
    const usage = antiBanEngine.getDailySessionUsage(botId);
    if (usage.dispatched_count >= antiBanEngine.ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT) {
      return res.status(429).json({
        success: false,
        error: `Daily anti-ban safety limit (${antiBanEngine.ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT} msgs/day) reached for this session. Please resume tomorrow to protect your WhatsApp account.`
      });
    }

    const job = antiBanEngine.queueSafeCampaignJob({
      botId,
      name,
      recipients,
      messageTemplate: message,
      mediaUrl,
      tenantId
    });

    return res.status(202).json({
      success: true,
      message: 'Safe campaign queued successfully with human-like randomized delays.',
      jobId: job.id,
      totalRecipients: job.total_recipients,
      estimatedDurationSec: job.estimated_duration_sec,
      antiBanConfig: {
        minDelaySec: antiBanEngine.ANTI_BAN_CONFIG.MIN_DELAY_MS / 1000,
        maxDelaySec: antiBanEngine.ANTI_BAN_CONFIG.MAX_DELAY_MS / 1000,
        coolDownEveryN: antiBanEngine.ANTI_BAN_CONFIG.COOL_DOWN_EVERY_N_MSGS,
        coolDownDurationSec: antiBanEngine.ANTI_BAN_CONFIG.COOL_DOWN_DURATION_MS / 1000,
        dailyLimit: antiBanEngine.ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT
      }
    });
  } catch (err) {
    console.error('Safe campaign dispatch error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/campaigns/safe-jobs
 */
export async function listSafeJobs(req, res) {
  try {
    const tenantId = req.tenant?.id || 'default-tenant';
    const allJobs = antiBanEngine.readJobsStore();
    const tenantJobs = allJobs.filter(j => !j.tenant_id || j.tenant_id === tenantId);
    return res.json({ success: true, jobs: tenantJobs });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/campaigns/safe-jobs/:jobId
 */
export async function getSafeJobDetails(req, res) {
  try {
    const { jobId } = req.params;
    const allJobs = antiBanEngine.readJobsStore();
    const job = allJobs.find(j => j.id === jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Campaign job not found' });
    }

    return res.json({ success: true, job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/campaigns/safe-jobs/:jobId/pause
 */
export async function pauseSafeJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = antiBanEngine.updateJobStatus(jobId, 'paused');
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    return res.json({ success: true, message: 'Campaign paused', job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/campaigns/safe-jobs/:jobId/resume
 */
export async function resumeSafeJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = antiBanEngine.updateJobStatus(jobId, 'running');
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    return res.json({ success: true, message: 'Campaign resumed', job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/campaigns/safe-jobs/:jobId/cancel
 */
export async function cancelSafeJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = antiBanEngine.updateJobStatus(jobId, 'cancelled');
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    return res.json({ success: true, message: 'Campaign cancelled', job });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/campaigns/safety-health
 */
export async function getSafetyHealth(req, res) {
  try {
    const bots = await db.getBots();
    const botId = req.query.botId || (bots[0]?.id || 'bot-ec0db899');
    const usage = antiBanEngine.getDailySessionUsage(botId);

    return res.json({
      success: true,
      bot_id: botId,
      daily_dispatched: usage.dispatched_count,
      daily_limit: antiBanEngine.ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT,
      remaining_quota: Math.max(0, antiBanEngine.ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT - usage.dispatched_count),
      safety_score: usage.safety_score,
      protection_status: 'Shield Active (12-35s Human Hesitation + 120s Periodic Cool-down)'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
