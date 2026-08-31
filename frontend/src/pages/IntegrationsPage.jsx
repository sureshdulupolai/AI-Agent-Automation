import React, { useState, useEffect } from 'react';
import { 
  Plug, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Check, 
  X, 
  Sparkles,
  Zap,
  Key,
  Phone,
  Play,
  ChevronRight,
  Copy,
  QrCode,
  Smartphone,
  Unplug,
  Filter,
  Tag,
  Save,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

// Google 4-Color SVG Logo
const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/>
    <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/>
    <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/>
    <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/>
  </svg>
);

// WhatsApp SVG Logo
const WhatsAppLogo = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="#25D366">
    <path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.94.557 3.754 1.524 5.29L2.05 22l4.836-1.442a9.96 9.96 0 0 0 5.118 1.446c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm5.792 14.195c-.244.686-1.42 1.344-1.956 1.408-.512.062-1.157.089-3.72-.97-3.04-1.258-4.992-4.348-5.144-4.55-.152-.202-1.233-1.64-1.233-3.128 0-1.488.777-2.22 1.052-2.523.275-.304.6-.38.8-.38.2 0 .4 0 .576.01.188.01.44.07.69.67.26.623.88 2.146.957 2.302.077.156.128.34.025.542-.102.203-.153.33-.304.507-.152.177-.32.395-.457.53-.152.15-.31.314-.133.618.177.304.786 1.296 1.687 2.098 1.16.033 2.137 1.353 2.441 1.505.304.152.482.127.66-.076.177-.203.76-.887.963-1.19.203-.304.406-.254.685-.152.28.102 1.774.836 2.078.988.304.152.507.228.583.355.076.127.076.736-.168 1.422z"/>
  </svg>
);

