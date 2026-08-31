import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { 
  Send, 
  Upload, 
  Download,
  FileSpreadsheet, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Play, 
  Trash2, 
  Users, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  FileText,
  Filter,
  ExternalLink,
  QrCode,
  Edit3,
  Image,
  Paperclip,
  Music,
  FileCheck,
  Zap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 1024 1024" fill="none">
    <circle cx="512" cy="512" r="512" fill="#25D366" />
    <path fill="#ffffff" d="M783.3 243.2C714 173.8 621.8 135.6 523.6 135.6c-202.4 0-367.1 164.7-367.2 367.1-.03 64.7 16.9 127.9 49 183.5L153.3 876.4l194.7-51c53.6 29.2 114 44.7 175.5 44.7h.1c202.4 0 367.1-164.7 367.2-367.1.04-98.1-38.1-190.3-107.5-259.8zM523.5 808h-.1c-54.8-.02-108.5-14.7-155.3-42.5l-11.1-6.6-115.5 30.3 30.8-112.6-7.3-11.5C234.6 616.5 218.4 560.4 218.5 502.7c.07-168.2 137-305.1 305.3-305.1 81.5.03 158.2 31.8 215.8 89.5s89.3 134.3 89.3 215.9c-.07 168.2-137 305.1-305.4 305.1zm167.4-228.5c-9.2-4.6-54.3-26.8-62.7-29.8-8.4-3.1-14.5-4.6-20.6 4.6-6.1 9.2-23.7 29.8-29.1 36-5.4 6.1-10.7 6.9-19.9 2.3-9.2-4.6-38.7-14.3-73.8-45.5-27.3-24.3-45.7-54.4-51-63.5-5.4-9.2-.6-14.1 4-18.7 4.1-4.1 9.2-10.7 13.8-16.1 4.6-5.4 6.1-9.2 9.2-15.3 3.1-6.1 1.5-11.5-.8-16.1-2.3-4.6-20.6-49.7-28.3-68.1-7.4-17.9-15-15.5-20.6-15.7-5.3-.3-11.5-.3-17.6-.3s-16.1 2.3-24.5 11.5-32.1 31.4-32.1 76.5c0 45.1 32.9 88.8 37.5 94.9 4.6 6.1 64.7 98.8 156.7 138.5 21.9 9.5 39 15.1 52.3 19.3 22 7 42 6 57.8 3.6 17.6-2.6 54.3-22.2 61.9-43.6 7.6-21.4 7.6-39.8 5.4-43.6-2.3-3.8-8.4-6.1-17.6-10.7z" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"/>
  </svg>
);

