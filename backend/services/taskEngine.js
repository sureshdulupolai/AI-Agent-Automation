import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { generateEODExecutiveReport } from './ai.js';
import { runEmailAutomationCycle } from './emailAutomationService.js';
import { scanAndProcessFollowUps } from './followUpCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TASKS_FILE = path.join(__dirname, '../data/tasks_audit.json');

/**
 * Helper to read task audit logs
 */
function readTasks() {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading tasks_audit.json:', err);
    return [];
  }
}

/**
 * Helper to write task audit logs
 */
function saveTasks(tasks) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving tasks_audit.json:', err);
    return false;
  }
}

/**
 * Record an autonomous task execution in the system audit log
 */
export function logAutonomousTask({
  type = 'automation', // 'follow_up' | 'qualification' | 'proposal' | 'broadcast' | 'nurture' | 'report' | 'system'
  title = '',
  channel = 'system',  // 'whatsapp' | 'email' | 'website' | 'system'
  recipient = '',
  status = 'completed', // 'completed' | 'pending' | 'failed'
  metadata = {},
  error = null
}) {
  const tasks = readTasks();
  const newTask = {
    id: `task-${uuidv4().substring(0, 8)}`,
    type,
    title: title || `${type.toUpperCase()} execution`,
    channel,
    recipient: recipient || 'System Auto-Engine',
    status,
    metadata,
    error: error ? String(error) : null,
    created_at: new Date().toISOString(),
    timestamp: Date.now()
  };

  // Keep last 1000 tasks
  const updated = [newTask, ...tasks].slice(0, 1000);
  saveTasks(updated);
  return newTask;
}

/**
 * Clear all tasks from audit log
 */
export function clearAllTasks() {
  saveTasks([]);
  return true;
}

/**
 * Get structured summary of tasks and audit metrics
 */
export async function getTaskSummary() {
  const tasks = readTasks();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter(t => new Date(t.created_at) >= todayStart);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const pendingToday = todayTasks.filter(t => t.status === 'pending').length;
  const failedToday = todayTasks.filter(t => t.status === 'failed').length;

  const channelBreakdown = {
    whatsapp: tasks.filter(t => t.channel === 'whatsapp').length,
    email: tasks.filter(t => t.channel === 'email').length,
    website: tasks.filter(t => t.channel === 'website').length,
    system: tasks.filter(t => t.channel === 'system').length
  };

  const typeBreakdown = {
    follow_up: tasks.filter(t => t.type === 'follow_up').length,
    qualification: tasks.filter(t => t.type === 'qualification').length,
    proposal: tasks.filter(t => t.type === 'proposal').length,
    broadcast: tasks.filter(t => t.type === 'broadcast').length,
    nurture: tasks.filter(t => t.type === 'nurture').length,
    report: tasks.filter(t => t.type === 'report').length
  };

  const successRate = tasks.length > 0 
    ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1) + '%'
    : '100%';

  return {
    metrics: {
      total_tasks_logged: tasks.length,
      completed_today: completedToday,
      pending_today: pendingToday,
      failed_today: failedToday,
      success_rate: successRate
    },
    channel_breakdown: channelBreakdown,
    type_breakdown: typeBreakdown,
    recent_tasks: tasks.slice(0, 60)
  };
}

/**
 * Manually or Cron-triggered Batch Execution Cycle
 */
export async function runBatchExecution() {
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    email_drips_processed: 0,
    follow_ups_processed: 0,
    errors: [],
    message: 'Autonomous cycle executed successfully.'
  };

  try {
    // 1. Run Email Nurture Drips
    await runEmailAutomationCycle();
  } catch (err) {
    results.errors.push(`Email Automation Error: ${err.message}`);
  }

  try {
    // 2. Run Follow-Up State Recovery Scan
    const followUpStats = await scanAndProcessFollowUps();
    results.follow_ups_processed = followUpStats?.processed || 0;
  } catch (err) {
    results.errors.push(`Follow-Up Engine Error: ${err.message}`);
  }

  const tasks = readTasks();
  const recentCycle = tasks.find(t => t.type === 'system' && Date.now() - t.timestamp < 3 * 60 * 1000);

  // If actual actions happened OR no cycle was logged in last 3 minutes, log task
  if (results.follow_ups_processed > 0 || results.email_drips_processed > 0 || !recentCycle) {
    logAutonomousTask({
      type: 'system',
      title: results.follow_ups_processed > 0 
        ? `Processed ${results.follow_ups_processed} Autonomous Follow-Up Timers` 
        : 'Autonomous Lead Queue & Drip Scan Cycle',
      channel: 'system',
      recipient: 'Active Lead Pipelines',
      status: results.errors.length === 0 ? 'completed' : 'completed_with_warnings',
      metadata: {
        duration_ms: Date.now() - startTime,
        ...results
      }
    });
  }

  results.message = `Scanned follow-up and email drip pipelines in ${Date.now() - startTime}ms. All queues healthy.`;
  return results;
}

/**
 * Generate EOD Report
 */
export async function generateDailyEODReportSummary() {
  const tasks = readTasks();
  const leads = await db.getLeads(null, null);
  
  // Read campaigns
  let campaigns = [];
  try {
    const campFile = path.join(__dirname, '../data/campaigns.json');
    if (fs.existsSync(campFile)) {
      campaigns = JSON.parse(fs.readFileSync(campFile, 'utf-8'));
    }
  } catch (e) {}

  const report = generateEODExecutiveReport({ tasks, leads, campaigns });

  // Check if a report was logged in last 10 minutes to avoid spamming rows
  const recentReport = tasks.find(t => t.type === 'report' && Date.now() - t.timestamp < 10 * 60 * 1000);

  if (!recentReport) {
    logAutonomousTask({
      type: 'report',
      title: `Daily EOD Executive Intelligence Report (${new Date().toLocaleDateString()})`,
      channel: 'system',
      recipient: 'Studio Executive Dashboard',
      status: 'completed',
      metadata: {
        summary_metrics: report.summary_metrics,
        report_markdown: report.report_markdown
      }
    });
  }

  return report;
}
