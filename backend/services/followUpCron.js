import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { generateContextualNudge } from './ai.js';
import { logAutonomousTask } from './taskEngine.js';
import { sendEmailViaGoogle, isGoogleConnected } from './googleService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE = path.join(__dirname, '../data/followup_cron_state.json');

/**
 * Read cron state
 */
function readCronState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      fs.writeFileSync(STATE_FILE, JSON.stringify({ processed_leads: [], last_scan: null }));
      return { processed_leads: [], last_scan: null };
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch (err) {
    return { processed_leads: [], last_scan: null };
  }
}

/**
 * Save cron state
 */
function saveCronState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {}
}

/**
 * Scan and process stagnant leads (State Recovery & Scheduled Dispatch)
 */
export async function scanAndProcessFollowUps() {
  const state = readCronState();
  const now = Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000; // 2 hours
  let processedCount = 0;

  try {
    const leads = await db.getLeads(null, null);
    const bots = await db.getBots();
    const primaryBot = (bots && bots.length > 0) ? bots[0] : { bot_name: 'NovaByte AI Studio' };

    for (const lead of leads) {
      const leadId = lead.id;
      // Skip if already followed up via cron
      if (state.processed_leads.includes(leadId)) continue;

      const leadCreated = new Date(lead.created_at || lead.updated_at || now).getTime();
      const ageMs = now - leadCreated;

      // If lead is stagnant (older than 2 hours and not closed/cancelled)
      if (ageMs >= twoHoursMs && lead.status !== 'closed' && lead.status !== 'converted') {
        const leadName = lead.lead_name || 'there';
        const leadTopic = lead.lead_requirement || 'custom website development and AI automation';

        // Generate Human-Grade Contextual Nudge
        const nudgeText = await generateContextualNudge({
          bot: primaryBot,
          leadTopic
        });

        let dispatched = false;

        // Try Email dispatch if email exists
        if (lead.lead_email && lead.lead_email.includes('@') && isGoogleConnected()) {
          try {
            await sendEmailViaGoogle({
              to: lead.lead_email,
              leadName: lead.lead_name || 'Valued Client',
              subject: `Following up on your inquiry with NovaByte AI Studio`,
              message: nudgeText
            });
            dispatched = true;

            logAutonomousTask({
              type: 'follow_up',
              title: `Automated 2-Hour Follow-Up Email Sent to ${lead.lead_name || lead.lead_email}`,
              channel: 'email',
              recipient: lead.lead_email,
              status: 'completed',
              metadata: { lead_id: leadId, nudge: nudgeText }
            });
          } catch (e) {
            console.warn(`[FOLLOW-UP CRON] Email failed for lead ${leadId}:`, e.message);
          }
        }

        // Record as processed in state
        state.processed_leads.push(leadId);
        processedCount++;
      }
    }

    state.last_scan = new Date().toISOString();
    saveCronState(state);
  } catch (err) {
    console.error('[FOLLOW-UP CRON ERROR]:', err);
  }

  return { processed: processedCount, timestamp: state.last_scan };
}

/**
 * Initialize 2-Hour Intelligent State Recovery Follow-Up Cron
 * Runs every 10 minutes (* /10 * * * *)
 */
export function initFollowUpCron() {
  console.log('🤖 NovaByte 2-Hour Intelligent Follow-Up Cron Engine initialized (10m cycle).');

  // Immediate state recovery on server startup
  setTimeout(() => {
    scanAndProcessFollowUps().then(res => {
      if (res.processed > 0) {
        console.log(`[FOLLOW-UP RECOVERY] State recovery processed ${res.processed} pending lead follow-up(s).`);
      }
    });
  }, 5000);

  // Recurring cron every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await scanAndProcessFollowUps();
  });
}
