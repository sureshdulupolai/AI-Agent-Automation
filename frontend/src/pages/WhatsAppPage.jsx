import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  Globe, 
  Copy, 
  Check, 
  Zap,
  Key,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WhatsAppPage({ bots = [], initialBotId = null, onNavigate }) {
  const [searchParams] = useSearchParams();
  const botIdFromQuery = searchParams.get('botId');
  const [selectedBotId, setSelectedBotId] = useState(botIdFromQuery || initialBotId || (bots[0]?.id || ''));

  useEffect(() => {
    if (botIdFromQuery) setSelectedBotId(botIdFromQuery);
  }, [botIdFromQuery]);
  const [activeTab, setActiveTab] = useState('testing');
  const [connectMethod, setConnectMethod] = useState('pairing-code');
  
  const [statusData, setStatusData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [pairingCodeData, setPairingCodeData] = useState(null);
  const [inputPhoneNumber, setInputPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Chat Tester
  const [simMessage, setSimMessage] = useState('Hi, I need pricing details for your web development package.');
  const [simLogs, setSimLogs] = useState([]);
  const [simulating, setSimulating] = useState(false);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];
  const botNumber = (statusData?.phoneNumber || '+919820646838').replace(/[^0-9]/g, '');
  const prefilledText = encodeURIComponent(`Hi, I want to test my AI agent ${selectedBot?.bot_name || ''}`);
  const whatsappDeepLink = `https://wa.me/${botNumber}?text=${prefilledText}`;

  const fetchStatus = async () => {
    if (!selectedBotId) return;
    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/status`);
      const data = await res.json();
      setStatusData(data);
      if (data.status === 'connected') {
        setQrCodeData(null);
        setPairingCodeData(null);
      }
    } catch (err) {
      console.error('Failed to get WhatsApp status:', err);
    }
  };

  useEffect(() => {
    if (selectedBotId) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedBotId]);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/qr`);
      const data = await res.json();
      if (data.qrCode) {
        setQrCodeData(data.qrCode);
      }
    } catch (err) {
      alert('Error initiating QR scanner: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPairingCode = async () => {
    if (!inputPhoneNumber.trim()) {
      alert('Please enter your WhatsApp mobile number.');
      return;
    }
    setLoading(true);
    setPairingCodeData(null);

    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: inputPhoneNumber.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate code');

      setPairingCodeData(data.pairingCode);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect WhatsApp number from this bot?')) return;
    try {
      await fetch(`/api/whatsapp/${selectedBotId}/disconnect`, { method: 'POST' });
      setStatusData({ status: 'disconnected', phoneNumber: null });
      setQrCodeData(null);
      setPairingCodeData(null);
    } catch (err) {
      alert('Failed to disconnect');
    }
  };

  const handleCopyDeepLink = () => {
    navigator.clipboard.writeText(whatsappDeepLink);
    setCopiedLink(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendSimulation = async (e) => {
    e.preventDefault();
    if (!simMessage.trim() || simulating) return;

    setSimulating(true);
    const userEntry = {
      sender: 'user',
      message: simMessage.trim(),
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [...prev, userEntry]);

    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: '+91 98765 43210',
          messageText: simMessage.trim(),
          senderName: 'WhatsApp Visitor'
        })
      });

      const data = await res.json();
      setSimulating(false);

      if (data.reply) {
        setSimLogs(prev => [
          ...prev,
          {
            sender: 'bot',
            message: data.reply,
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
      setSimMessage('');
    } catch (err) {
      setSimulating(false);
      alert('Simulator error: ' + err.message);
    }
  };

  const isConnected = statusData?.status === 'connected';
  const origin = window.location.origin;
  const webhookUrl = `${origin}/api/webhook/whatsapp`;
  const verifyToken = 'omnibot_verify_token_2026';

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', gap: '6px' }}>
        <span>Channels</span>
        <span>&gt;</span>
        <span>WhatsApp</span>
        <span>&gt;</span>
        <span style={{ color: 'var(--primary)' }}>Testing</span>
      </div>

      {/* Main Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        padding: '3px',
        borderRadius: '8px',
        marginBottom: '20px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('testing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'testing' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'testing' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <MessageSquare size={14} />
          <span>Testing Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('connection')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'connection' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'connection' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Zap size={14} />
          <span>Device Pairing</span>
        </button>

        <button
          onClick={() => setActiveTab('meta')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'meta' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'meta' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Globe size={14} />
          <span>Meta Cloud API</span>
        </button>
      </div>

      {/* TAB 1: CHATZY-STYLE TESTING STUDIO (Image 2) */}
      {activeTab === 'testing' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
          {/* Header Block */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              flexShrink: 0
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Test your AI agent on WhatsApp
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                No setup required. Scan the QR code or open WhatsApp to start chatting.
              </p>
            </div>
          </div>

          {/* AI Agent Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>AI agent</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                className="form-select"
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                style={{ flex: 1, fontSize: '13px', padding: '9px 12px' }}
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bot_name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCopyDeepLink}
                className="btn-primary"
                style={{ padding: '9px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>Get link</span>
              </button>
            </div>
          </div>

          {/* Main QR + Link Grid Card */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: '28px',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Left Corner-Bracketed QR Code */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Scan to start chat
              </span>

              {/* Bracketed Container */}
              <div style={{
                position: 'relative',
                padding: '12px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '2px dashed #4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(whatsappDeepLink)}`}
                  alt="WhatsApp Chat QR"
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>
            </div>

            {/* Right Action Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <a
                  href={whatsappDeepLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Open in WhatsApp</span>
                </a>
              </div>

              {/* Prefilled URL input bar */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  readOnly
                  value={whatsappDeepLink}
                  className="form-input"
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-secondary)'
                  }}
                />
                <button
                  onClick={handleCopyDeepLink}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  <span>Copy</span>
                </button>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Chats with <strong>{statusData?.phoneNumber || '+919820646838'}</strong>. Keep the prefilled message so the AI knows which agent to reply with.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Replies land in your{' '}
            <button
              onClick={() => onNavigate && onNavigate('inbox')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Conversations inbox
            </button>
            . We also auto-qualify customer requirements and log them to Leads CRM.
          </div>
        </div>
      )}

      {/* TAB 2: DEVICE PAIRING ENGINE */}
      {activeTab === 'connection' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} color="#059669" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Account Connection</h3>
            </div>

            <span className={`badge ${isConnected ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {isConnected ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '24px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                WhatsApp Connected
              </h4>
              <p style={{ fontSize: '14px', color: '#059669', fontWeight: 700, marginBottom: '6px' }}>
                {statusData?.phoneNumber || '+91 98206 46838'}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 16px auto' }}>
                Incoming customer messages will automatically receive AI responses powered by Gemini Flash.
              </p>

              <button onClick={handleDisconnect} className="btn-danger" style={{ fontSize: '12.5px', padding: '6px 14px' }}>
                Disconnect Number
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Enter your WhatsApp mobile number to generate a pairing code.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                  placeholder="e.g. 919820646838"
                  value={inputPhoneNumber}
                  onChange={(e) => setInputPhoneNumber(e.target.value)}
                />
                <button
                  onClick={handleRequestPairingCode}
                  disabled={loading || !inputPhoneNumber.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 14px', whiteSpace: 'nowrap', fontSize: '12.5px' }}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Generating...' : 'Get Pairing Code'}</span>
                </button>
              </div>

              {pairingCodeData && (
                <div className="animate-fade-in" style={{
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--primary)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pairing Code
                  </span>

                  <div style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--primary)',
                    letterSpacing: '0.12em',
                    margin: '8px 0'
                  }}>
                    {pairingCodeData}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingCodeData.replace('-', ''));
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    {copiedCode ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: META CLOUD API */}
      {activeTab === 'meta' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Meta WhatsApp Cloud API Configuration
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Configure official Meta Webhook callback and token.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Callback URL</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px', paddingRight: '60px' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="btn-secondary"
                  style={{ position: 'absolute', right: '4px', top: '4px', padding: '4px 8px', fontSize: '11px' }}
                >
                  {copiedWebhook ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Verify Token</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  readOnly
                  value={verifyToken}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px', paddingRight: '60px' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verifyToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="btn-secondary"
                  style={{ position: 'absolute', right: '4px', top: '4px', padding: '4px 8px', fontSize: '11px' }}
                >
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
