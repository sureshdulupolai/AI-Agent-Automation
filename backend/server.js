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
import * as billingController from './controllers/billingController.js';
import * as dealController from './controllers/dealController.js';
import * as teamController from './controllers/teamController.js';
import * as appointmentController from './controllers/appointmentController.js';
import * as copilotController from './controllers/copilotController.js';
import * as safeCampaignController from './controllers/safeCampaignController.js';
import * as leadRouterController from './controllers/leadRouterController.js';
import * as dynamicChatController from './controllers/dynamicChatController.js';
import * as walletController from './controllers/walletController.js';
import * as whatsappBaileys from './services/whatsappBaileys.js';
import { initAllWhatsAppSessions } from './services/baileysService.js';
import { restoreFollowUpsOnStartup } from './services/followUpScheduler.js';
import { startCampaignScheduler } from './services/campaignScheduler.js';
import { startEmailAutomationEngine, getEmailAutomationSettings, saveEmailAutomationSettings, getEmailAutomationLogs } from './services/emailAutomationService.js';
import { getTaskSummary, runBatchExecution, generateDailyEODReportSummary, clearAllTasks } from './services/taskEngine.js';
import { initFollowUpCron } from './services/followUpCron.js';
import { helmetGuard, globalRateLimiter, authRateLimiter, hppGuard, sanitizePayloads } from './middleware/security.js';
import { tenantGuard } from './middleware/tenantGuard.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'omnibot-super-secret-jwt-key-2026';

// 7-Tier Bulletproof Security Stack
app.use(helmetGuard);
app.use(globalRateLimiter);
app.use(hppGuard);
app.use(sanitizePayloads);

// CORS & Body Parser
app.use(cors({
  origin: '*', // Allow cross-origin for embed widget & webhooks
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.use(express.json({ limit: '25mb' })); // Support rich media & attachments
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets (including widget.js and test page)
app.use(express.static(path.join(__dirname, 'public')));

// Hardened Authentication Middleware (Guards against invalid/forged tokens)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, error: 'Authentication required: Missing Bearer token' });
    }
    // Safe local demo context in development
    req.user = { userId: 'usr-demo-1', email: 'demo@omnibot.io', plan: 'pro' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Forbidden: Invalid or expired security token' });
    }
    req.user = user;
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
// Auth Routes (with Dedicated Strict Rate Limiter)
// ----------------------------------------------------
app.post('/api/auth/login', authRateLimiter, authController.login);
app.post('/api/auth/register', authRateLimiter, authController.register);
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
app.post('/api/chat/dynamic', tenantGuard({ required: false }), dynamicChatController.handleDynamicChat);
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
app.get('/api/whatsapp/whitelist-settings', whatsappController.getWhitelist);
app.post('/api/whatsapp/whitelist-settings', whatsappController.updateWhitelist);
app.get('/api/whatsapp/groups/live', whatsappController.getLiveGroups);
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
app.get('/api/universal/credits/:botId', universalChatController.getCreditsStatus);

// ----------------------------------------------------
// Billing, Service Controls & Multi-API Key Hub Routes
// ----------------------------------------------------
app.get('/api/billing/controls', billingController.getBillingControls);
app.post('/api/billing/controls/toggle', billingController.updateBillingControlToggle);
app.get('/api/billing/keys-health', billingController.getApiKeysHealth);
app.post('/api/billing/keys-routing-policy', billingController.updateRoutingPolicy);
app.post('/api/billing/keys-add', billingController.addApiKey);
app.delete('/api/billing/keys/:id', billingController.deleteApiKey);
app.put('/api/billing/keys/:id', billingController.editApiKey);
app.patch('/api/billing/keys/:id/toggle', billingController.toggleApiKey);
app.post('/api/billing/keys-test', billingController.testApiKeySlot);

// ----------------------------------------------------
// Deals & Sales Pipeline Kanban Routes
// ----------------------------------------------------
app.get('/api/deals', dealController.listDeals);
app.post('/api/deals', dealController.createDeal);
app.patch('/api/deals/:id', dealController.updateDeal);
app.patch('/api/deals/:id/stage', dealController.updateStage);
app.delete('/api/deals/:id', dealController.deleteDeal);

// ----------------------------------------------------
// Multi-Agent Team Inbox & Human Handoff Routes
// ----------------------------------------------------
app.get('/api/team/conversations', teamController.listTeamConversations);
app.post('/api/team/handoff/:sessionId', teamController.toggleHumanHandoff);
app.post('/api/team/reply', teamController.sendHumanAgentReply);

// ----------------------------------------------------
// Auto Appointment Booking & Calendar Routes
// ----------------------------------------------------
app.get('/api/appointments', appointmentController.listAppointments);
app.post('/api/appointments/book', appointmentController.bookAppointment);
app.delete('/api/appointments/:id', appointmentController.cancelAppointment);

// ----------------------------------------------------
// Multi-Number WhatsApp Session Manager Routes
// ----------------------------------------------------
app.get('/api/whatsapp/multi-sessions', async (req, res) => {
  try {
    const sessions = await whatsappBaileys.listAllActiveSessions();
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/whatsapp/multi-sessions/init', async (req, res) => {
  try {
    const { botId } = req.body;
    const session = await whatsappBaileys.createNewDeviceSession(botId || 'bot-ec0db899');
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.delete('/api/whatsapp/multi-sessions/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    await whatsappBaileys.disconnectDeviceSession(botId);
    res.json({ success: true, message: 'Device disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// Free & Unlimited Wallet & Per-Message Metering Routes
// ----------------------------------------------------
app.get('/api/wallet', authenticateToken, walletController.getWallet);
app.post('/api/wallet/topup', authenticateToken, walletController.topUpWallet);
app.get('/api/wallet/transactions', authenticateToken, walletController.getTransactions);
app.post('/api/wallet/settings', authenticateToken, walletController.updateWalletSettings);

// ----------------------------------------------------
// Autonomous Operations Copilot & Action Agent Routes
// ----------------------------------------------------
app.post('/api/copilot/chat', copilotController.handleCopilotChat);

// ----------------------------------------------------
// WhatsApp Anti-Ban & Safe Campaign Dispatch Routes
// ----------------------------------------------------
app.post('/api/campaigns/safe-dispatch', tenantGuard({ required: false }), safeCampaignController.dispatchSafeCampaign);
app.get('/api/campaigns/safe-jobs', tenantGuard({ required: false }), safeCampaignController.listSafeJobs);
app.get('/api/campaigns/safe-jobs/:jobId', tenantGuard({ required: false }), safeCampaignController.getSafeJobDetails);
app.post('/api/campaigns/safe-jobs/:jobId/pause', tenantGuard({ required: false }), safeCampaignController.pauseSafeJob);
app.post('/api/campaigns/safe-jobs/:jobId/resume', tenantGuard({ required: false }), safeCampaignController.resumeSafeJob);
app.post('/api/campaigns/safe-jobs/:jobId/cancel', tenantGuard({ required: false }), safeCampaignController.cancelSafeJob);
app.get('/api/campaigns/safety-health', safeCampaignController.getSafetyHealth);

// ----------------------------------------------------
// Autonomous Batch Lead Ingestion & Smart Handoff Routes
// ----------------------------------------------------
app.post('/api/leads/batch-ingest', tenantGuard({ required: false }), leadRouterController.batchIngestLeads);
app.post('/api/leads/evaluate-route', tenantGuard({ required: false }), leadRouterController.evaluateSingleLeadRoute);

// ----------------------------------------------------
// Centralized 404 & Error Handling Middleware
// ----------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

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
