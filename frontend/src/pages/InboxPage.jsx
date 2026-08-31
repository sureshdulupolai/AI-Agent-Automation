import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw, 
  Filter, 
  Paperclip, 
  Smile, 
  ChevronDown, 
  CheckCheck,
  XCircle,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../utils/avatarUtils';
import { formatWhatsAppText } from '../utils/formatWhatsAppText';

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, unread, live
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);
  const selectedSessionIdRef = useRef(selectedSessionId);

  useEffect(() => {
    selectedSessionIdRef.current = selectedSessionId;
  }, [selectedSessionId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/inbox/conversations?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const convs = data.conversations || [];
        setConversations(convs);
        setSelectedSessionId(prev => {
          // Keep user's active selection if it still exists in the conversation list
          if (prev && convs.some(c => c.sessionId === prev)) {
            return prev;
          }
          return convs.length > 0 ? convs[0].sessionId : null;
        });
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
        if (selectedSessionIdRef.current === sessionId) {
          setSessionDetails(data);
        }
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionDetails(selectedSessionId);
      const detailInterval = setInterval(() => {
        if (selectedSessionIdRef.current) {
          fetchSessionDetails(selectedSessionIdRef.current);
        }
      }, 3000);
      return () => clearInterval(detailInterval);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (sessionDetails?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionDetails?.messages]);

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
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

  const handleCloseConversation = () => {
    alert('Conversation marked as resolved and closed.');
  };

  const filteredConversations = conversations.filter(c => {
    if (activeFilter === 'unread') return true;
    if (activeFilter === 'live') return c.channel === 'whatsapp' || c.channel === 'website';
    return true;
  });

  const activeConv = conversations.find(c => c.sessionId === selectedSessionId);

  return (
    <div style={{ padding: '16px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto', height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Conversations
        </h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={fetchConversations}
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Chatzy Split Layout Container */}
      <div className="glass-panel" style={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        backgroundColor: '#ffffff'
      }}>
        {/* Left Column: Conversations List */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}>
          {/* Search & Filter Header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Search (by name, email, or phone number)
            </span>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search contacts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '100%', fontSize: '12.5px', padding: '6px 30px 6px 10px' }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '9px' }} />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn-secondary"
                style={{ padding: '4px 8px', borderRadius: '6px' }}
                title="Filters"
              >
                <Filter size={13} />
              </button>

              <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'live', label: 'Live' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: activeFilter === tab.id ? 'var(--primary)' : 'var(--border-subtle)',
                    background: activeFilter === tab.id ? 'var(--bg-subtle)' : 'transparent',
                    color: activeFilter === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 700,
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

          {/* Conversation List Stream */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={26} style={{ margin: '0 auto 8px auto', opacity: 0.3 }} />
                <p style={{ fontSize: '12.5px', fontWeight: 600 }}>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedSessionId === c.sessionId;
                const isWa = c.channel === 'whatsapp';
                const initial = getInitialLetter(c.senderName || 'User');
                const avatarBg = getInitialColor(c.senderName || 'User');

                return (
                  <div
                    key={c.sessionId}
                    onClick={() => setSelectedSessionId(c.sessionId)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.15s'
                    }}
                  >
                    {/* Avatar with Channel Overlay Dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: avatarBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#ffffff'
                      }}>
                        {initial}
                      </div>

                      {/* Channel Badge Overlay */}
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: isWa ? '#059669' : '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #ffffff'
                      }}>
                        {isWa ? <Phone size={8} color="#ffffff" /> : <Globe size={8} color="#ffffff" />}
                      </span>
                    </div>

                    {/* Metadata & Message */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#059669',
                            display: 'inline-block'
                          }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.senderName}
                          </span>
                          <span style={{
                            fontSize: '9.5px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(79, 70, 229, 0.1)',
                            color: 'var(--primary)',
                            fontWeight: 700
                          }}>
                            Conv. AI
                          </span>
                        </div>

                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.35
                      }}>
                        {c.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Transcript & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', backgroundColor: '#fcfdfd' }}>
          {activeConv ? (
            <>
              {/* Header Info matching Chatzy Image 1 */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: getInitialColor(activeConv.senderName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#ffffff'
                  }}>
                    {getInitialLetter(activeConv.senderName)}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {activeConv.senderName}
                    </h3>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Assigned to: <strong>Conv AI Agent ({activeConv.botId})</strong>
                    </span>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleCloseConversation}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Close Conversation
                  </button>

                  <button
                    onClick={() => fetchSessionDetails(selectedSessionId)}
                    className="btn-secondary"
                    style={{ padding: '5px 8px', borderRadius: '6px' }}
                    title="Refresh Chat"
                  >
                    <RefreshCw size={13} />
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}>
                    <User size={13} color="var(--text-muted)" />
                    <span>Not yet assigned</span>
                    <ChevronDown size={13} color="var(--text-muted)" />
                  </div>
                </div>
              </div>

              {/* Message Transcript Stream */}
              <div style={{
                flex: 1,
                minHeight: 0,
                padding: '20px 24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: '#ffffff'
              }}>
                {(!sessionDetails?.messages || sessionDetails.messages.length === 0) ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MessageSquare size={32} style={{ margin: '0 auto 10px auto', opacity: 0.3 }} />
                    <p style={{ fontSize: '13px', fontWeight: 600 }}>No messages in this session yet</p>
                    <span style={{ fontSize: '12px' }}>Send a message below to start chatting.</span>
                  </div>
                ) : (
                  sessionDetails.messages.map((msg, i) => {
                    const isUser = msg.sender === 'user';
                    const isAgent = msg.sender === 'agent';

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start',
                          maxWidth: '78%',
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          gap: '4px'
                        }}
                      >
                        {/* Author Tag */}
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isUser ? 'var(--text-secondary)' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isUser ? (
                            activeConv.senderName
                          ) : (
                            <>
                              {isAgent ? <User size={11} /> : <Bot size={11} />}
                              <span>{isAgent ? 'Human Support Agent' : (activeConv.botName || 'AI Assistant')}</span>
                            </>
                          )}
                        </span>

                        {/* Bubble */}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          backgroundColor: isUser ? 'var(--wa-incoming-bg)' : '#f8fafc',
                          color: isUser ? 'var(--wa-incoming-text)' : 'var(--text-primary)',
                          border: isUser ? '1px solid var(--wa-incoming-border)' : '1px solid var(--border-subtle)',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}>
                          {formatWhatsAppText(msg.content)}
                        </div>

                        {/* Timestamp & Status Icon */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10.5px',
                          color: 'var(--text-muted)'
                        }}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <CheckCheck size={13} color={isUser ? '#059669' : '#94a3b8'} />
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Bar matching Chatzy Image 1 */}
              <form 
                onSubmit={handleSendReply}
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <button
                  type="button"
                  className="btn-outline"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    borderColor: 'rgba(79, 70, 229, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Send Template
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Attach file">
                    <Paperclip size={15} />
                  </button>

                  <button type="button" className="btn-secondary" style={{ padding: '6px', borderRadius: '6px' }} title="Emoji picker">
                    <Smile size={15} />
                  </button>

                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingReply}
                    className="btn-primary"
                    style={{ padding: '7px 12px', borderRadius: '8px' }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <Inbox size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Select a Conversation</h3>
              <p style={{ fontSize: '12px' }}>Click any thread to view and respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
