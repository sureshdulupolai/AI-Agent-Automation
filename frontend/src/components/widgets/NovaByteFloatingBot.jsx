import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  Phone,
  Mail,
  User,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  Minimize2,
  ChevronDown,
  ArrowRight,
  Lock,
  ExternalLink
} from 'lucide-react';
import { formatWhatsAppText } from '../../utils/formatWhatsAppText';

export default function NovaByteFloatingBot({ botId = 'bot-ec0db899' }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Hello! I am your NovaByte AI Assistant. How can I help your business automate leads and growth today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const messagesEndRef = useRef(null);

  const sessionId = useRef(`widget_sess_${Math.random().toString(36).substring(2, 9)}`).current;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const newMsgs = [...messages, { sender: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInputText('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token') || '';
      let res = await fetch('/api/chat/dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId,
          botId,
          message: textToSend,
          channel: 'website'
        })
      });

      if (!res.ok) {
        res = await fetch(`/api/chat/${botId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message: textToSend, channel: 'website' })
        });
      }

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMsgs, { 
          sender: 'bot', 
          content: data.reply, 
          action: data.action,
          queryResults: data.queryResults 
        }]);
      } else {
        setMessages([...newMsgs, {
          sender: 'bot',
          content: 'Thank you for reaching out! How can NovaByte AI assist your business today?'
        }]);
      }
    } catch (err) {
      setMessages([...newMsgs, {
        sender: 'bot',
        content: 'NovaByte AI is ready to automate your customer inquiries, WhatsApp follow-ups, and sales pipeline!'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteAction = (action) => {
    if (!action) return;
    if (action.targetPath) {
      navigate(action.targetPath);
    }
    if (action.highlightSelector) {
      setTimeout(() => {
        const el = document.querySelector(action.highlightSelector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.transition = 'box-shadow 0.3s ease';
          el.style.boxShadow = '0 0 0 4px #6366f1';
          setTimeout(() => {
            el.style.boxShadow = '';
          }, 2500);
        }
      }, 300);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/chat/${botId}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          requirement: leadForm.note || 'Inquired via Website AI Floating Widget'
        })
      });
      setLeadSubmitted(true);
      setShowLeadForm(false);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', content: `Thank you, ${leadForm.name}! Our team and AI assistant have recorded your inquiry. We will follow up shortly.` }
      ]);
    } catch (err) {
      setShowLeadForm(false);
    }
  };

  const quickPrompts = [
    'What services do you provide?',
    'How do I embed this widget?',
    'Book a Demo Call'
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Floating Teaser Tooltip (When Closed) */}
      {!isOpen && showTeaser && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          right: '0',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={() => {
          setIsOpen(true);
          setShowTeaser(false);
        }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Need help? Chat with NovaByte AI
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowTeaser(false);
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          title="Open AI Chat Widget"
        >
          <Bot size={28} />
          {/* Online green indicator */}
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2.5px solid #ffffff'
          }}></span>
        </button>
      )}

      {/* Expanded Floating Chat Modal Window */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '560px',
          maxHeight: 'calc(100vh - 100px)',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease'
        }}>
          
          {/* Window Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>
                  NovaByte AI Assistant
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span>
                  Online • Autonomous Assistant
                </div>
              </div>
            </div>

            {/* Header Controls (Minimize & Close) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Reply Chips */}
          <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg-page, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  color: 'var(--text-primary, #1e293b)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-surface, #ffffff)'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: msg.sender === 'user' ? '#4f46e5' : 'var(--bg-page, #f1f5f9)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary, #0f172a)',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {typeof msg.content === 'string' ? formatWhatsAppText(msg.content) : msg.content}
                </div>

                {/* Autonomous Action Navigation Pill */}
                {msg.action && (
                  <button
                    type="button"
                    onClick={() => handleExecuteAction(msg.action)}
                    style={{
                      marginTop: '10px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      width: 'fit-content'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)';
                    }}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={11} color="#ffffff" />
                    </div>
                    <span>{msg.action.label || 'Take me there'}</span>
                    <ArrowRight size={14} color="#ffffff" />
                  </button>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-page, #f1f5f9)', padding: '8px 12px', borderRadius: '12px', fontSize: '11.5px', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                NovaByte AI is generating answer...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Lead Capture Overlay Form (Optional) */}
          {showLeadForm && (
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-page, #f8fafc)', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Request Follow-up / Demo:</span>
                <button onClick={() => setShowLeadForm(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={12} /></button>
              </div>
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                />
                <input
                  type="text"
                  required
                  placeholder="WhatsApp Number *"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                />
                <button type="submit" style={{ padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Submit Inquiry
                </button>
              </form>
            </div>
          )}

          {/* Bottom Chat Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color, #e2e8f0)', backgroundColor: 'var(--bg-surface, #ffffff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowLeadForm(!showLeadForm)}
              title="Leave Contact / Book Demo"
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'transparent', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <User size={15} />
            </button>

            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-page, #f8fafc)',
                fontSize: '12.5px',
                color: 'var(--text-primary, #0f172a)',
                outline: 'none'
              }}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
