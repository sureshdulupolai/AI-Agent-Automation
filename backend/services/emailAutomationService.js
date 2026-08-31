import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmailViaGoogle, getGoogleTokens } from './googleService.js';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(__dirname, '../data/email_automations.json');
const LOGS_FILE = path.join(__dirname, '../data/email_automation_logs.json');

const DEFAULT_SETTINGS = {
  enabled: true,
  sender_account: 'sureshpolai63@gmail.com',
  nurture_sequence: [
    {
      step: 1,
      name: 'Immediate Welcome & Service Overview',
      delay_minutes: 0,
      enabled: true,
      subject: 'Thank You for Reaching Out - NovaByte AI Studio',
      body: 'Hello {{name}},\n\nThank you for reaching out regarding your project: "{{requirement}}".\n\nWe specialize in high-performance web applications, modern responsive landing pages, and autonomous AI WhatsApp chatbots designed to scale client acquisition 24/7.\n\nCould you share a bit more about your ideal timeline and project scope?\n\nBest regards,\nNovaByte AI Studio'
    },
    {
      step: 2,
      name: '24-Hour Portfolio & Value Offer',
      delay_minutes: 1440, // 24 hours
      enabled: true,
      subject: 'Quick Follow-up: Web & AI Solutions Portfolio for {{name}}',
      body: 'Hello {{name}},\n\nFollowing up on my previous note. We offer rapid delivery (3-7 business days) with complete SEO optimization, cloud architecture, and intelligent 24/7 AI chat assistants.\n\nLet us know if you would like to see a quick 5-minute interactive demo tailored for your niche.\n\nBest regards,\nNovaByte AI Studio'
    },
    {
      step: 3,
      name: '48-Hour Free Strategy Call',
      delay_minutes: 2880, // 48 hours
      enabled: true,
      subject: 'Free 15-Minute Strategy Call with NovaByte AI Studio',
      body: 'Hello {{name}},\n\nI wanted to check if you still need assistance with "{{requirement}}". Our engineering team would be happy to jump on a quick 15-minute discovery call to map out the technical blueprint for your project.\n\nFeel free to reply directly to this email.\n\nBest regards,\nNovaByte AI Engineering Team'
    }
  ]
};

export function getEmailAutomationSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveEmailAutomationSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return settings;
  } catch (err) {
    console.error('Error saving email automation settings:', err);
    return null;
  }
}

export function getEmailAutomationLogs() {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

export function saveEmailAutomationLogs(logs) {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error saving email automation logs:', err);
  }
}

/**
 * Triggers Email Drip Check for Captured Leads
 */
export async function runEmailAutomationCycle() {
  try {
    const settings = getEmailAutomationSettings();
    if (!settings.enabled) return;

    const leads = await db.getLeads();
    const leadsWithEmail = (leads || []).filter(l => l.lead_email && l.lead_email.includes('@'));
    const logs = getEmailAutomationLogs();
    const now = Date.now();

    for (const lead of leadsWithEmail) {
      const leadCreated = new Date(lead.created_at || lead.updated_at || Date.now()).getTime();
      const minutesSinceCreation = (now - leadCreated) / (1000 * 60);

      for (const step of settings.nurture_sequence) {
        if (!step.enabled) continue;

        // Check if step already sent for this lead
        const alreadySent = logs.some(l => l.lead_id === lead.id && l.step === step.step);
        if (alreadySent) continue;

        // Check if step delay has passed
        if (minutesSinceCreation >= step.delay_minutes) {
          const subject = step.subject
            .replace(/{{\s*name\s*}}/gi, lead.lead_name || 'Client')
            .replace(/{{\s*requirement\s*}}/gi, lead.lead_requirement || 'your project inquiry');

          const body = step.body
            .replace(/{{\s*name\s*}}/gi, lead.lead_name || 'Client')
            .replace(/{{\s*requirement\s*}}/gi, lead.lead_requirement || 'your project inquiry');

          try {
            await sendEmailViaGoogle({
              to: lead.lead_email,
              subject,
              message: body,
              leadName: lead.lead_name || 'Client'
            });

            logs.push({
              id: Date.now().toString(),
              lead_id: lead.id,
              lead_name: lead.lead_name,
              lead_email: lead.lead_email,
              step: step.step,
              step_name: step.name,
              status: 'sent',
              sent_at: new Date().toISOString()
            });

            saveEmailAutomationLogs(logs);
            console.log(`📧 Automated Email Step ${step.step} sent to ${lead.lead_email}`);
          } catch (err) {
            console.error(`Failed to send automated email step ${step.step} to ${lead.lead_email}:`, err.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in email automation cycle:', err);
  }
}

let emailInterval = null;
export function startEmailAutomationEngine() {
  if (emailInterval) return;
  console.log('🤖 OmniBot AI Email Automation Engine started (60s cycle).');
  emailInterval = setInterval(runEmailAutomationCycle, 60000);
}
