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
  Zap,
  Key,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WhatsAppPage({ bots = [], initialBotId = null }) {
  const [selectedBotId, setSelectedBotId] = useState(initialBotId || (bots[0]?.id || ''));
  const [activeTab, setActiveTab] = useState('qr');
  const [connectMethod, setConnectMethod] = useState('pairing-code');
  
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

  const handleSimulateScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/${selectedBotId}/pair-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: inputPhoneNumber || '+91 98206 46838' })
      });
      const data = await res.json();
      setStatusData({
        status: 'connected',
        phoneNumber: data.bot?.whatsapp_number || '+91 98206 46838'
      });
      setQrCodeData(null);
      setPairingCodeData(null);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      alert('Pairing simulation failed');
    } finally {
      setLoading(false);
    }
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
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            WhatsApp Automation Hub
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Connect your WhatsApp phone number to automate AI responses and capture leads.
          </p>
        </div>

        {/* Bot selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Bot:</span>
          <select
            className="form-select"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{ padding: '7px 12px', minWidth: '200px', fontSize: '13px' }}
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
        gap: '6px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        padding: '3px',
        borderRadius: '8px',
        marginBottom: '20px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('qr')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'qr' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'qr' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Zap size={14} />
          <span>Direct WhatsApp Web</span>
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
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          <Globe size={14} />
          <span>Meta Cloud API</span>
        </button>
      </div>

      {/* TAB 1: BAILEYS LIVE ENGINE */}
      {activeTab === 'qr' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 0.8fr)',
          gap: '20px'
        }}>
          {/* Connection Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
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
                {/* Method selector */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  background: 'var(--bg-subtle)',
                  padding: '3px',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => setConnectMethod('pairing-code')}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      border: 'none',
                      borderRadius: '6px',
                      background: connectMethod === 'pairing-code' ? 'var(--primary)' : 'transparent',
                      color: connectMethod === 'pairing-code' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Key size={13} />
                    <span>Pairing Code</span>
                  </button>

                  <button
                    onClick={() => setConnectMethod('qr-scan')}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      border: 'none',
                      borderRadius: '6px',
                      background: connectMethod === 'qr-scan' ? 'var(--primary)' : 'transparent',
                      color: connectMethod === 'qr-scan' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <QrCode size={13} />
                    <span>QR Camera</span>
                  </button>
                </div>

                {/* Pairing Code */}
                {connectMethod === 'pairing-code' && (
                  <div className="animate-fade-in">
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Enter your phone number to receive an 8-character pairing code.
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                        placeholder="e.g. 919876543210"
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
                        <span>{loading ? 'Generating...' : 'Get Code'}</span>
                      </button>
                    </div>

                    {/* Display Code */}
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

                {/* QR Scanner */}
                {connectMethod === 'qr-scan' && (
                  <div className="animate-fade-in">
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '18px',
                      background: 'var(--bg-subtle)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '16px'
                    }}>
                      {qrCodeData ? (
                        <div>
                          <img
                            src={qrCodeData}
                            alt="WhatsApp QR Code"
                            style={{ width: '180px', height: '180px', borderRadius: '8px', background: '#ffffff', padding: '6px' }}
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                          <QrCode size={48} color="var(--primary)" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
                          <button
                            onClick={handleGenerateQR}
                            disabled={loading}
                            className="btn-primary"
                            style={{ fontSize: '12.5px', padding: '7px 14px' }}
                          >
                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? 'Generating...' : 'Generate QR Code'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Simulation Mode */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                      Simulation Mode
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Simulate a live phone pair to test responses
                    </span>
                  </div>
                  <button onClick={handleSimulateScan} className="btn-secondary" style={{ fontSize: '11.5px', padding: '5px 10px' }}>
                    <span>Pair Test</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Simulator */}
          <div className="glass-panel" style={{
            padding: '20px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            height: '560px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                WhatsApp Chat Tester
              </span>
              <span className="badge badge-green" style={{ fontSize: '10.5px' }}>Live Brain</span>
            </div>

            {/* Conversation Log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '12px'
            }}>
              {simLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p style={{ fontSize: '12px' }}>
                    Send a test customer message to verify auto-reply.
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
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isUser ? '#059669' : 'var(--bg-subtle)',
                        color: isUser ? '#ffffff' : 'var(--text-primary)',
                        border: isUser ? 'none' : '1px solid var(--border-subtle)',
                        fontSize: '12.5px',
                        lineHeight: 1.4
                      }}
                    >
                      <p>{item.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendSimulation} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Type test message..."
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="form-input"
                style={{ flex: 1, fontSize: '12.5px', padding: '7px 10px' }}
              />
              <button
                type="submit"
                disabled={simulating || !simMessage.trim()}
                className="btn-primary"
                style={{ background: '#059669', borderColor: '#059669', padding: '7px 12px' }}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: META CLOUD API */}
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
