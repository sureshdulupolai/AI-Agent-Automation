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
import TypewriterMessage from '../common/TypewriterMessage';

export default function NovaByteFloatingBot({ botId = 'bot-ec0db899', bot, botName }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeBotData, setActiveBotData] = useState(bot || null);

  useEffect(() => {
    if (bot) {
      setActiveBotData(bot);
    } else if (botId) {
      fetch(`/api/bots/${botId}`)
        .then(res => res.json())
        .then(data => {
          if (data.bot) setActiveBotData(data.bot);
        })
        .catch(err => console.error('Failed to load bot for widget:', err));
    }
  }, [bot, botId]);

  const currentBotName = botName || activeBotData?.bot_name || 'AI Assistant';

  // Draggable position state with viewport bounds checking
  const getInitialPos = () => {
    if (typeof window === 'undefined') return { x: 1000, y: 700 };
    const maxX = Math.max(16, window.innerWidth - 80);
    const maxY = Math.max(16, window.innerHeight - 80);
    try {
      const saved = localStorage.getItem('novabyte_bot_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed?.x === 'number' &&
          typeof parsed?.y === 'number' &&
          !isNaN(parsed.x) &&
          !isNaN(parsed.y) &&
          parsed.x >= 16 &&
          parsed.x <= maxX &&
          parsed.y >= 16 &&
          parsed.y <= maxY
        ) {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch (e) {}
    return { x: maxX, y: maxY };
  };

  const [pos, setPos] = useState(getInitialPos);

  useEffect(() => {
    const handleResize = () => {
      const maxX = Math.max(16, window.innerWidth - 80);
      const maxY = Math.max(16, window.innerHeight - 80);
      setPos(prev => ({
        x: Math.max(16, Math.min(maxX, (typeof prev?.x === 'number' && !isNaN(prev.x)) ? prev.x : maxX)),
        y: Math.max(16, Math.min(maxY, (typeof prev?.y === 'number' && !isNaN(prev.y)) ? prev.y : maxY))
      }));
    };
    window.addEventListener('resize', handleResize);
    // Initial verification on mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    hasMoved: false
  });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
      hasMoved: false
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragRef.current.isDragging) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.hasMoved = true;
      }
      const newX = Math.max(16, Math.min(window.innerWidth - 76, dragRef.current.initialPosX + dx));
      const newY = Math.max(16, Math.min(window.innerHeight - 76, dragRef.current.initialPosY + dy));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        if (dragRef.current.hasMoved) {
          setPos(current => {
            localStorage.setItem('novabyte_bot_pos', JSON.stringify(current));
            return current;
          });
        }
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragRef.current = {
      isDragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      initialPosX: pos.x,
      initialPosY: pos.y,
      hasMoved: false
    };
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.hasMoved = true;
    }
    const newX = Math.max(16, Math.min(window.innerWidth - 76, dragRef.current.initialPosX + dx));
    const newY = Math.max(16, Math.min(window.innerHeight - 76, dragRef.current.initialPosY + dy));
    setPos({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      if (dragRef.current.hasMoved) {
        setPos(current => {
          localStorage.setItem('novabyte_bot_pos', JSON.stringify(current));
          return current;
        });
      }
    }
  };

  const handleLauncherClick = (e) => {
    if (dragRef.current.hasMoved) {
      e.stopPropagation();
      return;
    }
    setIsOpen(prev => !prev);
    setAutoTeaserActive(false);
    setIsHovered(false);
  };

  const safeX = (typeof pos?.x === 'number' && !isNaN(pos.x))
    ? Math.max(16, Math.min(window.innerWidth - 76, pos.x))
    : window.innerWidth - 84;
  const safeY = (typeof pos?.y === 'number' && !isNaN(pos.y))
    ? Math.max(16, Math.min(window.innerHeight - 76, pos.y))
    : window.innerHeight - 84;

  const isRightSide = safeX > (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const isBottomSide = safeY > (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

  // Teaser visibility states: auto-pops 1 time on first session visit for 3s, then only on hover
  const [autoTeaserActive, setAutoTeaserActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if teaser was already shown once in this session
    const hasSeenTeaser = sessionStorage.getItem('bot_teaser_seen');
    if (!hasSeenTeaser) {
      sessionStorage.setItem('bot_teaser_seen', 'true');
      setAutoTeaserActive(true);

      // Auto dismiss smoothly after 3 seconds
      const timer = setTimeout(() => {
        setAutoTeaserActive(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const isTeaserVisible = !isOpen && !isDismissed && (autoTeaserActive || isHovered);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: `Hello! Great to connect with you. How can we help scale your business with custom web development or smart AI automations today?`
    }
  ]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'bot') {
      setMessages([
        {
          sender: 'bot',
          content: `Hello! Great to connect with you. How can we help scale your business with custom web development or smart AI automations today?`
        }
      ]);
    }
  }, [currentBotName]);
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
          queryResults: data.queryResults,
          isStreaming: true
        }]);
      } else {
        setMessages([...newMsgs, {
          sender: 'bot',
          content: `Thank you for reaching out! How can we assist your business today?`,
          isStreaming: true
        }]);
      }
    } catch (err) {
      setMessages([...newMsgs, {
        sender: 'bot',
        content: `I'm here to help! Could you please share what you're looking to achieve with your website or automation project?`,
        isStreaming: true
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
        { sender: 'bot', content: `Thank you, ${leadForm.name}! We've securely received your inquiry. A senior solutions consultant will connect with you shortly.` }
      ]);
    } catch (err) {
      setShowLeadForm(false);
    }
  };

  const quickPrompts = [
    'What services do you provide?',
    'Explore Pricing & Packages',
    'Schedule a Consultation'
  ];

  return (
    <div style={{
      position: 'fixed',
      left: `${safeX}px`,
      top: `${safeY}px`,
      width: '60px',
      height: '60px',
      zIndex: 999999,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      pointerEvents: 'none'
    }}>
      
      {/* Space-Aware Teaser Popup (Absolute overlay, never shifts button) */}
      {!isOpen && isTeaserVisible && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            setIsOpen(true);
            setAutoTeaserActive(false);
            setIsHovered(false);
          }}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            ...(isRightSide ? { right: '72px' } : { left: '72px' }),
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '16px',
            padding: '9px 16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            userSelect: 'none',
            pointerEvents: 'auto',
            animation: isRightSide ? 'slideInRight 0.25s ease' : 'slideInLeft 0.25s ease',
            zIndex: 999998
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Need help? Chat with {currentBotName}
          </span>
        </div>
      )}

      {/* Floating Launcher Button (Anchored strictly at safeX, safeY) */}
      {!isOpen && (
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleLauncherClick}
          title="Drag to reposition • Click to chat"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: activeBotData?.primary_color || '#4f46e5',
            background: activeBotData?.primary_color
              ? `linear-gradient(135deg, ${activeBotData.primary_color}, #06b6d4)`
              : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'auto',
            userSelect: 'none',
            touchAction: 'none',
            transform: isHovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
            zIndex: 999999
          }}
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
          }} />
        </button>
      )}

      {/* Expanded Floating Chat Modal Window (Space-Aware Position) */}
      {isOpen && (
        <div style={{
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 90px)',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease',
          position: 'absolute',
          pointerEvents: 'auto',
          zIndex: 1000000,
          ...(isRightSide ? { right: 0 } : { left: 0 }),
          ...(isBottomSide ? { bottom: 0 } : { top: 0 })
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
                  {currentBotName}
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
                  {typeof msg.content === 'string' ? (
                    <TypewriterMessage 
                      text={msg.content} 
                      isStreaming={msg.isStreaming} 
                      speed={18}
                      formatter={formatWhatsAppText}
                      onStreamEnd={() => {
                        msg.isStreaming = false;
                      }}
                    />
                  ) : msg.content}
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
              <div 
                style={{ 
                  alignSelf: 'flex-start', 
                  backgroundColor: 'var(--bg-page, #f1f5f9)', 
                  padding: '10px 14px', 
                  borderRadius: '14px 14px 14px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <style>{`
                  @keyframes botDotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
                    40% { transform: translateY(-4px); opacity: 1; }
                  }
                `}</style>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block', animation: 'botDotBounce 1.2s infinite ease-in-out', animationDelay: '0s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block', animation: 'botDotBounce 1.2s infinite ease-in-out', animationDelay: '0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block', animation: 'botDotBounce 1.2s infinite ease-in-out', animationDelay: '0.4s' }} />
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
