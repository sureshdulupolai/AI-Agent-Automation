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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.delete('/api/bots/:botId', authenticateToken, botController.deleteBot);

// ----------------------------------------------------
// Chat & Widget Messaging Routes
// ----------------------------------------------------
app.post('/api/chat/:botId', chatController.handleWidgetChat);
app.get('/api/chat/:botId/history/:sessionId', chatController.getSessionHistory);
app.post('/api/chat/:botId/lead', chatController.submitLeadForm);

// ----------------------------------------------------
// Lead Management CRM Routes
// ----------------------------------------------------
app.get('/api/leads', authenticateToken, leadController.listLeads);
app.patch('/api/leads/:leadId/status', authenticateToken, leadController.updateLeadStatus);
app.get('/api/leads/export/csv', authenticateToken, leadController.exportLeadsCsv);

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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 OmniBot SaaS Backend Server running on http://localhost:${PORT}`);
  console.log(`📦 Embed Widget hosted at http://localhost:${PORT}/widget.js`);
  console.log(`🧪 Interactive test page at http://localhost:${PORT}/test-widget.html`);
});
