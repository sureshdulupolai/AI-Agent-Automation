import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Controllers
import * as authController from './controllers/authController.js';
import * as botController from './controllers/botController.js';
import * as chatController from './controllers/chatController.js';
import * as leadController from './controllers/leadController.js';
import * as whatsappController from './controllers/whatsappController.js';

import * as inboxController from './controllers/inboxController.js';
import * as verifyWebsiteController from './controllers/verifyWebsiteController.js';
import * as journeyController from './controllers/journeyController.js';
import * as integrationController from './controllers/integrationController.js';
import * as oauthController from './controllers/oauthController.js';
import * as campaignController from './controllers/campaignController.js';
import * as universalChatController from './controllers/universalChatController.js';
import { initAllWhatsAppSessions } from './services/baileysService.js';
import { restoreFollowUpsOnStartup } from './services/followUpScheduler.js';
import { startCampaignScheduler } from './services/campaignScheduler.js';
import { startEmailAutomationEngine, getEmailAutomationSettings, saveEmailAutomationSettings, getEmailAutomationLogs } from './services/emailAutomationService.js';
import { getTaskSummary, runBatchExecution, generateDailyEODReportSummary, clearAllTasks } from './services/taskEngine.js';
import { initFollowUpCron } from './services/followUpCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'omnibot-super-secret-jwt-key-2026';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for the embed widget
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (including widget.js and test page)
app.use(express.static(path.join(__dirname, 'public')));

// Optional Auth Middleware (Allows demo usage if token not provided)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback to default demo user context
    req.user = { userId: 'usr-demo-1', email: 'demo@omnibot.io', plan: 'pro' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { userId: 'usr-demo-1', email: 'demo@omnibot.io', plan: 'pro' };
    } else {
      req.user = user;
    }
    next();
  });
}

// ----------------------------------------------------
// Health & Diagnostic Routes
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'OmniBot SaaS Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me', authenticateToken, authController.getMe);

// ----------------------------------------------------
// Bots Management Routes
// ----------------------------------------------------
app.get('/api/bots', authenticateToken, botController.listBots);
app.get('/api/bots/:botId', botController.getBot);
app.get('/api/bots/:botId/public', botController.getPublicBotConfig); // Public for widget
app.post('/api/bots', authenticateToken, botController.createBot);
app.put('/api/bots/:botId', authenticateToken, botController.updateBot);
app.post('/api/bots/:botId/crawl-website', authenticateToken, botController.crawlWebsite);
app.delete('/api/bots/:botId', authenticateToken, botController.deleteBot);

// ----------------------------------------------------
// Chat & Widget Messaging & Verification Routes
// ----------------------------------------------------
app.post('/api/verify-website', verifyWebsiteController.verifyWebsiteWidget);
app.post('/api/chat/:botId', chatController.handleWidgetChat);
app.get('/api/chat/:botId/history/:sessionId', chatController.getSessionHistory);
app.post('/api/chat/:botId/lead', chatController.submitLeadForm);

// ----------------------------------------------------
// Unified Real-Time Inbox Routes (Website + WhatsApp)
// ----------------------------------------------------
app.get('/api/inbox/conversations', authenticateToken, inboxController.listConversations);
app.get('/api/inbox/conversations/:sessionId', authenticateToken, inboxController.getConversationDetails);
app.post('/api/inbox/reply', authenticateToken, inboxController.sendAgentReply);

// ----------------------------------------------------
// Lead Management & Audience CRM Routes
// ----------------------------------------------------
app.get('/api/leads', authenticateToken, leadController.listLeads);
app.post('/api/leads', authenticateToken, leadController.createLead);
app.put('/api/leads/:leadId', authenticateToken, leadController.updateLead);
app.delete('/api/leads/:leadId', authenticateToken, leadController.deleteLead);
app.patch('/api/leads/:leadId/status', authenticateToken, leadController.updateLeadStatus);
app.get('/api/leads/export/csv', authenticateToken, leadController.exportLeadsCsv);
app.get('/api/segments', authenticateToken, leadController.listSegments);
app.post('/api/segments', authenticateToken, leadController.createSegment);
app.delete('/api/segments/:segmentId', authenticateToken, leadController.deleteSegment);

// ----------------------------------------------------
// WhatsApp Automation Routes (QR + 8-Digit Pairing Code + Meta)
// ----------------------------------------------------
app.get('/api/whatsapp/:botId/qr', authenticateToken, whatsappController.getQR);
app.post('/api/whatsapp/:botId/pairing-code', authenticateToken, whatsappController.getPairingCode);
app.get('/api/whatsapp/:botId/status', authenticateToken, whatsappController.getStatus);
app.post('/api/whatsapp/:botId/pair', authenticateToken, whatsappController.confirmPairing);
app.post('/api/whatsapp/:botId/disconnect', authenticateToken, whatsappController.disconnect);
app.post('/api/whatsapp/:botId/simulate', whatsappController.simulateIncoming);

// Meta Cloud API Webhooks
app.get('/api/webhook/whatsapp', whatsappController.metaWebhookVerify);
app.post('/api/webhook/whatsapp', whatsappController.metaWebhookReceive);