// Instagram SVG Logo
const InstagramLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);

  // Setup / Help Modals
  const [setupModal, setSetupModal] = useState(null); // 'google_setup' | 'meta_setup' | 'whatsapp_modal' | 'ai_gateway_modal'
  const [copiedText, setCopiedText] = useState(false);

  // WhatsApp Live Connection Modal State
  const [selectedBotId, setSelectedBotId] = useState('');
  const [waMethod, setWaMethod] = useState('qr'); // 'qr' | 'pairing_code'
  const [waQrCode, setWaQrCode] = useState(null);
  const [waPairingCode, setWaPairingCode] = useState(null);
  const [waPhoneInput, setWaPhoneInput] = useState('');
  const [waLoading, setWaLoading] = useState(false);
  const [waBotStatus, setWaBotStatus] = useState(null);
  const [copiedPairingCode, setCopiedPairingCode] = useState(false);

  // WhatsApp In-Modal Automation & Keywords State
  const [waReplyMode, setWaReplyMode] = useState('all'); // 'all' | 'keywords'
  const [waKeywords, setWaKeywords] = useState([
    'website', 'price', 'pricing', 'cost', 'ai', 'chatbot', 'service', 'portfolio', 'package', 'quote', 'hire', 'demo', 'contact'
  ]);
  const [waNewKeyword, setWaNewKeyword] = useState('');
  const [waPrompt, setWaPrompt] = useState('');
  const [waSavingRules, setWaSavingRules] = useState(false);
  const [waSavedRulesSuccess, setWaSavedRulesSuccess] = useState(false);

  // AI Gateway Multi-Key State
  const [clientKeys, setClientKeys] = useState([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyString, setNewKeyString] = useState('');
  const [alertPhone, setAlertPhone] = useState('+91 98206 46838');
  const [testingKeyId, setTestingKeyId] = useState(null);
  const [keyTestResults, setKeyTestResults] = useState({});

  // Google Live Sheets & Email Actions State
  const [syncingGoogleSheets, setSyncingGoogleSheets] = useState(false);
  const [googleSheetResult, setGoogleSheetResult] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Regarding Your Project Inquiry - Suresh Polai');
  const [emailBody, setEmailBody] = useState('Hi there,\n\nThank you for reaching out regarding your project. We offer full-stack website development and custom AI automation solutions tailored to your business needs.\n\nPlease let us know if you would like to schedule a quick 10-minute discovery call.\n\nBest regards,\nSuresh Polai');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations');
      const data = await res.json();
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (data.bots && data.bots.length > 0) {
        setBots(data.bots);
        if (!selectedBotId) setSelectedBotId(data.bots[0].id);
      }
    } catch (err) {
      console.error('Error loading bots:', err);
    }
  };

  const fetchAiGatewayKeys = async () => {
    try {
      const res = await fetch('/api/integrations/ai-gateway/keys');
      const data = await res.json();
      if (data.success) {
        setClientKeys(data.client_keys || []);
        if (data.notification_settings?.whatsapp_alert_phone) {
          setAlertPhone(data.notification_settings.whatsapp_alert_phone);
        }
      }
    } catch (err) {
      console.error('Error loading AI keys:', err);
    }
  };

  // Poll WhatsApp bot status when WhatsApp modal is open
  const fetchWhatsAppBotStatus = async (botId) => {
    if (!botId) return;
    try {
      const res = await fetch(`/api/whatsapp/${botId}/status`);
      const data = await res.json();
      setWaBotStatus(data);
      if (data.status === 'connected') {
        setWaQrCode(null);
        setWaPairingCode(null);
        fetchIntegrations();
      }
    } catch (err) {
      console.error('Failed to get WA status:', err);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    fetchBots();
    fetchAiGatewayKeys();

    // Listen for OAuth completion message from popup window
    const handleOAuthMessage = (event) => {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        fetchIntegrations();
      }
    };
    window.addEventListener('message', handleOAuthMessage);

    // Check for OAuth return in URL query (if opened in same window)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_connected') === 'true') {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchIntegrations();
    } else if (urlParams.get('instagram_connected') === 'true') {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchIntegrations();
    }

    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Polling WhatsApp status when modal is active
  useEffect(() => {
    let interval;
    if (setupModal === 'whatsapp_modal' && selectedBotId) {
      fetchWhatsAppBotStatus(selectedBotId);
      interval = setInterval(() => {
        fetchWhatsAppBotStatus(selectedBotId);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [setupModal, selectedBotId]);

  // Sync selected bot automation settings for WhatsApp modal
  useEffect(() => {
    const currentBot = bots.find(b => b.id === selectedBotId) || bots[0];
    if (currentBot) {
      setWaReplyMode(currentBot.whatsapp_reply_mode || 'all');
      if (Array.isArray(currentBot.whatsapp_keywords) && currentBot.whatsapp_keywords.length > 0) {
        setWaKeywords(currentBot.whatsapp_keywords);
      }
      setWaPrompt(
        currentBot.system_instructions ||
        'You are the official AI Assistant for Suresh Polai (Full-Stack Developer & AI Automation Specialist). You are polite, consultative, and concise on WhatsApp.\n\nExplain our Website Development ($499-$999), AI Chatbots ($799-$1499), and SaaS Automation services. Capture client name, project requirements, and contact info so Suresh can connect directly.'
      );
    }
  }, [selectedBotId, bots]);

  const handleSaveWaConfig = async () => {
    if (!selectedBotId) return;
    setWaSavingRules(true);
    setWaSavedRulesSuccess(false);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_reply_mode: waReplyMode,
          whatsapp_keywords: waKeywords,
          system_instructions: waPrompt
        })
      });
      if (res.ok) {
        setWaSavedRulesSuccess(true);
        fetchBots();
        confetti({ particleCount: 25, spread: 35, origin: { y: 0.6 } });
        setTimeout(() => setWaSavedRulesSuccess(false), 2500);
      }
    } catch (e) {
      alert('Failed to save settings: ' + e.message);
    } finally {
      setWaSavingRules(false);
    }
  };

  const handleAddWaKeyword = (e) => {
    if (e) e.preventDefault();
    const tag = waNewKeyword.trim().toLowerCase();
    if (!tag) return;
    if (!waKeywords.includes(tag)) {
      setWaKeywords(prev => [...prev, tag]);
    }
    setWaNewKeyword('');
  };

  const handleRemoveWaKeyword = (tagToRemove) => {
    setWaKeywords(prev => prev.filter(t => t !== tagToRemove));
  };

  const waPromptPresets = [
    {
      title: 'Digital Agency / Freelance Pro',
      prompt: 'You are the official AI representative for Suresh Polai (Web Developer & AI Automation Specialist). Be polite, consultative, and concise. Explain Web Development packages ($499-$999), AI Chatbots ($799-$1499), and 3-7 day delivery. Capture client name, project scope, and preferred callback time.'
    },
    {
      title: 'WhatsApp Sales Closer',
      prompt: 'You are an energetic, consultative WhatsApp sales representative. Use bullet points and friendly emojis. Answer questions on custom website features and pricing, and guide clients to book a 1-on-1 discovery call with Suresh.'
    },
    {
      title: '24/7 Support Concierge',
      prompt: 'You are a patient, helpful 24/7 client support concierge. Answer service inquiries accurately from the verified business knowledge and escalate complex custom requests.'
    }
  ];

  const handleSyncGoogleSheets = async () => {
    try {
      setSyncingGoogleSheets(true);
      setGoogleSheetResult(null);
      const res = await fetch('/api/integrations/google/sync-sheets', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setGoogleSheetResult(data);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        fetchIntegrations();
      } else {
        alert(data.error || 'Failed to sync Google Sheets');
      }
    } catch (e) {
      alert('Sync error: ' + e.message);
    } finally {
      setSyncingGoogleSheets(false);
    }
  };

  const handleSendEmail = async (e) => {
    if (e) e.preventDefault();
    if (!emailTo) return;
    try {
      setSendingEmail(true);
      setEmailSuccessMsg('');
      const res = await fetch('/api/integrations/google/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          message: emailBody,
          leadName: 'Client'
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailSuccessMsg(data.message || `Email sent successfully to ${emailTo}!`);
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSuccessMsg('');
        }, 2200);
      } else {
        alert(data.error || 'Failed to send email');
      }
    } catch (e) {
      alert('Email error: ' + e.message);
    } finally {
      setSendingEmail(false);
    }
  };

  // Generate QR Code for live scan
  const handleGenerateQR = async () => {
    if (!selectedBotId) return;
    setWaLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/qr`);
      const data = await res.json();
      if (data.qrCode) {
        setWaQrCode(data.qrCode);
      }
    } catch (err) {
      alert('Error initiating QR scanner: ' + err.message);
    } finally {
      setWaLoading(false);
    }
  };

  // Request 8-Digit Pairing Code
  const handleRequestPairingCode = async (e) => {
    if (e) e.preventDefault();
    if (!selectedBotId) return;
    if (!waPhoneInput.trim()) {
      alert('Please enter your WhatsApp mobile number with country code (e.g. 919820646838).');
      return;
    }
    setWaLoading(true);
    setWaPairingCode(null);

    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: waPhoneInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate pairing code');

      setWaPairingCode(data.pairingCode);
    } catch (err) {
      alert(err.message);
    } finally {
      setWaLoading(false);
    }
  };

  // Disconnect WhatsApp session
  const handleDisconnectWhatsApp = async () => {
    if (!selectedBotId) return;
    try {
      await fetch(`/api/whatsapp/${selectedBotId}/disconnect`, { method: 'POST' });
      setWaBotStatus({ status: 'disconnected', phoneNumber: null });
      setWaQrCode(null);
      setWaPairingCode(null);
      await fetchIntegrations();
      await fetchBots();
      setTimeout(() => {
        handleGenerateQR();
      }, 300);
    } catch (err) {
      alert('Failed to disconnect');
    }
  };

  // Universal Connect Handler
  const handleConnectClick = async (item) => {
    setConnectingId(item.id);

    // 1. Google OAuth 2.0 Real Popup
    if (item.id === 'google') {
      try {
        const res = await fetch('/api/auth/google/url');
        const data = await res.json();
        if (data.configured && data.authUrl) {
          setConnectingId(null);
          const width = 500;
          const height = 650;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          const popup = window.open(
            data.authUrl,
            'GoogleSignIn',
            `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
          );
          if (popup) {
            const timer = setInterval(() => {
              if (popup.closed) {
                clearInterval(timer);
                fetchIntegrations();
              }
            }, 800);
          }
          return;
        } else {
          setConnectingId(null);
          setSetupModal('google_setup');
          return;
        }
      } catch (err) {
        setConnectingId(null);
        setSetupModal('google_setup');
        return;
      }
    }

    // 2. Meta Instagram OAuth Real Popup
    if (item.id === 'instagram') {
      try {
        const res = await fetch('/api/auth/instagram/url');
        const data = await res.json();
        if (data.configured && data.authUrl) {
          setConnectingId(null);
          const width = 550;
          const height = 700;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          const popup = window.open(
            data.authUrl,
            'MetaLogin',
            `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
          );
          if (popup) {
            const timer = setInterval(() => {
              if (popup.closed) {
                clearInterval(timer);
                fetchIntegrations();
              }
            }, 800);
          }
          return;
        } else {
          setConnectingId(null);
          setSetupModal('meta_setup');
          return;
        }
      } catch (err) {
        setConnectingId(null);
        setSetupModal('meta_setup');
        return;
      }
    }

    // 3. WhatsApp Direct Connection Modal
    if (item.id === 'whatsapp') {
      setConnectingId(null);
      setSetupModal('whatsapp_modal');
      const targetBot = selectedBotId || (bots[0]?.id);
      if (targetBot) {
        fetchWhatsAppBotStatus(targetBot);
        fetch(`/api/whatsapp/${targetBot}/status`).then(r => r.json()).then(st => {
          if (st.status !== 'connected' || !st.phoneNumber) {
            handleGenerateQR();
          }
        }).catch(() => {});
      }
      return;
    }

    // 4. AI Gateway
    setConnectingId(null);
    if (item.id === 'ai_gateway') setSetupModal('ai_gateway_modal');
  };

  // Remove / Disconnect Integration
  const handleRemoveIntegration = async (id) => {
    if (id === 'whatsapp' && selectedBotId) {
      return handleDisconnectWhatsApp();
    }
    if (!window.confirm('Are you sure you want to disconnect this integration?')) return;
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'not_configured', account: null })
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations(integrations.map(i => i.id === id ? data.integration : i));
      }
    } catch (err) {
      alert('Failed to remove integration');
    }
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // AI Gateway Key Handlers
  const handleAddGeminiKey = async (e) => {
    e.preventDefault();
    if (!newKeyString.trim()) return alert('Please enter a Gemini API Key');
    try {
      const res = await fetch('/api/integrations/ai-gateway/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel.trim(), key: newKeyString.trim() })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
        setNewKeyLabel('');
        setNewKeyString('');
        fetchAiGatewayKeys();
      }
    } catch (err) {
      alert('Error adding key');
    }
  };

  const handleDeleteGeminiKey = async (id) => {
    if (!window.confirm('Remove this key from fallback pool?')) return;
    try {
      await fetch(`/api/integrations/ai-gateway/keys/${id}`, { method: 'DELETE' });
      fetchAiGatewayKeys();
    } catch (err) {
      alert('Failed to delete key');
    }
  };

  const handleTestSingleKey = async (keyObj) => {
    setTestingKeyId(keyObj.id);
    try {
      const res = await fetch('/api/integrations/ai-gateway/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyObj.key, id: keyObj.id })
      });
      const data = await res.json();
      setKeyTestResults(prev => ({ ...prev, [keyObj.id]: data }));
      if (data.success) confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
    } catch (err) {
      setKeyTestResults(prev => ({ ...prev, [keyObj.id]: { success: false, message: err.message } }));
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleSaveAlertPhone = async () => {
    try {
      const res = await fetch('/api/integrations/ai-gateway/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_alert_phone: alertPhone, alert_on_rate_limit: true })
      });
      const data = await res.json();
      if (data.success) alert('WhatsApp alert phone saved!');
    } catch (err) {
      alert('Failed to save');
    }
  };

  const getIntegrationLogo = (id) => {
    switch (id) {
      case 'google':
        return (
          <span style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10px', backgroundColor: '#ffffff' }}>
            <GoogleLogo />
          </span>
        );
      case 'whatsapp':
        return (
          <span style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10px', backgroundColor: '#ffffff' }}>
            <WhatsAppLogo />
          </span>
        );
      case 'instagram':
        return (
          <span style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid rgba(225, 29, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10px', backgroundColor: 'rgba(225, 29, 72, 0.06)' }}>
            <InstagramLogo />
          </span>
        );
      case 'ai_gateway':
        return (
          <span style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10px', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--primary)' }}>
            <Zap size={24} />
          </span>
        );
      default:
        return (
          <span style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '10px', backgroundColor: 'rgba(79, 70, 229, 0.06)', color: 'var(--primary)' }}>
            <Plug size={24} />
          </span>
        );
    }
  };

  const googlePromptText = `I am building an AI Automation SaaS app on Google Cloud. Please provide step-by-step instructions on how to create a Google OAuth 2.0 Web Client ID and Secret in Google Cloud Console:
1. Enable Google Sheets API & Google Drive API
2. Set Authorized Javascript Origin to: http://localhost:3000 and http://localhost:5000
3. Set Authorized Redirect URI to: http://localhost:5000/api/auth/google/callback
4. Give me the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET values for my .env file.`;

  const metaPromptText = `I am building an Instagram & WhatsApp AI Automation Bot with Meta Graph API. Please guide me on how to get:
1. Meta App ID & App Secret from developers.facebook.com
2. Set Valid OAuth Redirect URI to: http://localhost:5000/api/auth/instagram/callback
3. Add Instagram Graph API and WhatsApp Cloud API products
4. Provide the exact META_APP_ID, META_APP_SECRET, and Permanent System User Access Token for my .env file.`;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#09090b', margin: 0, letterSpacing: '-0.02em' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
          Essential channels and tools to power real customer conversations, CRM sync, and AI chatbot intelligence.
        </p>
      </div>

      {/* Integrations Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ fontSize: '13px' }}>Loading integrations...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
          gap: '16px'
        }}>
          {integrations.map((item) => {
            const isConnected = item.status === 'connected';
            const isConnecting = connectingId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '14px',
                  border: '1px solid #d1d1d6',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                  {/* Top Bar: Icon + Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    {getIntegrationLogo(item.id)}

                    {isConnected ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        Active
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#f4f4f5',
                        color: '#71717a'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#71717a' }} />
                        Not configured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 style={{ marginTop: '16px', fontWeight: 800, fontSize: '16.5px', color: '#09090b', marginBottom: '6px' }}>
                    {item.name}
                  </h2>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.5, flex: 1, margin: 0 }}>
                    {item.description}
                  </p>

                  {/* Connected Since Date & Account Details */}
                  {isConnected && (
                    <div style={{ marginTop: '14px', fontSize: '12px', color: '#71717a' }}>
                      <div>Connected since {item.connected_since || 'Active'}</div>
                      {item.account && (
                        <div style={{ marginTop: '3px', fontWeight: 600, color: '#18181b', fontSize: '11.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Account: {item.account}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Google Live Actions */}
                  {item.id === 'google' && isConnected && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleSyncGoogleSheets}
                          disabled={syncingGoogleSheets}
                          style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: syncingGoogleSheets ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {syncingGoogleSheets ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>Syncing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} color="#22c55e" />
                              <span>Sync Leads to Sheet</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowEmailModal(true)}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#eef2ff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Send direct email via connected Google"
                        >
                          <MessageSquare size={12} />
                          <span>Send Email</span>
                        </button>
                      </div>

                      {googleSheetResult?.spreadsheet_url && (
                        <a
                          href={googleSheetResult.spreadsheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11.5px',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Google Sheet ({googleSheetResult.synced_count} Leads)</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleRemoveIntegration(item.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffe4e6'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff1f2'; }}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnectClick(item)}
                        disabled={isConnecting}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '8px',
                          backgroundColor: '#f4f4f5',
                          color: '#18181b',
                          border: '1px solid #e4e4e7',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: isConnecting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          opacity: isConnecting ? 0.7 : 1,
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { 
                          if (!isConnecting) e.currentTarget.style.backgroundColor = '#e4e4e7'; 
                        }}
                        onMouseLeave={(e) => { 
                          if (!isConnecting) e.currentTarget.style.backgroundColor = '#f4f4f5'; 
                        }}
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : item.id === 'ai_gateway' ? (
                          <>
                            <span>Manage Keys Pool</span>
                            <ChevronRight size={14} />
                          </>
                        ) : (
                          <>
                            <Plug size={14} />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. GOOGLE OAUTH CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {setupModal === 'google_setup' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            width: '560px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            padding: '30px',
            border: '1px solid #e4e4e7'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleLogo />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#18181b', margin: 0 }}>
                    Google OAuth 2.0 Setup
                  </h3>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>
                    Connect Google for User Login &amp; Sheets Sync
                  </span>
                </div>
              </div>
              <button onClick={() => setSetupModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#52525b', lineHeight: 1.5, marginBottom: '16px' }}>
              To enable <strong>Google One-Tap Login</strong> and <strong>Google Sheets lead export</strong>, configure your Google Cloud credentials in <code>backend/.env</code>:
            </p>

            {/* Prompt Helper */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--primary)" /> Setup Instructions / AI Prompt:
                </span>
                <button
                  onClick={() => handleCopyPrompt(googlePromptText)}
                  style={{
                    backgroundColor: copiedText ? '#10b981' : '#ffffff',
                    color: copiedText ? '#ffffff' : '#1e293b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedText ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedText ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <pre style={{ margin: 0, fontSize: '11.5px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.45, fontFamily: 'monospace' }}>
                {googlePromptText}
              </pre>
            </div>

            {/* Redirect URI Info Box */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', marginBottom: '18px', fontSize: '12px', color: '#166534' }}>
              <strong>Authorized Redirect URI:</strong> <code>http://localhost:5000/api/auth/google/callback</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSetupModal(null)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                Close
              </button>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Open Google Cloud Console</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. META / INSTAGRAM GRAPH API SETUP MODAL */}
      {/* ========================================================================= */}
      {setupModal === 'meta_setup' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            width: '560px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            padding: '30px',
            border: '1px solid #e4e4e7'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InstagramLogo />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#18181b', margin: 0 }}>
                    Meta Instagram Graph API Setup
                  </h3>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>
                    Facebook Login for Instagram Business DMs &amp; Comments
                  </span>
                </div>
              </div>
              <button onClick={() => setSetupModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#52525b', lineHeight: 1.5, marginBottom: '16px' }}>
              To connect your Instagram Business account for automated DM replies, add your Meta App credentials in <code>backend/.env</code>:
            </p>

            {/* Prompt Helper */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#e11d48" /> Setup Instructions:
                </span>
                <button
                  onClick={() => handleCopyPrompt(metaPromptText)}
                  style={{
                    backgroundColor: copiedText ? '#10b981' : '#ffffff',
                    color: copiedText ? '#ffffff' : '#1e293b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedText ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedText ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <pre style={{ margin: 0, fontSize: '11.5px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.45, fontFamily: 'monospace' }}>
                {metaPromptText}
              </pre>
            </div>

            <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px', marginBottom: '18px', fontSize: '12px', color: '#be123c' }}>
              <strong>Authorized Redirect URI:</strong> <code>http://localhost:5000/api/auth/instagram/callback</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSetupModal(null)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                Close
              </button>
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px', backgroundColor: '#e11d48', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Open Meta Developers</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE DIRECT WHATSAPP PAIRING MODAL (QR Code + 8-Digit Pairing Code) */}
      {/* ========================================================================= */}
      {setupModal === 'whatsapp_modal' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            width: '620px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            padding: '28px',
            border: '1px solid #e4e4e7',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(37, 211, 102, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WhatsAppLogo />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#18181b', margin: 0 }}>
                    WhatsApp Device Connection
                  </h3>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>
                    100% Free Live Device Pairing (No API Key Required)
                  </span>
                </div>
              </div>

              <button onClick={() => { setSetupModal(null); fetchIntegrations(); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                <X size={20} />
              </button>
            </div>

            {/* Select Bot */}
            {bots.length > 1 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                  Select AI Bot to Link:
                </label>
                <select
                  value={selectedBotId}
                  onChange={(e) => {
                    setSelectedBotId(e.target.value);
                    fetchWhatsAppBotStatus(e.target.value);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '13px' }}
                >
                  {bots.map(b => (
                    <option key={b.id} value={b.id}>{b.bot_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Connection Status Banner */}
            {waBotStatus?.status === 'connected' && waBotStatus?.phoneNumber ? (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '15px', marginBottom: '4px' }}>
                  <CheckCircle2 size={20} color="#22c55e" />
                  <span>WhatsApp is LIVE Connected!</span>
                </div>
                <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                  Active Number: {waBotStatus.phoneNumber}
                </div>
                <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', marginBottom: '14px' }}>
                  Your AI agent is automatically replying to all incoming WhatsApp messages in real-time.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <a
                    href={`https://wa.me/${waBotStatus.phoneNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={14} />
                    <span>Open Test Chat</span>
                  </a>
                  <button
                    onClick={handleDisconnectWhatsApp}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Unplug size={14} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Method Tabs: QR vs Pairing Code */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: '#f4f4f5',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '18px'
                }}>
                  <button
                    type="button"
                    onClick={() => { setWaMethod('qr'); if (!waQrCode) handleGenerateQR(); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: waMethod === 'qr' ? '#ffffff' : 'transparent',
                      color: waMethod === 'qr' ? '#09090b' : '#71717a',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      boxShadow: waMethod === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={15} />
                    <span>Scan QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWaMethod('pairing_code')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: waMethod === 'pairing_code' ? '#ffffff' : 'transparent',
                      color: waMethod === 'pairing_code' ? '#09090b' : '#71717a',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      boxShadow: waMethod === 'pairing_code' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Smartphone size={15} />
                    <span>8-Digit Pairing Code</span>
                  </button>
                </div>

                {/* METHOD 1: QR CODE */}
                {waMethod === 'qr' && (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    {waQrCode ? (
                      <div style={{ display: 'inline-block', padding: '12px', backgroundColor: '#ffffff', borderRadius: '14px', border: '2px dashed #10b981', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                        <img
                          src={waQrCode}
                          alt="WhatsApp QR"
                          style={{ width: '190px', height: '190px', display: 'block', borderRadius: '8px' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '30px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                        <QrCode size={40} color="#9ca3af" style={{ margin: '0 auto 10px auto' }} />
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
                          Click below to start Baileys live QR stream
                        </p>
                        <button
                          type="button"
                          onClick={handleGenerateQR}
                          disabled={waLoading}
                          className="btn-primary"
                          style={{ padding: '8px 20px', fontSize: '13px', backgroundColor: '#10b981' }}
                        >
                          {waLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                          <span>Generate Live QR</span>
                        </button>
                      </div>
                    )}

                    {/* Step-by-step instructions */}
                    <div style={{ marginTop: '16px', textAlign: 'left', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                      <strong>How to scan:</strong>
                      <ol style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                        <li>Open <strong>WhatsApp</strong> on your phone</li>
                        <li>Tap <strong>Settings (or ⋮ Menu)</strong> &rarr; <strong>Linked Devices</strong></li>
                        <li>Tap <strong>Link a Device</strong> and point your camera at the QR code above</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* METHOD 2: 8-DIGIT PAIRING CODE */}
                {waMethod === 'pairing_code' && (
                  <div style={{ padding: '10px 0' }}>
                    <form onSubmit={handleRequestPairingCode} style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#18181b', marginBottom: '6px' }}>
                        Enter Mobile Number (With Country Code):
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="e.g. 919820646838"
                          value={waPhoneInput}
                          onChange={(e) => setWaPhoneInput(e.target.value)}
                          style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d1d6', fontSize: '13px' }}
                        />
                        <button
                          type="submit"
                          disabled={waLoading}
                          className="btn-primary"
                          style={{ padding: '9px 18px', fontSize: '13px', backgroundColor: '#10b981', whiteSpace: 'nowrap' }}
                        >
                          {waLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                          <span>Get 8-Digit Code</span>
                        </button>
                      </div>
                    </form>

                    {waPairingCode && (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '2px solid #22c55e',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center',
                        marginBottom: '16px'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Your 8-Digit Pairing Code:
                        </span>
                        <div style={{
                          fontSize: '28px',
                          fontWeight: 900,
                          color: '#0f172a',
                          fontFamily: 'monospace',
                          letterSpacing: '0.15em',
                          margin: '10px 0',
                          backgroundColor: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          display: 'inline-block',
                          border: '1px solid #bbf7d0'
                        }}>
                          {waPairingCode}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(waPairingCode.replace('-', ''));
                              setCopiedPairingCode(true);
                              setTimeout(() => setCopiedPairingCode(false), 2000);
                            }}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {copiedPairingCode ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                            <span>{copiedPairingCode ? 'Copied!' : 'Copy Code'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                      <strong>How to enter code:</strong>
                      <ol style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                        <li>Open WhatsApp on phone &rarr; <strong>Linked Devices</strong></li>
                        <li>Tap <strong>Link a Device</strong> &rarr; Select <strong>Link with phone number instead</strong></li>
                        <li>Enter the 8-digit code shown above</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* LIVE AUTOMATION CONFIG: TRIGGER KEYWORDS & BEHAVIORAL TOPIC PROMPT */}
            {/* ========================================================================= */}
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1.5px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* FIELD 1: AUTO-REPLY POLICY & TRIGGER KEYWORDS */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={15} color="var(--primary)" />
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                      1. Trigger Keywords List &amp; Auto-Reply Filter
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Ignores personal chat</span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                  Define when AI answers on WhatsApp. In Keyword mode, personal casual chats won't trigger AI so you can reply manually.
                </p>

                {/* Professional Segmented Control Mode Toggle (No emojis) */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setWaReplyMode('all')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: waReplyMode === 'all' ? '1px solid #e2e8f0' : 'none',
                      backgroundColor: waReplyMode === 'all' ? '#ffffff' : 'transparent',
                      color: waReplyMode === 'all' ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: waReplyMode === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Zap size={13} color={waReplyMode === 'all' ? '#16a34a' : '#94a3b8'} />
                    <span>All Incoming Messages</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWaReplyMode('keywords')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: waReplyMode === 'keywords' ? '1px solid #e2e8f0' : 'none',
                      backgroundColor: waReplyMode === 'keywords' ? '#ffffff' : 'transparent',
                      color: waReplyMode === 'keywords' ? '#0f172a' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: waReplyMode === 'keywords' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Filter size={13} color={waReplyMode === 'keywords' ? '#4f46e5' : '#94a3b8'} />
                    <span>Keyword Triggers Only</span>
                  </button>
                </div>

                {/* Keywords Chips */}
                {waReplyMode === 'keywords' && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {waKeywords.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#1e293b'
                          }}
                        >
                          <Tag size={10} color="#64748b" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveWaKeyword(tag)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Tag Form */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Add trigger word (e.g. price, website, demo)..."
                        value={waNewKeyword}
                        onChange={(e) => setWaNewKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWaKeyword(); } }}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddWaKeyword}
                        disabled={!waNewKeyword.trim()}
                        className="btn-secondary"
                        style={{ padding: '7px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={12} />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD 2: AI AUTOMATION TOPIC & SYSTEM PROMPT */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={15} color="#7c3aed" />
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                      2. AI Topic &amp; System Instructions (Default Website Pitch)
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
                  Define what topic your AI should answer on WhatsApp. (Includes agency fallback pitch).
                </p>

                {/* Preset Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, alignSelf: 'center' }}>Presets:</span>
                  {waPromptPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWaPrompt(preset.prompt)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={11} color="var(--primary)" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={waPrompt}
                  onChange={(e) => setWaPrompt(e.target.value)}
                  placeholder="Define role, services ($499-$2500), and delivery timeline (3-7 days)..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    lineHeight: 1.45,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* SAVE & APPLY BUTTON */}
              <button
                type="button"
                onClick={handleSaveWaConfig}
                disabled={waSavingRules}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  backgroundColor: waSavedRulesSuccess ? '#16a34a' : 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {waSavingRules ? <RefreshCw size={14} className="animate-spin" /> : (waSavedRulesSuccess ? <Check size={14} /> : <Save size={14} />)}
                <span>{waSavingRules ? 'Saving Settings...' : (waSavedRulesSuccess ? 'Saved & Applied to WhatsApp!' : 'Save & Apply Automation Settings')}</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e4e4e7' }}>
              <button
                type="button"
                onClick={() => { setSetupModal(null); fetchIntegrations(); }}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OMNIROUTE MULTI-KEY GEMINI POOL MODAL */}
      {/* ========================================================================= */}
      {setupModal === 'ai_gateway_modal' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="animate-fade-in" style={{
            width: '640px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '26px 30px',
            border: '1px solid var(--border-subtle)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    OmniRoute Multi-Key Gemini Pool
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Add multiple free Google Gemini API keys for seamless auto-failover
                  </span>
                </div>
              </div>

              <button onClick={() => setSetupModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Client Custom Keys Pool */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                    ACTIVE POOL
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Your Custom Gemini API Keys
                  </h4>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '11.5px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                >
                  <span>Get Free Key from Google AI Studio</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {clientKeys.map((k) => {
                  const testResult = keyTestResults[k.id];
                  const isTesting = testingKeyId === k.id;

                  return (
                    <div key={k.id} style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <Key size={16} color="var(--primary)" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{k.label}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {k.key.substring(0, 12)}••••••••••••••••••••
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {testResult ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: testResult.success ? '#059669' : '#dc2626',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {testResult.success ? `✓ Verified (${testResult.latency_ms}ms)` : '⚠️ Limit/Error'}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#059669',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            ● Active
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleTestSingleKey(k)}
                          disabled={isTesting}
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isTesting ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                          <span>Live Test</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGeminiKey(k.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddGeminiKey} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Key Label (e.g. Gemini Backup #2)"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
                />
                <input
                  type="text"
                  placeholder="Paste Google Gemini API Key"
                  value={newKeyString}
                  onChange={(e) => setNewKeyString(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12.5px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                  <Plus size={13} /> Add Key
                </button>
              </form>
            </div>

            {/* WhatsApp Rate-Limit Alert Notification Phone */}
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Phone size={16} color="#059669" />
                <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#059669', margin: 0 }}>
                  WhatsApp Rate-Limit Alerts
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                Receive instant notifications when your custom Gemini keys reach rate limits or when fallback activates.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  placeholder="+91 98206 46838"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={handleSaveAlertPhone}
                  style={{ backgroundColor: '#10b981', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Save Phone
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSetupModal(null)} className="btn-primary" style={{ padding: '8px 24px', fontSize: '13px' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Google/Gmail Email Dispatch Modal */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div className="animate-fade-in" style={{
            width: '540px',
            maxWidth: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
            padding: '28px',
            border: '1px solid #e4e4e7'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleLogo />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#18181b', margin: 0 }}>
                    Send Email via Google
                  </h3>
                  <span style={{ fontSize: '12px', color: '#71717a' }}>
                    Connected account: sureshpolai63@gmail.com
                  </span>
                </div>
              </div>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                <X size={20} />
              </button>
            </div>

            {emailSuccessMsg ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#166534',
                fontSize: '14px',
                fontWeight: 700
              }}>
                ✓ {emailSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@company.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Body / Proposal Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="btn-secondary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="btn-primary"
                    style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {sendingEmail ? 'Sending via Gmail...' : 'Send Email Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
