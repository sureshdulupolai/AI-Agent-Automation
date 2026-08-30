import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Globe, 
  Copy, 
  Check, 
  Sliders, 
  Zap,
  Sparkles,
  Key,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WhatsAppPage({ bots = [], initialBotId = null }) {
  const [selectedBotId, setSelectedBotId] = useState(initialBotId || (bots[0]?.id || ''));
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'meta'
  const [connectMethod, setConnectMethod] = useState('pairing-code'); // 'pairing-code' or 'qr-scan'
  
  const [statusData, setStatusData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [pairingCodeData, setPairingCodeData] = useState(null);
  const [inputPhoneNumber, setInputPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // WhatsApp Simulator State
  const [simSenderPhone, setSimSenderPhone] = useState('+91 98765 43210');
  const [simMessage, setSimMessage] = useState('Hi, I need pricing details for your web development package.');
  const [simLogs, setSimLogs] = useState([]);
  const [simulating, setSimulating] = useState(false);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];

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

  // Poll status every 3 seconds while in pairing state
  useEffect(() => {
    if (selectedBotId) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedBotId]);

  // Request 8-Digit Pairing Code
  const handleRequestPairingCode = async () => {
    if (!selectedBotId || !inputPhoneNumber.trim()) {
      alert('Please enter your WhatsApp Phone Number (e.g. 919876543210)');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/whatsapp/${selectedBotId}/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: inputPhoneNumber.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request pairing code');

      setPairingCodeData(data.pairingCode);
      setQrCodeData(null);
      fetchStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate QR Code
  const handleGenerateQR = async () => {
    if (!selectedBotId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/whatsapp/${selectedBotId}/qr`);
      const data = await res.json();
      setQrCodeData(data.qrCode);
      setPairingCodeData(null);
      fetchStatus();
    } catch (err) {
      alert('Failed to generate WhatsApp QR');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    if (!selectedBotId) return;
    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: inputPhoneNumber || '+91 98765 43210' })
      });
      if (res.ok) {
        confetti({ particleCount: 50, spread: 70 });
        setQrCodeData(null);
        setPairingCodeData(null);
        fetchStatus();
      }
    } catch (err) {
      alert('Failed to connect WhatsApp');
    }
  };

  const handleDisconnect = async () => {
    if (!selectedBotId) return;
    try {
      await fetch(`/api/whatsapp/${selectedBotId}/disconnect`, { method: 'POST' });
      setQrCodeData(null);
      setPairingCodeData(null);
      fetchStatus();
    } catch (err) {
      alert('Failed to disconnect');
    }
  };

  const handleRunSimulator = async () => {
    if (!selectedBotId || !simMessage.trim()) return;
    setSimulating(true);

    const userEntry = {
      sender: 'user',
      phone: simSenderPhone,
      message: simMessage.trim(),
      time: new Date().toLocaleTimeString()
    };
    setSimLogs(prev => [...prev, userEntry]);

    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: simSenderPhone,
          messageText: simMessage.trim(),
          senderName: 'WhatsApp Lead'
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
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', color: '#ffffff', marginBottom: '6px' }}>
            WhatsApp Automation Center
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Connect your personal or business WhatsApp number directly to Google Gemini AI.
          </p>
        </div>

        {/* Bot selector dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Bot:</span>
          <select
            className="form-select"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{ padding: '8px 14px', minWidth: '220px' }}
          >
            {bots.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bot_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: '#090d16',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '24px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('qr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'qr' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'qr' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={16} />
          <span>Direct WhatsApp Web Engine (100% Free)</span>
        </button>

        <button
          onClick={() => setActiveTab('meta')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'meta' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'meta' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Globe size={16} />
          <span>Meta WhatsApp Cloud API</span>
        </button>
      </div>

      {/* TAB 1: BAILEYS LIVE ENGINE */}
      {activeTab === 'qr' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(380px, 0.8fr)',
          gap: '24px'
        }}>
          {/* Pairing & Connection Panel */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={22} color="#25d366" />
                <h3 style={{ fontSize: '18px', color: '#ffffff' }}>Connect WhatsApp Account</h3>
              </div>

              <span className={`badge ${isConnected ? 'badge-green' : 'badge-amber'}`}>
                {isConnected ? '🟢 Live & Connected' : '🟡 Disconnected'}
              </span>
            </div>

            {isConnected ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '28px',
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <CheckCircle2 size={52} color="#34d399" style={{ margin: '0 auto 14px' }} />
                <h4 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '6px' }}>
                  WhatsApp Linked & Active!
                </h4>
                <p style={{ fontSize: '15px', color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                  Active Number: {statusData?.phoneNumber || '+91 98765 43210'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                  Every message sent by your customers to this number will receive instant AI responses powered by Gemini Flash and logged into Leads CRM.
                </p>

                <button onClick={handleDisconnect} className="btn-danger">
                  Disconnect WhatsApp Number
                </button>
              </div>
            ) : (
              <div>
                {/* Method selector: 8-Digit Code vs QR Camera */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  background: '#070a12',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={() => setConnectMethod('pairing-code')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: connectMethod === 'pairing-code' ? 'var(--primary)' : 'transparent',
                      color: connectMethod === 'pairing-code' ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Key size={14} />
                    <span>8-Digit Pairing Code (Recommended - Fast)</span>
                  </button>

                  <button
                    onClick={() => setConnectMethod('qr-scan')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      background: connectMethod === 'qr-scan' ? 'var(--primary)' : 'transparent',
                      color: connectMethod === 'qr-scan' ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={14} />
                    <span>QR Camera Scan</span>
                  </button>
                </div>

                {/* METHOD 1: 8-DIGIT PAIRING CODE */}
                {connectMethod === 'pairing-code' && (
                  <div className="animate-fade-in">
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Sparkles size={16} color="#818cf8" />
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                          No Camera Scan Required!
                        </span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Enter your WhatsApp phone number below. OmniBot will give you an 8-character code. On your phone, tap <strong>"Link with phone number instead"</strong> and enter this code!
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, fontSize: '14px', padding: '10px 14px' }}
                        placeholder="Enter phone with country code (e.g. 919876543210)"
                        value={inputPhoneNumber}
                        onChange={(e) => setInputPhoneNumber(e.target.value)}
                      />
                      <button
                        onClick={handleRequestPairingCode}
                        disabled={loading || !inputPhoneNumber.trim()}
                        className="btn-primary"
                        style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
                      >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        <span>{loading ? 'Generating Code...' : 'Get 8-Digit Code'}</span>
                      </button>
                    </div>

                    {/* Display Generated Pairing Code */}
                    {pairingCodeData && (
                      <div className="animate-fade-in" style={{
                        background: '#070a12',
                        border: '2px solid #6366f1',
                        borderRadius: '16px',
                        padding: '24px',
                        textAlign: 'center',
                        marginBottom: '20px'
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Your WhatsApp Pairing Code
                        </span>

                        <div style={{
                          fontSize: '36px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: '#38bdf8',
                          letterSpacing: '0.15em',
                          margin: '12px 0'
                        }}>
                          {pairingCodeData}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pairingCodeData.replace('-', ''));
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            {copiedCode ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                            <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                          </button>
                        </div>

                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          color: 'var(--text-muted)',
                          lineHeight: 1.5
                        }}>
                          📱 <strong>On your phone:</strong> Look at your WhatsApp screen 👉 Click <u>"Link with phone number instead"</u> at the bottom 👉 Type <strong>{pairingCodeData}</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* METHOD 2: QR CAMERA SCAN */}
                {connectMethod === 'qr-scan' && (
                  <div className="animate-fade-in">
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Scan the fresh QR code below using your WhatsApp camera (WhatsApp 👉 Linked Devices 👉 Link a Device).
                    </p>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '24px',
                      background: '#070a12',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '20px'
                    }}>
                      {qrCodeData ? (
                        <div>
                          <img
                            src={qrCodeData}
                            alt="WhatsApp QR Code"
                            style={{ width: '220px', height: '220px', borderRadius: '12px', background: '#ffffff', padding: '8px' }}
                          />
                          <p style={{ fontSize: '12px', color: '#34d399', marginTop: '10px', textAlign: 'center', fontWeight: 600 }}>
                            ● Fresh QR Active (Auto-syncing with phone...)
                          </p>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                          <QrCode size={64} color="#6366f1" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                          <button
                            onClick={handleGenerateQR}
                            disabled={loading}
                            className="btn-primary"
                          >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? 'Generating...' : 'Generate Instant QR Code'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Simulation Mode */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                      Testing Mode (Simulate WhatsApp Connection)
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Simulate a live phone pair to test the AI replies right now
                    </span>
                  </div>
                  <button onClick={handleSimulateScan} className="btn-secondary" style={{ fontSize: '12px' }}>
                    <Sparkles size={14} color="#818cf8" />
                    <span>Quick Pair Test</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Interactive Live Simulator */}
          <div className="glass-panel" style={{
            padding: '24px',
            backgroundColor: '#0b131f',
            borderColor: 'rgba(37, 211, 102, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            height: '620px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} color="#25d366" />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  WhatsApp Live Chat Tester
                </span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '10.5px' }}>Live Gemini Brain</span>
            </div>

            {/* Conversation Log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
              marginBottom: '14px'
            }}>
              {simLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dark)' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '13px' }}>
                    Send a test customer message from below to see Gemini AI reply and auto-create a lead in your CRM!
                  </p>
                </div>
              ) : (
                simLogs.map((item, idx) => {
                  const isUser = item.sender === 'user';
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        backgroundColor: isUser ? '#075e54' : '#1f2c34',
                        color: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        lineHeight: 1.45,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {isUser && (
                        <div style={{ fontSize: '10.5px', color: '#8696a0', marginBottom: '2px' }}>
                          From: {item.phone}
                        </div>
                      )}
                      {item.message}
                    </div>
                  );
                })
              )}
            </div>

            {/* Simulator Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '140px', fontSize: '12px', padding: '6px 10px' }}
                  placeholder="Sender Phone"
                  value={simSenderPhone}
                  onChange={(e) => setSimSenderPhone(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                  placeholder="Customer WhatsApp message..."
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSimulator()}
                />
                <button
                  onClick={handleRunSimulator}
                  disabled={simulating || !simMessage.trim()}
                  className="btn-primary"
                  style={{ padding: '6px 14px', background: '#25d366' }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META CLOUD API */}
      {activeTab === 'meta' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>
            Meta Official WhatsApp Cloud API
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            Official WhatsApp Business Cloud API webhook.
          </p>

          <div className="form-group">
            <label className="form-label">Webhook Callback URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="form-input" value={webhookUrl} readOnly />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="btn-secondary"
              >
                {copiedWebhook ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Verify Token</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="form-input" value={verifyToken} readOnly />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(verifyToken);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                className="btn-secondary"
              >
                {copiedToken ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
