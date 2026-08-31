import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendWhatsAppMessage, getWhatsAppStatus } from './baileysService.js';
import { logTaskExecution } from './taskEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOBS_FILE = path.join(__dirname, '../data/safe_campaign_jobs.json');
const SESSION_STATS_FILE = path.join(__dirname, '../data/wa_session_stats.json');

// Configuration constants for strict anti-ban protection
export const ANTI_BAN_CONFIG = {
  MIN_DELAY_MS: 12000,           // 12 seconds minimum human hesitation
  MAX_DELAY_MS: 35000,           // 35 seconds maximum randomized delay
  COOL_DOWN_EVERY_N_MSGS: 25,    // Cool-down pause every 25 messages
  COOL_DOWN_DURATION_MS: 120000, // 120 seconds cool-down sleep
  DAILY_SESSION_LIMIT: 250,      // Max 250 outbound messages per session per day
  MAX_RETRIES: 2                 // Max retry attempts on socket timeout
};

/**
 * Generate randomized human-like delay between min and max ms
 */
export function getRandomHumanDelay(min = ANTI_BAN_CONFIG.MIN_DELAY_MS, max = ANTI_BAN_CONFIG.MAX_DELAY_MS) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Read persistent jobs store
 */
export function readJobsStore() {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

/**
 * Save persistent jobs store
 */
export function saveJobsStore(jobs) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving safe_campaign_jobs.json:', err);
    return false;
  }
}

/**
 * Read session daily metrics
 */