export default function CampaignsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp', 'email', 'history'
  const [campaigns, setCampaigns] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState(null);

  // Channel Connection Status
  const [waConnected, setWaConnected] = useState(false);
  const [waBotName, setWaBotName] = useState('OmniBot AI');
  const [googleConnected, setGoogleConnected] = useState(true);
  const [googleUserEmail, setGoogleUserEmail] = useState('sureshpolai63@gmail.com');

  // Common Builder State
  const [campaignName, setCampaignName] = useState('');
  const [scheduleType, setScheduleType] = useState('now'); // 'now', 'scheduled'
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // WhatsApp Builder State
  const [waAudienceMode, setWaAudienceMode] = useState('excel'); // 'excel', 'manual'
  const [waManualTo, setWaManualTo] = useState('');
  const [waManualName, setWaManualName] = useState('');
  const [waFile, setWaFile] = useState(null);
  const [waFileName, setWaFileName] = useState('');
  const [waParsedRows, setWaParsedRows] = useState([]);
  const [waHeaders, setWaHeaders] = useState([]);
  const [waPhoneCol, setWaPhoneCol] = useState('');
  const [waNameCol, setWaNameCol] = useState('');
  const [waMessageCol, setWaMessageCol] = useState('');
  const [waDateCol, setWaDateCol] = useState('');
  const [waAttachment, setWaAttachment] = useState(null); // { name, size, mimetype, data }
  const [waTemplate, setWaTemplate] = useState(
    'Hello {{name}},\n\nHope you are doing well!\n\nI am reaching out from NovaByte AI Studio. We specialize in building fast, high-converting custom websites and autonomous 24/7 AI WhatsApp Chatbots.\n\n🚀 Our Core Services:\n• Full-Stack Custom Websites & Modern Web Apps\n• Autonomous WhatsApp AI Chatbots & Lead Capture\n• Fast Turnaround (3 to 7 Days)\n\nWould you like to see a quick 2-minute live demo tailored for your business?\n\nBest regards,\nNovaByte AI Studio\nWeb & AI Automation Team'
  );

  // Email Builder State
  const [emailAudienceMode, setEmailAudienceMode] = useState('excel'); // 'excel', 'manual'
  const [emailManualTo, setEmailManualTo] = useState('');
  const [emailManualName, setEmailManualName] = useState('');
  const [emailFile, setEmailFile] = useState(null);
  const [emailFileName, setEmailFileName] = useState('');
  const [emailParsedRows, setEmailParsedRows] = useState([]);
  const [emailHeaders, setEmailHeaders] = useState([]);
  const [emailCol, setEmailCol] = useState('');
  const [emailNameCol, setEmailNameCol] = useState('');
  const [emailMsgCol, setEmailMsgCol] = useState('');
  const [emailDateCol, setEmailDateCol] = useState('');
  const [emailAttachment, setEmailAttachment] = useState(null); // { name, size, mimetype, data }
  const [emailSubject, setEmailSubject] = useState('Custom Web & AI Automation Solutions for {{name}}');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(
    'Hello {{name}},\n\nI hope this email finds you well.\n\nI am reaching out from NovaByte AI Studio. We help growing businesses scale through high-performance modern websites and autonomous 24/7 AI chatbots.\n\nHere is how we can help elevate your digital presence:\n1. Modern Responsive Website – Built for lightning speed, SEO, and lead conversions.\n2. Autonomous WhatsApp AI Assistant – Automatically answers inquiries, qualifies leads, and books appointments 24/7.\n3. Complete Turnaround – Ready in 3 to 7 business days with end-to-end deployment.\n\nWould you be open for a brief 10-minute discovery call this week to explore how we can support your growth?\n\nBest regards,\n\nNovaByte AI Engineering Team\nOfficial Channel: sureshpolai63@gmail.com'
  );

  const fileInputRefWa = useRef(null);
  const fileInputRefEmail = useRef(null);
  const mediaInputRefWa = useRef(null);
  const mediaInputRefEmail = useRef(null);

  // Check Channel Connections (WhatsApp & Google)
  const checkConnections = async () => {
    try {
      // Check WhatsApp bot status
      const resBots = await fetch('/api/bots');
      const botsData = await resBots.json();
      if (botsData.bots && botsData.bots.length > 0) {
        const primaryBot = botsData.bots[0];
        setWaBotName(primaryBot.bot_name || primaryBot.name || 'OmniBot AI');
        // Check bot WA status
        const resWa = await fetch(`/api/whatsapp/${primaryBot.id}/status`);
        const waData = await resWa.json();
        setWaConnected(waData.connected === true || waData.status === 'connected');
      }

      // Check Google integration status
      const resIntegrations = await fetch('/api/integrations');
      const intData = await resIntegrations.json();
      if (intData.integrations) {
        const googleInt = intData.integrations.find(i => i.id === 'google');
        if (googleInt && googleInt.connected) {
          setGoogleConnected(true);
          if (googleInt.config?.user_email) {
            setGoogleUserEmail(googleInt.config.user_email);
          }
        }
      }
    } catch (e) {
      console.log('Connection check:', e.message);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error('Error fetching campaigns:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkConnections();
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Media Attachment (Images, PDF, Audio, Docs)
  const handleMediaUpload = (file, channel) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 15MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const attachmentObj = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimetype: file.type || 'application/octet-stream',
        data: base64Data
      };
      if (channel === 'whatsapp') {
        setWaAttachment(attachmentObj);
      } else {
        setEmailAttachment(attachmentObj);
      }
    };
    reader.readAsDataURL(file);
  };

  // Download Sample Excel Template for WhatsApp
  const handleDownloadWhatsAppSample = () => {
    const sampleData = [
      {
        "Phone Number": "+91 98206 46838",
        "Contact Name": "Suresh Polai",
        "Custom Message": "Hi Suresh, your custom AI bot package is ready for deployment!",
        "Schedule Date & Time": "2026-09-01 10:30"
      },
      {
        "Phone Number": "+91 70081 24564",
        "Contact Name": "Ashish Sharma",
        "Custom Message": "Hi Ashish, here is the website proposal we discussed.",
        "Schedule Date & Time": "2026-09-01 11:00"
      },
      {
        "Phone Number": "+91 98765 43210",
        "Contact Name": "Rohit Verma",
        "Custom Message": "Hello Rohit, thank you for contacting us regarding e-commerce development.",
        "Schedule Date & Time": ""
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WhatsApp_Audience");
    XLSX.writeFile(wb, "whatsapp_broadcast_template.xlsx");
  };

  // Download Sample Excel Template for Email
  const handleDownloadEmailSample = () => {
    const sampleData = [
      {
        "Email Address": "ashish.sharma@gmail.com",
        "Contact Name": "Ashish Sharma",
        "Subject": "Custom Web & AI Automation Proposal for Ashish",
        "Custom Message": "Hi Ashish,\n\nWe offer full-stack website development and custom WhatsApp chatbots.\n\nBest regards,\nSuresh Polai",
        "Schedule Date & Time": "2026-09-01 10:30"
      },
      {
        "Email Address": "rohit.verma@company.com",
        "Contact Name": "Rohit Verma",
        "Subject": "Exclusive AI Bot Demo for Rohit",
        "Custom Message": "Hi Rohit,\n\nHere is the live demo link for your automated customer support bot.\n\nBest regards,\nSuresh Polai",
        "Schedule Date & Time": "2026-09-01 11:00"
      },
      {
        "Email Address": "client@enterprise.com",
        "Contact Name": "Priya Patel",
        "Subject": "Web Development Inquiry",
        "Custom Message": "Hi Priya, let us know when you'd like to schedule a 10-minute discovery call.",
        "Schedule Date & Time": ""
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Email_Audience");
    XLSX.writeFile(wb, "email_campaign_template.xlsx");
  };

  // Handle Excel/CSV File Upload for WhatsApp
  const handleFileUploadWa = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setWaFileName(file.name);
    setWaFile(file);
    if (!campaignName) {
      setCampaignName(`WhatsApp Broadcast - ${file.name.replace(/\.[^/.]+$/, "")}`);
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

        if (rows.length === 0) {
          alert('The uploaded sheet is empty!');
          return;
        }

        const headers = Object.keys(rows[0]);
        setWaHeaders(headers);
        setWaParsedRows(rows);

        const phoneKey = headers.find(h => /phone|mobile|contact|tel|wa|number/i.test(h)) || headers[0];
        const nameKey = headers.find(h => /name|client|customer|lead/i.test(h)) || '';
        const msgKey = headers.find(h => /message|text|msg|notes|requirement/i.test(h)) || '';
        const dateKey = headers.find(h => /date|time|schedule|datetime/i.test(h)) || '';

        setWaPhoneCol(phoneKey);
        setWaNameCol(nameKey);
        setWaMessageCol(msgKey);
        setWaDateCol(dateKey);
      } catch (err) {
        alert('Error parsing spreadsheet: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Excel/CSV File Upload for Email
  const handleFileUploadEmail = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEmailFileName(file.name);
    setEmailFile(file);
    if (!campaignName) {
      setCampaignName(`Email Campaign - ${file.name.replace(/\.[^/.]+$/, "")}`);
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

        if (rows.length === 0) {
          alert('The uploaded sheet is empty!');
          return;
        }

        const headers = Object.keys(rows[0]);
        setEmailHeaders(headers);
        setEmailParsedRows(rows);

        const emailKey = headers.find(h => /email|mail|address/i.test(h)) || headers[0];
        const nameKey = headers.find(h => /name|client|customer|lead/i.test(h)) || '';
        const msgKey = headers.find(h => /message|text|body|notes|requirement/i.test(h)) || '';
        const dateKey = headers.find(h => /date|time|schedule|datetime/i.test(h)) || '';

        setEmailCol(emailKey);
        setEmailNameCol(nameKey);
        setEmailMsgCol(msgKey);
        setEmailDateCol(dateKey);
      } catch (err) {
        alert('Error parsing spreadsheet: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit WhatsApp Campaign
  const handleSubmitWhatsAppCampaign = async (e) => {
    e.preventDefault();

    let recipients = [];

    if (waAudienceMode === 'excel') {
      if (!waParsedRows || waParsedRows.length === 0) {
        alert('Please upload an Excel or CSV file containing contact numbers.');
        return;
      }
      recipients = waParsedRows.map(row => ({
        phone: row[waPhoneCol] || '',
        name: waNameCol ? row[waNameCol] : '',
        message: waMessageCol ? row[waMessageCol] : '',
        scheduled_at: waDateCol && row[waDateCol] ? row[waDateCol] : null,
        ...row
      })).filter(r => r.phone && String(r.phone).trim().length > 5);
    } else {
      if (!waManualTo.trim()) {
        alert('Please enter at least one recipient phone number in the To: field.');
        return;
      }
      const rawNumbers = waManualTo.split(/[\n,;]+/).map(n => n.trim()).filter(n => n.length > 5);
      if (rawNumbers.length === 0) {
        alert('Please enter valid mobile numbers.');
        return;
      }
      recipients = rawNumbers.map((num, idx) => ({
        phone: num,
        name: waManualName.trim() || ''
      }));
    }

    if (recipients.length === 0) {
      alert('No valid phone numbers found.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName.trim() || `WhatsApp Broadcast (${recipients.length} recipients)`,
          channel: 'whatsapp',
          recipients,
          message_template: waTemplate,
          attachment: waAttachment,
          scheduled_at: scheduleType === 'scheduled' ? scheduledDateTime : null
        })
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        alert(`✓ ${data.message}`);
        setWaParsedRows([]);
        setWaFile(null);
        setWaFileName('');
        setWaManualTo('');
        setWaManualName('');
        setWaAttachment(null);
        setCampaignName('');
        fetchCampaigns();
        setActiveTab('history');
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      alert('Error creating campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Email Campaign
  const handleSubmitEmailCampaign = async (e) => {
    e.preventDefault();

    let recipients = [];

    if (emailAudienceMode === 'excel') {
      if (!emailParsedRows || emailParsedRows.length === 0) {
        alert('Please upload an Excel or CSV file containing email addresses.');
        return;
      }
      recipients = emailParsedRows.map(row => ({
        email: row[emailCol] || '',
        name: emailNameCol ? row[emailNameCol] : '',
        message: emailMsgCol ? row[emailMsgCol] : '',
        scheduled_at: emailDateCol && row[emailDateCol] ? row[emailDateCol] : null,
        ...row
      })).filter(r => r.email && String(r.email).includes('@'));
    } else {
      if (!emailManualTo.trim()) {
        alert('Please enter at least one recipient email address in the To: field.');
        return;
      }
      const rawEmails = emailManualTo.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@'));
      if (rawEmails.length === 0) {
        alert('Please enter valid email addresses.');
        return;
      }
      recipients = rawEmails.map((em, idx) => ({
        email: em,
        name: emailManualName.trim() || ''
      }));
    }

    if (recipients.length === 0) {
      alert('No valid email addresses found.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName.trim() || `Email Outreach (${recipients.length} recipients)`,
          channel: 'email',
          recipients,
          subject: emailSubject,
          message_template: emailTemplate,
          attachment: emailAttachment,
          scheduled_at: scheduleType === 'scheduled' ? scheduledDateTime : null
        })
      });

      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        alert(`✓ ${data.message}`);
        setEmailParsedRows([]);
        setEmailFile(null);
        setEmailFileName('');
        setEmailManualTo('');
        setEmailManualName('');
        setEmailAttachment(null);
        setCampaignName('');
        fetchCampaigns();
        setActiveTab('history');
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      alert('Error creating campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Scheduled Campaign
  const handleCancelCampaign = async (id) => {
    if (!window.confirm('Cancel this scheduled campaign?')) return;
    try {
      const res = await fetch(`/api/campaigns/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchCampaigns();
      } else {
        alert(data.error || 'Failed to cancel');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // Delete Campaign Record
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign record?')) return;
    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      fetchCampaigns();
    } catch (e) {}
  };

  // Calculated recipient count
  const waRecipientCount = waAudienceMode === 'excel' ? waParsedRows.length : waManualTo.split(/[\n,;]+/).filter(x => x.trim().length > 5).length;
  const emailRecipientCount = emailAudienceMode === 'excel' ? emailParsedRows.length : emailManualTo.split(/[\n,;]+/).filter(x => x.trim().includes('@')).length;

  return (
    <div style={{ padding: '24px 32px', width: '100%', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Broadcasts &amp; Campaigns
            </h1>
            <span style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '11.5px', fontWeight: 800 }}>
              Omni-Channel Engine
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
            Broadcast multimedia messages, PDFs &amp; dynamic proposals across WhatsApp and Gmail with instant or scheduled execution.
          </p>
        </div>

        {/* Quick Tabs Switcher */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          backgroundColor: '#e2e8f0', 
          padding: '4px', 
          borderRadius: '12px', 
          gap: '4px',
          flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeTab === 'whatsapp' ? '#ffffff' : 'transparent',
              color: activeTab === 'whatsapp' ? '#15803d' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeTab === 'whatsapp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <WhatsAppIcon />
            <span>WhatsApp Bulk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeTab === 'email' ? '#ffffff' : 'transparent',
              color: activeTab === 'email' ? '#4338ca' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeTab === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <GoogleLogo />
            <span>Email Campaigns</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: activeTab === 'history' ? '#ffffff' : 'transparent',
              color: activeTab === 'history' ? '#0f172a' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={15} />
            <span>History &amp; Scheduled ({campaigns.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WHATSAPP BULK EXCEL & MULTIMEDIA CAMPAIGNER                       */}
      {/* ========================================================================= */}
      {activeTab === 'whatsapp' && (
        <div>
          {!waConnected ? (
            /* Connection Gate: WhatsApp Disconnected Screen */
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #fed7aa', padding: '48px 32px', textAlign: 'center', maxWidth: '680px', margin: '20px auto', boxShadow: '0 4px 20px rgba(234, 88, 12, 0.08)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <QrCode size={34} color="#ea580c" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
                Connect WhatsApp to Unlock Broadcasting
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                Scan your WhatsApp QR code once to enable bulk WhatsApp broadcasts, image/PDF attachments, automatic lead follow-ups, and scheduled messaging.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px', textAlign: 'left' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>⚡ 98% Open Rates</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Direct delivery to client WhatsApp</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>📎 Media &amp; PDF</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Attach brochures, quotes &amp; voice</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>🕒 Auto Scheduler</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Background date &amp; time engine</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/channels/whatsapp')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(234, 88, 12, 0.3)' }}
              >
                <QrCode size={18} />
                <span>Pair WhatsApp with QR Code</span>
              </button>
            </div>
          ) : (
            /* Connected State: Unlocked Full Composer */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '10px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <WhatsAppIcon />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                    Connected WhatsApp Dispatcher: <strong>{waBotName}</strong>
                  </span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                    ● Connected &amp; Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/channels/whatsapp')}
                  style={{ background: 'transparent', border: 'none', color: '#16a34a', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Manage Channel</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Left Column: Audience Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* Mode Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                          1
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Select WhatsApp Audience
                        </h3>
                      </div>

                      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => setWaAudienceMode('excel')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: waAudienceMode === 'excel' ? '#ffffff' : 'transparent',
                            color: waAudienceMode === 'excel' ? '#15803d' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: waAudienceMode === 'excel' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          📁 Excel File
                        </button>
                        <button
                          type="button"
                          onClick={() => setWaAudienceMode('manual')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: waAudienceMode === 'manual' ? '#ffffff' : 'transparent',
                            color: waAudienceMode === 'manual' ? '#15803d' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: waAudienceMode === 'manual' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          ✍️ Direct Phone(s)
                        </button>
                      </div>
                    </div>

                    {/* Option A: Excel Upload */}
                    {waAudienceMode === 'excel' ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                          <button
                            type="button"
                            onClick={handleDownloadWhatsAppSample}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #bbf7d0',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={12} />
                            <span>Download Sample Template</span>
                          </button>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRefWa}
                          accept=".xlsx, .xls, .csv"
                          onChange={handleFileUploadWa}
                          style={{ display: 'none' }}
                        />

                        <div
                          onClick={() => fileInputRefWa.current?.click()}
                          style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '30px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        >
                          <FileSpreadsheet size={36} color="#22c55e" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                            {waFileName ? waFileName : 'Click to select .xlsx, .xls, or .csv file'}
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Supports Phone, Name, Custom Message, and Scheduled Date columns
                          </p>
                        </div>

                        {waParsedRows.length > 0 && (
                          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} color="#16a34a" />
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                                {waParsedRows.length} Contacts Successfully Parsed
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                              {waHeaders.length} Columns Detected
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Option B: Manual Direct Phone Entry */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            To: Recipient Mobile Number(s) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="+91 98206 46838, +91 70081 24564"
                            value={waManualTo}
                            onChange={(e) => setWaManualTo(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                            Enter 1 or multiple phone numbers separated by comma or new lines.
                          </span>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Recipient Name (Optional for {'{{name}}'})
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ashish Sharma"
                            value={waManualName}
                            onChange={(e) => setWaManualName(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Intelligent Field Mapping (if Excel mode) */}
                  {waAudienceMode === 'excel' && waParsedRows.length > 0 && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                          2
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Verify &amp; Map Spreadsheet Columns
                        </h3>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Mobile / WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={waPhoneCol}
                            onChange={(e) => setWaPhoneCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            {waHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Contact Name (for {'{{name}}'})
                          </label>
                          <select
                            value={waNameCol}
                            onChange={(e) => setWaNameCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- None (use default 'Client') --</option>
                            {waHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Custom Message (optional override)
                          </label>
                          <select
                            value={waMessageCol}
                            onChange={(e) => setWaMessageCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- Use Campaign Template Below --</option>
                            {waHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Schedule Date / Time Column
                          </label>
                          <select
                            value={waDateCol}
                            onChange={(e) => setWaDateCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- Use Campaign Scheduler Below --</option>
                            {waHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Message Template, Attachments & Schedule Dispatch */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                      {waAudienceMode === 'excel' ? '3' : '2'}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Compose Message &amp; Dispatch
                    </h3>
                  </div>

                  {/* Sender & Recipient Summary Bar */}
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748b' }}>From (Sender):</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{waBotName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                      <span style={{ color: '#64748b' }}>To (Recipients):</span>
                      <span style={{ fontWeight: 700, color: waRecipientCount > 0 ? '#16a34a' : '#ef4444' }}>
                        {waRecipientCount > 0 ? `${waRecipientCount} Contact(s) Selected` : 'No recipients yet'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP Summer Promotion 2026"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        WhatsApp Message Template
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Use tag: <code style={{ color: '#22c55e', fontWeight: 700 }}>{'{{name}}'}</code>
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={waTemplate}
                      onChange={(e) => setWaTemplate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* Multimedia Attachment Dropzone */}
                  <div>
                    <input
                      type="file"
                      ref={mediaInputRefWa}
                      accept="image/*, application/pdf, .doc, .docx, audio/*"
                      onChange={(e) => handleMediaUpload(e.target.files[0], 'whatsapp')}
                      style={{ display: 'none' }}
                    />

                    {waAttachment ? (
                      <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCheck size={16} color="#16a34a" />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#166534' }}>{waAttachment.name}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({waAttachment.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWaAttachment(null)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => mediaInputRefWa.current?.click()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            backgroundColor: '#f8fafc',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <Paperclip size={13} />
                          <span>Attach Image, PDF or Audio</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Schedule Mode Selector */}
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Dispatch Timing
                    </label>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="wa_sched"
                          checked={scheduleType === 'now'}
                          onChange={() => setScheduleType('now')}
                        />
                        <span>Send Immediately</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="wa_sched"
                          checked={scheduleType === 'scheduled'}
                          onChange={() => setScheduleType('scheduled')}
                        />
                        <span>Schedule for Later</span>
                      </label>
                    </div>

                    {scheduleType === 'scheduled' && (
                      <input
                        type="datetime-local"
                        required
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitWhatsAppCampaign}
                    disabled={isSubmitting || waRecipientCount === 0}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#22c55e',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: (isSubmitting || waRecipientCount === 0) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.35)',
                      opacity: (isSubmitting || waRecipientCount === 0) ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Processing Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>
                          {scheduleType === 'scheduled' ? 'Schedule WhatsApp Campaign' : `Launch Broadcast (${waRecipientCount} Contacts)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMAIL BULK EXCEL & ATTACHMENT CAMPAIGNER                           */}
      {/* ========================================================================= */}
      {activeTab === 'email' && (
        <div>
          {!googleConnected ? (
            /* Connection Gate: Google Disconnected Screen */
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #c7d2fe', padding: '48px 32px', textAlign: 'center', maxWidth: '680px', margin: '20px auto', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.08)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <GoogleLogo />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
                Connect Google Account to Unlock Email Outreach
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                Authenticate with your official Gmail account to send high-deliverability dynamic proposals, PDF attachments, and automated multi-step nurture drip emails.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px', textAlign: 'left' }}>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>✉️ Official Gmail API</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>RFC 2822 inbox delivery</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>📊 Google Sheets Sync</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Live lead export to Docs</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>📎 Attach Proposals</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Deliver PDFs &amp; project docs</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/integrations')}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}
              >
                <GoogleLogo />
                <span>Connect Google Workspace / Gmail</span>
              </button>
            </div>
          ) : (
            /* Connected State: Unlocked Full Email Composer */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '10px 18px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GoogleLogo />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3' }}>
                    Connected Gmail Sender: <strong>{googleUserEmail}</strong>
                  </span>
                  <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                    ● Authenticated
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/integrations')}
                  style={{ background: 'transparent', border: 'none', color: '#4338ca', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Manage Integration</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                {/* Left Column: Audience Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* Mode Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                          1
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Select Email Audience
                        </h3>
                      </div>

                      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => setEmailAudienceMode('excel')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: emailAudienceMode === 'excel' ? '#ffffff' : 'transparent',
                            color: emailAudienceMode === 'excel' ? '#4338ca' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: emailAudienceMode === 'excel' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          📁 Excel File
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailAudienceMode('manual')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: emailAudienceMode === 'manual' ? '#ffffff' : 'transparent',
                            color: emailAudienceMode === 'manual' ? '#4338ca' : '#64748b',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: emailAudienceMode === 'manual' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          ✍️ Direct Email(s)
                        </button>
                      </div>
                    </div>

                    {/* Option A: Excel Upload */}
                    {emailAudienceMode === 'excel' ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                          <button
                            type="button"
                            onClick={handleDownloadEmailSample}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #c7d2fe',
                              backgroundColor: '#eef2ff',
                              color: '#4338ca',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={12} />
                            <span>Download Sample Template</span>
                          </button>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRefEmail}
                          accept=".xlsx, .xls, .csv"
                          onChange={handleFileUploadEmail}
                          style={{ display: 'none' }}
                        />

                        <div
                          onClick={() => fileInputRefEmail.current?.click()}
                          style={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '30px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.backgroundColor = '#eef2ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        >
                          <FileSpreadsheet size={36} color="#4f46e5" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                            {emailFileName ? emailFileName : 'Click to select .xlsx, .xls, or .csv file'}
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                            Supports Email, Name, Custom Subject, Body, and Schedule Date columns
                          </p>
                        </div>

                        {emailParsedRows.length > 0 && (
                          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} color="#4f46e5" />
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3' }}>
                                {emailParsedRows.length} Email Recipients Parsed
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600 }}>
                              {emailHeaders.length} Columns Detected
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Option B: Manual Direct Email Entry */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            To: Recipient Email Address(es) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="client@example.com, partner@company.com"
                            value={emailManualTo}
                            onChange={(e) => setEmailManualTo(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>
                            Enter 1 or multiple emails separated by comma or new lines.
                          </span>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Recipient Name (Optional for {'{{name}}'})
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ashish Sharma"
                            value={emailManualName}
                            onChange={(e) => setEmailManualName(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Intelligent Field Mapping (if Excel mode) */}
                  {emailAudienceMode === 'excel' && emailParsedRows.length > 0 && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                          2
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Map Email Columns
                        </h3>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Recipient Email Column <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={emailCol}
                            onChange={(e) => setEmailCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            {emailHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Contact Name (for {'{{name}}'})
                          </label>
                          <select
                            value={emailNameCol}
                            onChange={(e) => setEmailNameCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- None (use default 'Client') --</option>
                            {emailHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Custom Message Override (optional)
                          </label>
                          <select
                            value={emailMsgCol}
                            onChange={(e) => setEmailMsgCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- Use Email Proposal Below --</option>
                            {emailHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Schedule Date / Time Column
                          </label>
                          <select
                            value={emailDateCol}
                            onChange={(e) => setEmailDateCol(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          >
                            <option value="">-- Use Campaign Scheduler Below --</option>
                            {emailHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Email Proposal Composer & Attachments */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                      {emailAudienceMode === 'excel' ? '3' : '2'}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Compose Email &amp; Launch
                    </h3>
                  </div>

                  {/* Sender & Recipient Summary Bar */}
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748b' }}>From (Sender):</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{googleUserEmail}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                      <span style={{ color: '#64748b' }}>To (Recipients):</span>
                      <span style={{ fontWeight: 700, color: emailRecipientCount > 0 ? '#4338ca' : '#ef4444' }}>
                        {emailRecipientCount > 0 ? `${emailRecipientCount} Contact(s) Selected` : 'No recipients yet'}
                      </span>
                    </div>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        CC (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="team@example.com"
                        value={emailCc}
                        onChange={(e) => setEmailCc(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        BCC (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="archive@example.com"
                        value={emailBcc}
                        onChange={(e) => setEmailBcc(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Email Proposal Content
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Use tag: <code style={{ color: '#4f46e5', fontWeight: 700 }}>{'{{name}}'}</code>
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* Email Media Attachment Dropzone */}
                  <div>
                    <input
                      type="file"
                      ref={mediaInputRefEmail}
                      accept="image/*, application/pdf, .doc, .docx, audio/*"
                      onChange={(e) => handleMediaUpload(e.target.files[0], 'email')}
                      style={{ display: 'none' }}
                    />

                    {emailAttachment ? (
                      <div style={{ padding: '10px 14px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCheck size={16} color="#4f46e5" />
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#3730a3' }}>{emailAttachment.name}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({emailAttachment.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEmailAttachment(null)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => mediaInputRefEmail.current?.click()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            backgroundColor: '#f8fafc',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          <Paperclip size={13} />
                          <span>Attach PDF Proposal, Image, or Doc</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Schedule Mode Selector */}
                  <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Dispatch Timing
                    </label>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="email_sched"
                          checked={scheduleType === 'now'}
                          onChange={() => setScheduleType('now')}
                        />
                        <span>Send Immediately</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="email_sched"
                          checked={scheduleType === 'scheduled'}
                          onChange={() => setScheduleType('scheduled')}
                        />
                        <span>Schedule for Later</span>
                      </label>
                    </div>

                    {scheduleType === 'scheduled' && (
                      <input
                        type="datetime-local"
                        required
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitEmailCampaign}
                    disabled={isSubmitting || emailRecipientCount === 0}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: (isSubmitting || emailRecipientCount === 0) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: (isSubmitting || emailRecipientCount === 0) ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Processing Email Campaign...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>
                          {scheduleType === 'scheduled' ? 'Schedule Email Campaign' : `Launch Email Campaign (${emailRecipientCount} Contacts)`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CAMPAIGN HISTORY & SCHEDULED QUEUE                                 */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Campaign Deliveries &amp; Scheduled Queue
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                Track delivery rates, inspect recipient logs, and manage scheduled automated jobs.
              </p>
            </div>

            <button
              onClick={fetchCampaigns}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <Send size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>No campaigns launched yet</div>
              <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
                Upload an Excel sheet or enter contacts in WhatsApp/Email tabs above to launch your first broadcast!
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Campaign Name</th>
                    <th style={{ padding: '12px 16px' }}>Channel</th>
                    <th style={{ padding: '12px 16px' }}>Attachment</th>
                    <th style={{ padding: '12px 16px' }}>Recipients</th>
                    <th style={{ padding: '12px 16px' }}>Delivery Rate</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Timing</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const total = c.stats?.total || c.recipients?.length || 0;
                    const sent = c.stats?.sent || 0;
                    const failed = c.stats?.failed || 0;

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {c.name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.channel === 'whatsapp' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                              <WhatsAppIcon /> WhatsApp
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4338ca', fontWeight: 700 }}>
                              <GoogleLogo /> Email (Gmail)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.attachment ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                              <Paperclip size={13} color="#4f46e5" />
                              <span>{c.attachment.name}</span>
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Text Only</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                          {total} Contacts
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.status === 'completed' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#16a34a', fontWeight: 700 }}>{sent} Sent</span>
                              {failed > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>({failed} Failed)</span>}
                            </div>
                          ) : c.status === 'scheduled' ? (
                            <span style={{ color: '#64748b' }}>Pending schedule</span>
                          ) : (
                            <span style={{ color: '#eab308', fontWeight: 600 }}>Processing...</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.status === 'completed' && (
                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                              ● Completed
                            </span>
                          )}
                          {c.status === 'scheduled' && (
                            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                              🕒 Scheduled
                            </span>
                          )}
                          {c.status === 'running' && (
                            <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                              ⚡ Running
                            </span>
                          )}
                          {c.status === 'cancelled' && (
                            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700 }}>
                              ✕ Cancelled
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                          {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : new Date(c.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {c.logs && c.logs.length > 0 && (
                              <button
                                onClick={() => setSelectedCampaignLogs(c)}
                                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                View Logs
                              </button>
                            )}

                            {c.status === 'scheduled' && (
                              <button
                                onClick={() => handleCancelCampaign(c.id)}
                                style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff1f2', color: '#e11d48', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recipient Logs Modal */}
      {selectedCampaignLogs && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div className="animate-fade-in" style={{ width: '600px', maxWidth: '100%', maxHeight: '80vh', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedCampaignLogs.name} - Detailed Logs
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedCampaignLogs.logs?.length || 0} recipient records
                </span>
              </div>
              <button onClick={() => setSelectedCampaignLogs(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px' }}>Recipient</th>
                    <th style={{ padding: '8px' }}>Name</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaignLogs.logs?.map((l, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontWeight: 600, color: '#0f172a' }}>{l.recipient}</td>
                      <td style={{ padding: '8px', color: '#334155' }}>{l.name || '-'}</td>
                      <td style={{ padding: '8px' }}>
                        {l.status === 'sent' ? (
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Delivered</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>✕ {l.error || 'Failed'}</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', fontSize: '11.5px', color: '#94a3b8' }}>
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => setSelectedCampaignLogs(null)} className="btn-primary" style={{ padding: '6px 18px', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
