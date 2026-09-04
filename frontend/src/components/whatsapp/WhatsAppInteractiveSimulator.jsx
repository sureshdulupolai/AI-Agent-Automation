import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  CheckCheck, 
  Send, 
  Paperclip, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  X, 
  Calendar, 
  Download, 
  Phone, 
  Video, 
  MoreVertical, 
  Flame, 
  ShoppingBag, 
  Building2, 
  Clock, 
  ExternalLink, 
  Check, 
  TrendingUp, 
  Users, 
  Filter, 
  Save, 
  Plus, 
  Zap, 
  ChevronRight, 
  Award, 
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatWhatsAppText } from '../../utils/formatWhatsAppText';

// Pre-configured real-world conversational presets derived from the 15 images
const INDUSTRY_PRESETS = {
  realestate: {
    id: 'realestate',
    name: 'Luxury Real Estate',
    subtitle: 'Growth Suite (Image 4)',
    badge: 'High-Ticket Lead Flow',
    leadName: 'Arjun Sharma (Investor)',
    phone: '+91 98765 43210',
    source: 'Meta Lead Ad (Instagram)',
    dealValue: '₹1.85 Cr',
    initialStatus: 'Brochure Shared',
    messages: [
      {
        id: 're-1',
        sender: 'customer',
        text: 'Hi, I saw your Instagram ad for Villa Palm Drive luxury villas. Can you share the project details and pricing?',
        time: '10:30 AM'
      },
      {
        id: 're-2',
        sender: 'bot',
        text: 'Hello Arjun! 👋 Welcome to Villa Palm Drive by Growth Suite.\n\nHere is our exclusive project brochure with floor plans, private pool layouts, and payment schedules:',
        time: '10:30 AM',
        card: {
          type: 'pdf_brochure',
          filename: 'Villa_Palm_Drive_Luxury_Brochure.pdf',
          size: '3.4 MB',
          pages: '24 Pages (HD Architecture Renders)'
        },
        buttons: [
          { text: '📅 Book Site Visit', id: 'btn_visit', icon: '📅' },
          { text: '💰 Request Price Sheet', id: 'btn_pricing', icon: '💰' },
          { text: '👤 Speak with Property Advisor', id: 'btn_advisor', icon: '👤' }
        ]
      }
    ]
  },
  ecommerce: {
    id: 'ecommerce',
    name: '24/7 E-Commerce Sales Machine',
    subtitle: 'Zoepact & AiSensy (Images 2 & 6)',
    badge: 'Retail & Flash Sale',
    leadName: 'Priya Mehta',
    phone: '+91 98112 34567',
    source: 'Website Chat Widget',
    dealValue: '₹14,999',
    initialStatus: 'Replied',
    messages: [
      {
        id: 'ec-1',
        sender: 'bot',
        text: 'Hi Priya! 👋 Thanks for reaching out to Zoepact Online. How can we help you today?',
        time: '10:30 AM',
        buttons: [
          { text: '🛍️ View Products', id: 'zp_products', icon: '🛍️' },
          { text: '📦 Track Order', id: 'zp_track', icon: '📦' },
          { text: '💬 Talk to Support', id: 'zp_support', icon: '💬' }
        ]
      }
    ]
  },
  loan: {
    id: 'loan',
    name: 'Pre-Approved Loan Alert',
    subtitle: 'Shree Deep Infotech (Image 1)',
    badge: 'Banking & Financial DSA',
    leadName: 'Rahul Verma',
    phone: '+91 99887 76655',
    source: 'Google Search Ad',
    dealValue: '₹2,00,000',
    initialStatus: 'Urgency Follow-Up',
    messages: [
      {
        id: 'ln-1',
        sender: 'bot',
        text: '⚡ *E-approval alert!* Your personal loan of RS. 2,00,000 is ready to be disbursed.\n\nTo claim your funds, kindly verify your details right now:\nTap here to verify: https://bajajmarkets.com/claim-200k\n\n_Reply STOP to opt-out_',
        time: '12:24 PM',
        card: {
          type: 'loan_alert',
          amount: '₹2,00,000',
          status: 'Pre-Approved (Ready for Disbursal)'
        },
        buttons: [
          { text: '💰 Claim Funds Now', id: 'claim_now', icon: '💰' },
          { text: '👤 Talk to Loan Manager', id: 'talk_dsa', icon: '👤' },
          { text: '🛑 Reply STOP', id: 'opt_out', icon: '🛑' }
        ]
      }
    ]
  },
  agency: {
    id: 'agency',
    name: 'Agency & Expert Handover',
    subtitle: 'Oriana & Technovic (Images 5, 8, 12)',
    badge: 'B2B Services & SaaS',
    leadName: 'Sunita Rao (CEO)',
    phone: '+91 97766 55443',
    source: 'Direct WhatsApp Inflow',
    dealValue: '₹45,000',
    initialStatus: 'Qualified',
    messages: [
      {
        id: 'ag-1',
        sender: 'bot',
        text: 'Hi Sunita! ☀️ Welcome to Our Business. How can we assist you with our AI Automation & Web Development solutions?',
        time: '09:41 AM',
        buttons: [
          { text: '🏢 Our Services', id: 'ag_services', icon: '🏢' },
          { text: '💳 Pricing Packages', id: 'ag_pricing', icon: '💳' },
          { text: '📅 Book Discovery Call', id: 'ag_call', icon: '📅' },
          { text: '👤 Talk to Expert', id: 'ag_expert', icon: '👤' }
        ]
      }
    ]
  },
  followup: {
    id: 'followup',
    name: 'Broken Follow-up Resolution',
    subtitle: 'okstartups (Images 3 & 7)',
    badge: 'Pipeline Nudge',
    leadName: 'Amit Sharma',
    phone: '+91 98111 22334',
    source: 'Website Form (Inactive 2 Days)',
    dealValue: '₹35,000',
    initialStatus: 'Follow-up Due',
    messages: [
      {
        id: 'fu-1',
        sender: 'bot',
        text: "Hi Amit! 👋 We noticed you checked our automation packages 2 days ago.\n\nPrice isn't what loses leads — broken follow-ups do! Would you like a quick 10-minute live walkthrough of the automated pipeline?",
        time: '10:02 AM',
        card: {
          type: 'followup_status',
          source: 'Website Inquiry (2 days ago)',
          urgency: 'Action Needed: Follow-Up Due'
        },
        buttons: [
          { text: '🚀 Yes, Let’s Schedule', id: 'btn_schedule', icon: '🚀' },
          { text: '📄 Send Full Pricing PDF', id: 'btn_pricing_pdf', icon: '📄' },
          { text: '❌ Not Right Now', id: 'btn_not_now', icon: '❌' }
        ]
      }
    ]
  }
};