export function readSessionStats() {
  try {
    if (!fs.existsSync(SESSION_STATS_FILE)) {
      fs.writeFileSync(SESSION_STATS_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(fs.readFileSync(SESSION_STATS_FILE, 'utf-8'));
  } catch (err) {
    return {};
  }
}

/**
 * Save session daily metrics
 */
export function saveSessionStats(stats) {
  try {
    fs.writeFileSync(SESSION_STATS_FILE, JSON.stringify(stats, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Get or initialize today's stats for a bot session
 */
export function getDailySessionUsage(botId) {
  const stats = readSessionStats();
  const todayKey = new Date().toISOString().split('T')[0];
  const sessionKey = `${botId}_${todayKey}`;

  if (!stats[sessionKey]) {
    stats[sessionKey] = {
      bot_id: botId,
      date: todayKey,
      dispatched_count: 0,
      failed_count: 0,
      last_dispatched_at: null,
      safety_score: 100
    };
    saveSessionStats(stats);
  }

  return stats[sessionKey];
}

/**
 * Increment daily count for session
 */
export function recordSessionDispatch(botId, isSuccess = true) {
  const stats = readSessionStats();
  const todayKey = new Date().toISOString().split('T')[0];
  const sessionKey = `${botId}_${todayKey}`;

  if (!stats[sessionKey]) {
    stats[sessionKey] = {
      bot_id: botId,
      date: todayKey,
      dispatched_count: 0,
      failed_count: 0,
      last_dispatched_at: null,
      safety_score: 100
    };
  }

  if (isSuccess) {
    stats[sessionKey].dispatched_count += 1;
  } else {
    stats[sessionKey].failed_count += 1;
  }
  stats[sessionKey].last_dispatched_at = new Date().toISOString();

  // Calculate dynamic safety score based on threshold consumption
  const ratio = stats[sessionKey].dispatched_count / ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT;
  stats[sessionKey].safety_score = Math.max(10, Math.round(100 - (ratio * 50)));

  saveSessionStats(stats);
  return stats[sessionKey];
}

// In-memory registry of active background workers
const activeWorkers = new Map();

/**
 * Queue a new Safe Campaign Dispatch Job
 */
export function queueSafeCampaignJob({
  botId,
  name,
  recipients = [],
  messageTemplate = '',
  mediaUrl = null,
  tenantId = 'default-tenant'
}) {
  const jobs = readJobsStore();
  const jobId = `safe-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Filter and sanitize recipients
  const sanitizedRecipients = recipients.map((r, index) => {
    const phone = typeof r === 'string' ? r : (r.phone || r.mobile || r.number || '');
    const name = typeof r === 'object' ? (r.name || r.lead_name || 'Valued Client') : 'Valued Client';
    const email = typeof r === 'object' ? (r.email || null) : null;
    return {
      index,
      name,
      phone: String(phone).replace(/[^0-9+]/g, ''),
      email,
      status: 'pending', // pending | sent | failed | skipped
      error: null,
      sent_at: null,
      retry_count: 0
    };
  }).filter(r => r.phone && r.phone.length >= 7);

  // Estimate duration in seconds
  const avgDelaySec = (ANTI_BAN_CONFIG.MIN_DELAY_MS + ANTI_BAN_CONFIG.MAX_DELAY_MS) / 2000;
  const coolDownPeriods = Math.floor(sanitizedRecipients.length / ANTI_BAN_CONFIG.COOL_DOWN_EVERY_N_MSGS);
  const estimatedDurationSec = Math.round((sanitizedRecipients.length * avgDelaySec) + (coolDownPeriods * (ANTI_BAN_CONFIG.COOL_DOWN_DURATION_MS / 1000)));

  const newJob = {
    id: jobId,
    tenant_id: tenantId,
    bot_id: botId,
    name: name || `Safe WhatsApp Broadcast (${new Date().toLocaleDateString()})`,
    message_template: messageTemplate,
    media_url: mediaUrl,
    total_recipients: sanitizedRecipients.length,
    sent_count: 0,
    failed_count: 0,
    status: 'queued', // queued | running | paused | completed | cancelled | threshold_exceeded
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_index: 0,
    cool_down_active: false,
    cool_down_ends_at: null,
    next_delay_ms: 0,
    estimated_duration_sec: estimatedDurationSec,
    recipients: sanitizedRecipients
  };

  jobs.unshift(newJob);
  saveJobsStore(jobs);

  // Trigger background runner asynchronously
  setTimeout(() => {
    startSafeCampaignRunner(jobId);
  }, 500);

  return newJob;
}

/**
 * Background Safe Campaign Worker Loop
 */
export async function startSafeCampaignRunner(jobId) {
  if (activeWorkers.has(jobId)) {
    return; // Worker already processing this job
  }

  activeWorkers.set(jobId, true);

  try {
    let continueProcessing = true;

    while (continueProcessing) {
      const jobs = readJobsStore();
      const job = jobs.find(j => j.id === jobId);

      if (!job) {
        break;
      }

      // Check job state
      if (job.status === 'paused' || job.status === 'cancelled' || job.status === 'completed') {
        break;
      }

      // Check daily volume safety threshold
      const usage = getDailySessionUsage(job.bot_id);
      if (usage.dispatched_count >= ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT) {
        job.status = 'threshold_exceeded';
        job.updated_at = new Date().toISOString();
        saveJobsStore(jobs);
        console.warn(`🛑 Anti-Ban: Session ${job.bot_id} reached daily limit (${ANTI_BAN_CONFIG.DAILY_SESSION_LIMIT}). Job paused.`);
        break;
      }

      // Find next pending recipient
      const nextRecipient = job.recipients.find(r => r.status === 'pending');
      if (!nextRecipient) {
        job.status = 'completed';
        job.updated_at = new Date().toISOString();
        saveJobsStore(jobs);
        
        // Log task telemetry
        logTaskExecution({
          type: 'broadcast',
          title: `Safe Campaign Dispatched: ${job.name}`,
          status: 'completed',
          payload: {
            job_id: job.id,
            total: job.total_recipients,
            sent: job.sent_count,
            failed: job.failed_count
          }
        });
        break;
      }

      // Update state to running
      job.status = 'running';
      job.updated_at = new Date().toISOString();

      // Check if periodic cool-down is required
      if (job.sent_count > 0 && job.sent_count % ANTI_BAN_CONFIG.COOL_DOWN_EVERY_N_MSGS === 0 && !job.cool_down_active) {
        job.cool_down_active = true;
        job.cool_down_ends_at = new Date(Date.now() + ANTI_BAN_CONFIG.COOL_DOWN_DURATION_MS).toISOString();
        saveJobsStore(jobs);

        console.log(`⏳ Anti-Ban Cool-Down Active for Job ${job.id}: Sleeping for ${ANTI_BAN_CONFIG.COOL_DOWN_DURATION_MS / 1000}s to protect socket.`);
        await new Promise(resolve => setTimeout(resolve, ANTI_BAN_CONFIG.COOL_DOWN_DURATION_MS));

        const refreshedJobs = readJobsStore();
        const refreshedJob = refreshedJobs.find(j => j.id === jobId);
        if (refreshedJob) {
          refreshedJob.cool_down_active = false;
          refreshedJob.cool_down_ends_at = null;
          saveJobsStore(refreshedJobs);
        }
      }

      // Verify WhatsApp Socket Connection
      const waStatus = await getWhatsAppStatus(job.bot_id);
      if (waStatus.status !== 'connected') {
        job.status = 'paused';
        job.error = 'WhatsApp socket disconnected. Reconnect device in Integrations to resume.';
        job.updated_at = new Date().toISOString();
        saveJobsStore(jobs);
        break;
      }

      // Calculate randomized human delay (12-35s)
      const humanDelay = getRandomHumanDelay();
      job.next_delay_ms = humanDelay;
      job.current_index = nextRecipient.index + 1;
      saveJobsStore(jobs);

      // Perform human hesitation sleep BEFORE dispatch
      await new Promise(resolve => setTimeout(resolve, humanDelay));

      // Construct personalized message
      let finalMessage = job.message_template || 'Hello {{name}}, we have a special update for you!';
      finalMessage = finalMessage.replace(/{{name}}/g, nextRecipient.name);

      // Attempt dispatch
      try {
        const sendResult = await sendWhatsAppMessage(job.bot_id, nextRecipient.phone, finalMessage);
        
        if (sendResult && sendResult.success) {
          nextRecipient.status = 'sent';
          nextRecipient.sent_at = new Date().toISOString();
          job.sent_count += 1;
          recordSessionDispatch(job.bot_id, true);
        } else {
          nextRecipient.status = 'failed';
          nextRecipient.error = sendResult?.error || 'Socket dispatch failed';
          job.failed_count += 1;
          recordSessionDispatch(job.bot_id, false);
        }
      } catch (sendErr) {
        nextRecipient.status = 'failed';
        nextRecipient.error = sendErr.message;
        job.failed_count += 1;
        recordSessionDispatch(job.bot_id, false);
      }

      job.updated_at = new Date().toISOString();
      saveJobsStore(jobs);
    }
  } catch (err) {
    console.error(`Safe Campaign Runner error for job ${jobId}:`, err);
  } finally {
    activeWorkers.delete(jobId);
  }
}

/**
 * Control Actions: Pause / Resume / Cancel Safe Campaign Job
 */
export function updateJobStatus(jobId, newStatus) {
  const jobs = readJobsStore();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;

  if (['paused', 'cancelled', 'running'].includes(newStatus)) {
    job.status = newStatus;
    job.updated_at = new Date().toISOString();
    saveJobsStore(jobs);

    if (newStatus === 'running') {
      setTimeout(() => startSafeCampaignRunner(jobId), 100);
    }
    return job;
  }
  return null;
}
