import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  MessageSquare, 
  Globe, 
  Send, 
  User, 
  Bot, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/inbox/conversations?channel=${channelFilter === 'all' ? '' : channelFilter}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!selectedSessionId && data.conversations && data.conversations.length > 0) {
          setSelectedSessionId(data.conversations[0].sessionId);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/inbox/conversations/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionDetails(data);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, [channelFilter, searchQuery]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionDetails(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || sendingReply) return;

    const currentConv = conversations.find(c => c.sessionId === selectedSessionId);
    setSendingReply(true);

    try {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: currentConv?.botId || 'bot-apex-agency',
          sessionId: selectedSessionId,
          message: replyText.trim()
        })
      });

      if (res.ok) {
        setReplyText('');
        await fetchSessionDetails(selectedSessionId);
        await fetchConversations();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const activeConv = conversations.find(c => c.sessionId === selectedSessionId);

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 86px)', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Conversations Inbox</h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Real-time messages across Website Chatbots and WhatsApp.
          </p>
        </div>

        <button 
          onClick={fetchConversations}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="glass-panel" style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Left Column: Conversation List */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)'
        }}>
          {/* Search & Channel Filter Bar */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '30px', width: '100%', fontSize: '12.5px', padding: '6px 10px 6px 30px' }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'website', label: 'Website' },
                { id: 'whatsapp', label: 'WhatsApp' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setChannelFilter(tab.id)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: channelFilter === tab.id ? 'var(--primary)' : 'var(--border-subtle)',
                    background: channelFilter === tab.id ? 'var(--bg-subtle)' : 'transparent',
                    color: channelFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={28} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '12.5px', fontWeight: 600 }}>No conversations found</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedSessionId === c.sessionId;
                const isWa = c.channel === 'whatsapp';

                return (
                  <div
                    key={c.sessionId}
                    onClick={() => setSelectedSessionId(c.sessionId)}
                    style={{
                      padding: '11px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {c.senderName}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: isWa ? 'rgba(16, 185, 129, 0.12)' : 'rgba(79, 70, 229, 0.1)',
                          color: isWa ? '#059669' : 'var(--primary)',
                          fontWeight: 700
                        }}>
                          {isWa ? 'WhatsApp' : 'Web'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.4
                    }}>
                      <span style={{ fontWeight: 600 }}>{c.lastMessageSender === 'bot' ? 'AI: ' : c.lastMessageSender === 'agent' ? 'Agent: ' : ''}</span>
                      {c.lastMessage}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
          {activeConv ? (
            <>
              {/* Header Info */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: activeConv.channel === 'whatsapp' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(79, 70, 229, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: activeConv.channel === 'whatsapp' ? '#059669' : 'var(--primary)'
                  }}>
                    {activeConv.channel === 'whatsapp' ? <Phone size={16} /> : <User size={16} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeConv.senderName}</h3>
                      <span className={activeConv.channel === 'whatsapp' ? 'badge badge-green' : 'badge badge-blue'} style={{ fontSize: '10.5px' }}>
                        {activeConv.channel === 'whatsapp' ? 'WhatsApp' : 'Website'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {activeConv.leadPhone && <span>Phone: <strong style={{ color: 'var(--text-primary)' }}>{activeConv.leadPhone}</strong></span>}
                      {activeConv.leadEmail && <span>Email: <strong style={{ color: 'var(--text-primary)' }}>{activeConv.leadEmail}</strong></span>}
                    </div>
                  </div>
                </div>

                <span className="badge badge-purple" style={{ fontSize: '11px', padding: '3px 8px' }}>
                  Gemini Active
                </span>
              </div>

              {/* Message Transcript Stream */}
              <div style={{
                flex: 1,
                padding: '16px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {sessionDetails?.messages?.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  const isAgent = msg.sender === 'agent';

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        alignSelf: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        <span>{isUser ? 'Visitor' : isAgent ? 'Agent' : 'AI Assistant'}</span>
                        <span>•</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div style={{
                        padding: '9px 13px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        lineHeight: 1.45,
                        backgroundColor: isUser 
                          ? 'var(--primary)' 
                          : isAgent 
                            ? '#0891b2' 
                            : 'var(--bg-surface)',
                        color: (isUser || isAgent) ? '#ffffff' : 'var(--text-primary)',
                        border: (isUser || isAgent) ? 'none' : '1px solid var(--border-subtle)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Human Reply Input Bar */}
              <form 
                onSubmit={handleSendReply}
                style={{
                  padding: '12px 18px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <input
                  type="text"
                  placeholder={`Reply to ${activeConv.senderName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sendingReply}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  <Send size={14} />
                  <span>{sendingReply ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <Inbox size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Select a Conversation</h3>
              <p style={{ fontSize: '12.5px' }}>Click any thread to view and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