export default function WhatsAppInteractiveSimulator({ bot = {}, onSwitchBot }) {
  const [activePresetKey, setActivePresetKey] = useState('realestate');
  const [messages, setMessages] = useState(INDUSTRY_PRESETS.realestate.messages);
  const [simulating, setSimulating] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedMedia, setAttachedMedia] = useState(null);
  const fileInputRef = useRef(null);
  const chatScrollBoxRef = useRef(null);

  // Active Lead Pipeline State (Updates dynamically as customer converses)
  const [leadState, setLeadState] = useState({
    name: INDUSTRY_PRESETS.realestate.leadName,
    phone: INDUSTRY_PRESETS.realestate.phone,
    source: INDUSTRY_PRESETS.realestate.source,
    dealValue: INDUSTRY_PRESETS.realestate.dealValue,
    status: INDUSTRY_PRESETS.realestate.initialStatus,
    stageProgress: 60
  });

  // Reply mode and keyword filter
  const [replyMode, setReplyMode] = useState('all');
  const [keywords, setKeywords] = useState([
    'website', 'price', 'pricing', 'villa', 'brochure', 'loan', 'demo', 'quote', 'appointment'
  ]);
  const [newKeyword, setNewKeyword] = useState('');

  // Scroll internal chat container only (never scroll outer page/window)
  useEffect(() => {
    if (chatScrollBoxRef.current) {
      chatScrollBoxRef.current.scrollTop = chatScrollBoxRef.current.scrollHeight;
    }
  }, [messages, simulating]);

  // Handle Preset Switching
  const handleSelectPreset = (key) => {
    setActivePresetKey(key);
    const preset = INDUSTRY_PRESETS[key];
    setMessages(preset.messages);
    setLeadState({
      name: preset.leadName,
      phone: preset.phone,
      source: preset.source,
      dealValue: preset.dealValue,
      status: preset.initialStatus,
      stageProgress: key === 'realestate' ? 60 : (key === 'ecommerce' ? 40 : (key === 'loan' ? 70 : 50))
    });
  };

  // Handle Interactive Button Clicks inside message bubbles
  const handleButtonClick = (btn) => {
    const text = btn.text || btn.title;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Click as Customer Message
    const customerMsg = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text: text,
      time: timeNow
    };
    setMessages(prev => [...prev, customerMsg]);
    setSimulating(true);

    // 2. Automated Smart Branching based on button action
    setTimeout(() => {
      setSimulating(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (text.includes('Book Site Visit') || text.includes('Discovery Call') || text.includes('Schedule')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '📅 Excellent! We have dedicated VIP slots available this week. Please select your preferred time:',
            time: replyTime,
            buttons: [
              { text: '🗓️ Tomorrow 11:00 AM', id: 'slot_1', icon: '🗓️' },
              { text: '🗓️ Tomorrow 04:00 PM', id: 'slot_2', icon: '🗓️' },
              { text: '🗓️ Saturday 02:00 PM', id: 'slot_3', icon: '🗓️' }
            ]
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Selecting Appointment', stageProgress: 75 }));

      } else if (text.includes('Tomorrow') || text.includes('Saturday') || text.includes('Slot')) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `🎉 *Appointment Confirmed!*\n\nYour visit has been locked in for **${text}**.\n\n📍 Experience Center: Sector 45, Luxury Enclave.\n👤 Welcome Host: Senior Director Amit Sharma.\n\nWe look forward to meeting you!`,
            time: replyTime,
            card: {
              type: 'booking_confirmation',
              title: 'VIP Appointment Confirmed',
              details: text,
              location: 'Villa Palm Drive Experience Center'
            }
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Site Visit Booked', stageProgress: 90 }));

      } else if (text.includes('View Products') || text.includes('Our Services')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Here are our top trending solutions curated for rapid growth:',
            time: replyTime,
            card: {
              type: 'product_catalog',
              title: '⚡ 24/7 AI WhatsApp Automation Engine',
              price: '₹14,999 (Special 25% Off till midnight)',
              badge: 'Flash Sale Live'
            },
            buttons: [
              { text: '🛒 Shop Now & Checkout', id: 'buy_now', icon: '🛒' },
              { text: '📄 Request Full Brochure PDF', id: 'req_pdf', icon: '📄' },
              { text: '👤 Talk to Expert', id: 'talk_exp', icon: '👤' }
            ]
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Catalog Viewed', stageProgress: 50 }));

      } else if (text.includes('Brochure') || text.includes('PDF') || text.includes('Pricing PDF')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'Here is the comprehensive brochure with specs, pricing tiers, and architecture layout:',
            time: replyTime,
            card: {
              type: 'pdf_brochure',
              filename: 'NovaByte_Enterprise_Brochure.pdf',
              size: '3.4 MB',
              pages: '24 Pages (HD Architecture & Pricing)'
            },
            buttons: [
              { text: '📅 Book a Live Walkthrough', id: 'book_visit', icon: '📅' },
              { text: '👤 Speak with Senior Advisor', id: 'talk_advisor', icon: '👤' }
            ]
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Brochure Shared', stageProgress: 65 }));

      } else if (text.includes('Talk to Expert') || text.includes('Support') || text.includes('Advisor') || text.includes('Loan Manager')) {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: '🤝 *Handover Initiated*: Our Senior Consultant has received your lead details and will connect with you on this WhatsApp number within 10 minutes.',
            time: replyTime,
            card: {
              type: 'agent_handoff',
              agentName: 'Amit Sharma (Senior Solutions Director)',
              status: 'Connecting...',
              phone: '+91 98201 55660'
            }
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Qualified (Agent Assigned)', stageProgress: 85 }));

      } else if (text.includes('Claim Funds') || text.includes('Claim')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'To complete your instant disbursal of ₹2,00,000, please verify your KYC details securely here: https://bajajmarkets.com/claim-200k\n\n_Reply STOP to opt-out_',
            time: replyTime,
            card: {
              type: 'loan_alert',
              amount: '₹2,00,000',
              status: 'Ready for Immediate Disbursal'
            }
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Claim Link Dispatched', stageProgress: 80 }));

      } else if (text.toUpperCase().includes('STOP')) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: 'You have been successfully unsubscribed from automated WhatsApp messages. Reply START anytime if you wish to re-enable notifications.',
            time: replyTime
          }
        ]);
        setLeadState(prev => ({ ...prev, status: 'Opted Out / Unsubscribed', stageProgress: 0 }));

      } else {
        // Dynamic simulated fallback
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: `Thank you for selecting "${text}". How would you like to proceed next?`,
            time: replyTime,
            buttons: [
              { text: '👤 Talk to Expert', id: 'talk_expert', icon: '👤' },
              { text: '📅 Book an Appointment', id: 'book_visit', icon: '📅' }
            ]
          }
        ]);
      }
    }, 550);
  };

  // Send message from input box (connects to real backend if desired or simulated)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const textToSend = inputMessage.trim();
    if (!textToSend && !attachedMedia) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mediaToSend = attachedMedia;

    const customerMsg = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text: textToSend || (mediaToSend ? `[Attached ${mediaToSend.name}]` : ''),
      media: mediaToSend,
      time: timeStr
    };
    setMessages(prev => [...prev, customerMsg]);
    setInputMessage('');
    setAttachedMedia(null);
    setSimulating(true);

    try {
      const res = await fetch(`/api/whatsapp/${bot.id || 'bot-apex-agency'}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: leadState.phone,
          senderName: leadState.name,
          messageText: textToSend,
          media: mediaToSend ? {
            mimeType: mediaToSend.mimeType,
            base64: mediaToSend.base64,
            filename: mediaToSend.name
          } : null
        })
      });

      const data = await res.json();
      setSimulating(false);

      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            buttons: [
              { text: '👤 Talk to Expert', id: 'btn_exp', icon: '👤' },
              { text: '📅 Book an Appointment', id: 'btn_app', icon: '📅' }
            ]
          }
        ]);
        if (!data.optedOut) {
          confetti({ particleCount: 20, spread: 35, origin: { y: 0.7 } });
        }
      }
    } catch (err) {
      setSimulating(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Thank you for your message! Our team is reviewing your requirement and will reply shortly.`,
          time: timeStr
        }
      ]);
    }
  };

  const handleMarkWon = () => {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    setLeadState(prev => ({ ...prev, status: '🏆 Closed / Won Deal', stageProgress: 100 }));
  };

  const handleTriggerNudge = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '⚡ *Automated Follow-up Nudge*: Hi! We observed that you were reviewing our offerings. Can we answer any quick questions or send our pricing sheet?',
        time: timeNow,
        buttons: [
          { text: '💰 Send Pricing Sheet', id: 'nudge_price', icon: '💰' },
          { text: '📅 Schedule 10m Call', id: 'nudge_call', icon: '📅' }
        ]
      }
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── TOP INDUSTRY PRESET SELECTOR (Derived from all 15 images) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#10b981" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live WhatsApp Industry Scenarios (Extracted from 15 Campaign Images)
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Select any preset to test the exact interactive mobile screen flow &amp; lead capture
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {Object.keys(INDUSTRY_PRESETS).map((key) => {
            const p = INDUSTRY_PRESETS[key];
            const isSelected = activePresetKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: isSelected ? '#047857' : 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                  {isSelected && <Check size={14} color="#047857" />}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN 2-COLUMN DISPLAY: IPHONE MOCKUP ON LEFT, LEAD CRM ON RIGHT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: PIXEL-PERFECT WHATSAPP PHONE MOCKUP               */}
        {/* ============================================================== */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #d1d5db',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '700px'
        }}>
          {/* WhatsApp Header (Official Green Navigation Bar) */}
          <div style={{
            backgroundColor: '#075e54',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#128c7e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.25)'
              }}>
                {bot.bot_name ? bot.bot_name.charAt(0) : 'B'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{bot.bot_name || 'NovaByte Growth Bot'}</span>
                  <ShieldCheck size={14} color="#25D366" />
                </div>
                <div style={{ fontSize: '11px', color: '#dcf8c6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#25D366' }} />
                  <span>{simulating ? 'typing...' : 'Official Meta Business Partner'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'rgba(255,255,255,0.85)' }}>
              <Video size={17} style={{ cursor: 'pointer' }} />
              <Phone size={16} style={{ cursor: 'pointer' }} />
              <MoreVertical size={16} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {/* WhatsApp Chat Area Background with Wallpaper Texture */}
          <div
            ref={chatScrollBoxRef}
            style={{
              flex: 1,
              backgroundColor: '#efeae2',
              backgroundImage: 'radial-gradient(#d4cbbe 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Encryption Notice */}
            <div style={{
              backgroundColor: '#ffeecd',
              color: '#54656f',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '10.5px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              margin: '0 auto 6px auto',
              maxWidth: '90%'
            }}>
              🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
            </div>

            {/* Render Messages */}
            {messages.map((m) => {
              const isCustomer = m.sender === 'customer';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isCustomer ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    backgroundColor: isCustomer ? '#d9fdd3' : '#ffffff',
                    padding: '8px 12px',
                    borderRadius: isCustomer ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    position: 'relative'
                  }}>
                    {/* Plain Text Body */}
                    <div style={{ fontSize: '13px', color: '#111b21', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                      {formatWhatsAppText(m.text)}
                    </div>

                    {/* ── CARD: PDF BROCHURE PREVIEW (Growth Suite - Image 4) ── */}
                    {m.card && m.card.type === 'pdf_brochure' && (
                      <div style={{
                        marginTop: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FileText size={18} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.card.filename}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                              {m.card.size} • {m.card.pages}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Downloading verified brochure: ${m.card.filename}`)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}
                        >
                          <Download size={12} />
                          <span>View PDF</span>
                        </button>
                      </div>
                    )}

                    {/* ── CARD: PRODUCT CATALOG / FLASH SALE (AiSensy & Zoepact - Images 2 & 6) ── */}
                    {m.card && m.card.type === 'product_catalog' && (
                      <div style={{
                        marginTop: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="badge badge-purple" style={{ fontSize: '10px' }}>{m.card.badge}</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>Verified Offer</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{m.card.title}</div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#4f46e5', marginTop: '2px' }}>{m.card.price}</div>
                      </div>
                    )}

                    {/* ── CARD: LOAN APPROVAL ALERT (Shree Deep - Image 1) ── */}
                    {m.card && m.card.type === 'loan_alert' && (
                      <div style={{
                        marginTop: '8px',
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fef3c7',
                        borderRadius: '10px',
                        padding: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                          <Award size={14} />
                          <span>Pre-Approved Loan Grant</span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#92400e' }}>{m.card.amount}</div>
                        <div style={{ fontSize: '11px', color: '#78350f', marginTop: '2px' }}>{m.card.status}</div>
                      </div>
                    )}

                    {/* ── CARD: AGENT HANDOFF NOTICE (Oriana & Technovic - Images 5, 8, 12) ── */}
                    {m.card && m.card.type === 'agent_handoff' && (
                      <div style={{
                        marginTop: '8px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          AS
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>{m.card.agentName}</div>
                          <div style={{ fontSize: '10.5px', color: '#3b82f6' }}>{m.card.phone} • Active in Queue</div>
                        </div>
                      </div>
                    )}

                    {/* ── CLICKABLE WHATSAPP INTERACTIVE BUTTONS (Directly from Mockups) ── */}
                    {m.buttons && m.buttons.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginTop: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        paddingTop: '6px'
                      }}>
                        {m.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleButtonClick(btn)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              color: '#00a884',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                          >
                            <span>{btn.text}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Timestamp & Blue Ticks */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      marginTop: '4px',
                      fontSize: '10px',
                      color: '#667781'
                    }}>
                      <span>{m.time}</span>
                      {isCustomer && <CheckCheck size={13} color="#53bdeb" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {simulating && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: '14px 14px 14px 2px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#667781'
                }}>
                  <RefreshCw size={11} className="animate-spin" color="#10b981" />
                  <span>AI agent analyzing response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Attached Media Pending Bar */}
          {attachedMedia && (
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '6px 14px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                📎 {attachedMedia.name}
              </span>
              <button
                type="button"
                onClick={() => setAttachedMedia(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setAttachedMedia({ name: f.name, mimeType: f.type });
            }}
            style={{ display: 'none' }}
          />

          {/* Message Input Footer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              backgroundColor: '#f0f2f5',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderTop: '1px solid #e4e4e7'
            }}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach Document or Image"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#54656f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type customer reply or click buttons above..."
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={simulating}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#00a884',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: REAL-TIME INBOUND LEAD CRM & AUDIENCE INSPECTOR */}
        {/* ============================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Funnel Counters (Directly derived from okstartups & Growth Suite: Images 3 & 4) */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Lead Conversion Funnel (Real-Time)
              </span>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>68% Overall Conversion</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '8px 4px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)' }}>128</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>New Leads</div>
              </div>
              <div style={{ padding: '8px 4px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>82</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Replied</div>
              </div>
              <div style={{ padding: '8px 4px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>46</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Follow-ups</div>
              </div>
              <div style={{ padding: '8px 4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>25</div>
                <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>Converted</div>
              </div>
            </div>
          </div>

          {/* Active Lead Captured Card */}
          <div className="glass-panel" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Live Inbound Lead Attribute
              </span>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>
                {leadState.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                {leadState.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>{leadState.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{leadState.phone}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px' }}>Inbound Source:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{leadState.source}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px' }}>Estimated Pipeline Value:</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{leadState.dealValue}</span>
              </div>
            </div>

            {/* Pipeline Stage Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                <span>Pipeline Progression</span>
                <span>{leadState.stageProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${leadState.stageProgress}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* 1-Click High-Impact Sales Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleButtonClick({ text: '📄 Send Project Brochure PDF' })}
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '7px 8px', justifyContent: 'center' }}
              >
                <FileText size={13} />
                <span>Send Brochure</span>
              </button>

              <button
                onClick={() => handleButtonClick({ text: '📅 Book Site Visit' })}
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '7px 8px', justifyContent: 'center' }}
              >
                <Calendar size={13} />
                <span>Book Visit</span>
              </button>

              <button
                onClick={handleTriggerNudge}
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '7px 8px', justifyContent: 'center' }}
              >
                <Clock size={13} />
                <span>Push Nudge</span>
              </button>

              <button
                onClick={handleMarkWon}
                className="btn-primary"
                style={{ fontSize: '11.5px', padding: '7px 8px', justifyContent: 'center', backgroundColor: '#059669' }}
              >
                <Award size={13} />
                <span>Mark Deal Won</span>
              </button>
            </div>
          </div>

          {/* Smart Trigger & Anti-Ban Compliance Rules */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Anti-Ban &amp; Keyword Rules
              </span>
              <span className="badge badge-blue" style={{ fontSize: '10.5px' }}>
                Opt-Out Active
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              Complies with Meta guidelines: Customers sending <strong>"STOP"</strong> are instantly unsubscribed to protect phone numbers from spam reports.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontWeight: 600
                  }}
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