// ----------------------------------------------------
// Automation Journeys & Flow Builder Routes
// ----------------------------------------------------
app.get('/api/journeys/followups/active', authenticateToken, journeyController.listActiveFollowUps);
app.get('/api/journeys', authenticateToken, journeyController.listJourneys);
app.get('/api/journeys/:id', authenticateToken, journeyController.getJourney);
app.post('/api/journeys', authenticateToken, journeyController.createJourney);
app.put('/api/journeys/:id', authenticateToken, journeyController.updateJourney);
app.patch('/api/journeys/:id/toggle-status', authenticateToken, journeyController.toggleJourneyStatus);
app.post('/api/journeys/:id/simulate-run', authenticateToken, journeyController.simulateRun);
app.delete('/api/journeys/:id', authenticateToken, journeyController.deleteJourney);

// ----------------------------------------------------
// Third-Party Integrations & AI Gateway Multi-Key Hub Routes
// ----------------------------------------------------
app.get('/api/integrations', authenticateToken, integrationController.listIntegrations);
app.patch('/api/integrations/:id', authenticateToken, integrationController.updateIntegration);
app.post('/api/integrations/:id/test', authenticateToken, integrationController.testIntegrationConnection);

// AI Gateway Keys & WhatsApp Alerts
app.get('/api/integrations/ai-gateway/keys', authenticateToken, integrationController.getAiGatewayKeys);
app.post('/api/integrations/ai-gateway/keys', authenticateToken, integrationController.addAiGatewayKey);
app.delete('/api/integrations/ai-gateway/keys/:id', authenticateToken, integrationController.deleteAiGatewayKey);
app.post('/api/integrations/ai-gateway/test-key', authenticateToken, integrationController.testAiGatewayKey);
app.post('/api/integrations/ai-gateway/notification-settings', authenticateToken, integrationController.updateNotificationSettings);

// Integration Checks
app.post('/api/integrations/google/test-sync', authenticateToken, integrationController.testGoogleSheetsSync);
app.post('/api/integrations/instagram/test-connection', authenticateToken, integrationController.testInstagramConnection);
app.post('/api/integrations/whatsapp/test-connection', authenticateToken, integrationController.testWhatsAppConnection);

// ----------------------------------------------------
// Production OAuth 2.0 Live Authentication & Tool Routes
// ----------------------------------------------------
app.get('/api/auth/oauth-status', oauthController.getOAuthConfigStatus);
app.get('/api/auth/google/url', oauthController.getGoogleAuthUrl);
app.get('/api/auth/google/callback', oauthController.googleCallback);
app.post('/api/integrations/google/sync-sheets', oauthController.syncGoogleSheets);
app.post('/api/integrations/google/send-email', oauthController.sendGoogleEmail);
app.get('/api/auth/instagram/url', oauthController.getInstagramAuthUrl);
app.get('/api/auth/instagram/callback', oauthController.instagramCallback);

// ----------------------------------------------------
// Bulk Campaign & Scheduled Dispatch Routes
// ----------------------------------------------------
app.get('/api/campaigns', campaignController.getCampaigns);
app.post('/api/campaigns/create', campaignController.createCampaign);
app.post('/api/campaigns/:id/cancel', campaignController.cancelCampaign);
app.delete('/api/campaigns/:id', campaignController.deleteCampaign);

// ----------------------------------------------------
// Email Automation & Drip Sequence Routes
// ----------------------------------------------------
app.get('/api/email-automations/settings', (req, res) => {
  res.json({ success: true, settings: getEmailAutomationSettings() });
});
app.post('/api/email-automations/settings', (req, res) => {
  const updated = saveEmailAutomationSettings(req.body);
  res.json({ success: true, settings: updated });
});
// ----------------------------------------------------
// Autonomous Task & EOD Reporting Engine Routes
// ----------------------------------------------------
app.get('/api/tasks/summary', async (req, res) => {
  try {
    const summary = await getTaskSummary();
    res.json({ success: true, ...summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks/run-batch', async (req, res) => {
  try {
    const results = await runBatchExecution();
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tasks/generate-eod-report', async (req, res) => {
  try {
    const report = await generateDailyEODReportSummary();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tasks/clear', (req, res) => {
  try {
    clearAllTasks();
    res.json({ success: true, message: 'All audit task logs cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Universal Dynamic Business Engine Routes
// ----------------------------------------------------
app.get('/api/universal/profile/:botId', universalChatController.getBusinessProfile);
app.post('/api/universal/profile/:botId', universalChatController.updateBusinessProfile);
app.post('/api/universal/generate-profile', universalChatController.autoGenerateProfile);
app.post('/api/universal/chat', universalChatController.handleUniversalInboundChat);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 OmniBot SaaS Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 Embed Widget hosted at http://localhost:${PORT}/widget.js`);
  console.log(`🧪 Interactive test page at http://localhost:${PORT}/test-widget.html`);
  
  // Restore any persistent WhatsApp sessions
  initAllWhatsAppSessions().catch(err => console.error('WhatsApp startup session init error:', err));

  // Restore any pending follow-up timers from disk (survive server restarts)
  restoreFollowUpsOnStartup().catch(err => console.error('Follow-up restore error:', err));

  // Start Campaign Background Scheduler
  startCampaignScheduler();

  // Start Email Automation Engine
  startEmailAutomationEngine();

  // Start 2-Hour Intelligent State Recovery Follow-Up Cron
  initFollowUpCron();
});
