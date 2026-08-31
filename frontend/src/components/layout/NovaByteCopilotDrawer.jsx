import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Plus, 
  Trash2, 
  Send, 
  ArrowUp, 
  MessageSquare, 
  Code2, 
  Radio, 
  Mail, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Bot
} from 'lucide-react';
import { formatWhatsAppText } from '../../utils/formatWhatsAppText';

export default function NovaByteCopilotDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleResetChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleSendQuestion = async (userText) => {
    const textToSend = userText || input.trim();
    if (!textToSend) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Knowledge base for NovaByte AI Copilot
    setTimeout(() => {
      let botResponse = '';
      const q = textToSend.toLowerCase();

      if (q.includes('what can i do') || q.includes('features') || q.includes('capabilities')) {
        botResponse = `NovaByte AI is an enterprise-grade omni-channel automation platform. Here is what you can do:\n\n• **Autonomous AI Agents**: Create custom AI bots trained on your business data and prompts.\n• **WhatsApp Automation**: Scan QR code to deploy 24/7 lead qualifying bots and launch multimedia bulk broadcasts.\n• **Email Outreach & Drips**: Send RFC 2822 proposals and multi-step automated email follow-ups via official Gmail API.\n• **Website Live Chat Widget**: 1-click embed snippet for React, Next.js, or HTML websites.\n• **Omni-Channel Lead CRM**: Auto-capture contacts from WhatsApp, Instagram, Email, and Website.`;
      } else if (q.includes('create') && (q.includes('agent') || q.includes('bot'))) {
        botResponse = `To create an AI Agent in NovaByte AI:\n\n1. Go to **Dashboard / AI Bots** from the sidebar.\n2. Click the **"+ New Agent"** button.\n3. Customize your Agent's Name, Avatar, Primary Theme Color, and Welcome Message.\n4. Write the **System Instructions** explaining how your bot should respond and what information it should collect.\n5. Click **"Deploy Changes"** to activate your bot across Web and WhatsApp!`;
      } else if (q.includes('whatsapp') || q.includes('qr')) {
        botResponse = `To deploy your AI Agent on WhatsApp:\n\n1. Navigate to **Channels > WhatsApp** in the sidebar.\n2. Select your AI Bot.\n3. Click **"Pair WhatsApp with QR Code"** and scan the QR from your WhatsApp mobile app (Linked Devices).\n4. Once connected, your AI bot will automatically answer inbound client inquiries 24/7 and qualify leads!`;
      } else if (q.includes('email') || q.includes('campaign') || q.includes('broadcast')) {
        botResponse = `To launch Campaigns & Email Outreach:\n\n1. Go to **Campaigns & Bulk** in the sidebar.\n2. Choose **WhatsApp Bulk** or **Email Campaigns** tab.\n3. Select your Audience: Upload an **Excel/CSV file** or enter phone numbers/emails directly in the **To:** field.\n4. Attach images, PDF proposals, or audio files.\n5. Send immediately or schedule for later dispatch!`;
      } else if (q.includes('lead') || q.includes('contact') || q.includes('crm')) {
        botResponse = `All inbound leads from WhatsApp chats, Website chatbot conversations, Instagram DMs, and Email outreach are automatically recorded in **Audience CRM** (/contacts). You can filter leads by channel, export to CSV, or sync to Google Sheets in 1 click!`;
      } else if (q.includes('pricing') || q.includes('cost')) {
        botResponse = `NovaByte AI packages include:\n\n• **Starter AI Agent**: Full website chatbot & WhatsApp integration.\n• **Pro Studio Tier**: Multi-step automated email drips, Excel bulk broadcasts, and CRM sync.\n• **Enterprise Solutions**: Custom AI pipelines and dedicated server deployment.`;
      } else {
        botResponse = `I understand! As your NovaByte AI Copilot, I can help you build chatbots, connect WhatsApp via QR code, set up Gmail campaigns, upload Excel audiences, or embed chat widgets into your website.\n\nWhat would you like to set up next?`;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <aside style={{
      width: '380px',
      minWidth: '380px',
      maxWidth: '380px',
      height: '100vh',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.04)',
      zIndex: 100,
      position: 'relative',
      fontFamily: 'var(--font-body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)'
    }}>
      {/* Top Header matching Chatzy Image 1 & 2 */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: '#f5f3ff',
        borderBottom: '1px solid #ede9fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand & Beta Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/novabyte_logo.jpg" 
            alt="NovaByte AI" 
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              objectFit: 'cover',
              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.25)'
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.01em' }}>
              NovaByte AI
            </span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              Beta
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleResetChat}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="New Chat"
          >
            <Plus size={18} />
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Copilot"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          /* Initial Screen matching Chatzy Image 1 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Assistant Welcome Intro */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                I'm NovaByte AI Assistant.
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                I can help you understand the product — features, integrations, and how things work.
              </p>
            </div>

            {/* Prompt Cards Section */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                HERE ARE SOME EXAMPLES OF WHAT I CAN DO
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Prompt 1 */}
                <div
                  onClick={() => handleSendQuestion('What can I do using NovaByte AI?')}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.backgroundColor = '#fbfbfe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <div style={{ color: '#818cf8', marginTop: '2px' }}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                      What can I do using NovaByte AI?
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Discover the features and capabilities of NovaByte AI.
                    </div>
                  </div>
                </div>

                {/* Prompt 2 */}
                <div
                  onClick={() => handleSendQuestion('How to create a conversational AI Agent?')}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.backgroundColor = '#fbfbfe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <div style={{ color: '#818cf8', marginTop: '2px' }}>
                    <Code2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                      How to create a conversational AI Agent?
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Step-by-step guide to building your own AI Agent.
                    </div>
                  </div>
                </div>

                {/* Prompt 3 */}
                <div
                  onClick={() => handleSendQuestion('How to deploy my AI Agent on WhatsApp?')}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.backgroundColor = '#fbfbfe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <div style={{ color: '#818cf8', marginTop: '2px' }}>
                    <Radio size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                      How to deploy my AI Agent on WhatsApp?
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Connect and launch your AI Agent on WhatsApp.
                    </div>
                  </div>
                </div>

                {/* Prompt 4 */}
                <div
                  onClick={() => handleSendQuestion('How to launch automated Email Campaigns?')}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.backgroundColor = '#fbfbfe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <div style={{ color: '#818cf8', marginTop: '2px' }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
                      How to launch automated Email Campaigns?
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Broadcast proposals and set up multi-step drip nurturing.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Chat Conversation View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m) => (
              <div 
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '88%',
                  padding: '12px 14px',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: m.sender === 'user' ? '#4f46e5' : '#f8fafc',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  fontSize: '13px',
                  lineHeight: 1.55,
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  {formatWhatsAppText(m.text)}
                </div>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '12px', width: 'fit-content' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#818cf8', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>NovaByte AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Sticky Input Container matching Chatzy Image 1 & 2 */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '6px 8px 6px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#818cf8'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#0f172a',
              backgroundColor: 'transparent'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: input.trim() ? '#4f46e5' : '#c7d2fe',
              color: '#ffffff',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.15s ease'
            }}
          >
            <ArrowUp size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
