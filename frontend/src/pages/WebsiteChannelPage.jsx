import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  AlertCircle,
  XCircle,
  FileText,
  Clock,
  Info,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

// High-fidelity Platform Logos matching Reference Image 1
const PlatformIcon = ({ id, color = '#334155', isSelected = false }) => {
  const fill = isSelected ? '#4f46e5' : color;

  switch (id) {
    case 'custom':
      return (
        <span style={{ 
          fontSize: '18px', 
          fontWeight: 900, 
          color: fill, 
          fontFamily: 'var(--font-mono)',
          letterSpacing: '-0.05em' 
        }}>
          &lt;/&gt;
        </span>
      );
    case 'wordpress':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489L4.47 9.878A9.972 9.972 0 0112 4c2.247 0 4.316.74 5.986 1.987L12 2zm8.53 7.878l-4.406 12.062C19.349 20.463 22 16.536 22 12c0-2.316-.788-4.45-2.112-6.148l-1.358 4.026zM12 22a9.957 9.957 0 005.107-1.396L13.882 11.23l-3.327 9.682A9.98 9.98 0 0012 22zM2.87 13.914C2.316 12.72 2 11.396 2 10c0-.85.12-1.673.344-2.455l3.858 10.567C4.606 16.91 3.518 15.518 2.87 13.914z"/>
        </svg>
      );
    case 'shopify':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
          <path d="M19.5 7.5L16.2 3.8A1.5 1.5 0 0015.08 3.33L9.62 4.19A1.5 1.5 0 008.43 5.1L5.3 12.2a1.5 1.5 0 00.32 1.63l6.5 6.5a1.5 1.5 0 002.12 0l5.58-5.58a1.5 1.5 0 00.44-1.06V8.63a1.5 1.5 0 00-.76-1.13zM14 13.5a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      );
    case 'wix':
      return (
        <span style={{ 
          fontSize: '15px', 
          fontWeight: 900, 
          fontFamily: 'var(--font-heading)', 
          color: fill, 
          letterSpacing: '-0.02em' 
        }}>
          WiX
        </span>
      );
    case 'squarespace':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
          <path d="M14.7 6.3a4.5 4.5 0 00-6.4 0L4.5 10.1a4.5 4.5 0 000 6.4l2.8 2.8a4.5 4.5 0 006.4 0l3.8-3.8a4.5 4.5 0 000-6.4l-2.8-2.8zm-1.4 7.8l-3.8 3.8a2.5 2.5 0 01-3.5 0L3.2 15.1a2.5 2.5 0 010-3.5l3.8-3.8a2.5 2.5 0 013.5 0l2.8 2.8a2.5 2.5 0 010 3.5z"/>
        </svg>
      );
    case 'webflow':
      return (
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '5px',
          backgroundColor: fill,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '13px',
          fontFamily: 'var(--font-heading)'
        }}>
          W
        </div>
      );
    case 'framer':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={fill}>
          <path d="M4 2h16v7h-8l8 7H4v-7h8L4 2z"/>
        </svg>
      );
    case 'godaddy':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
          <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 3.53 0 6.58-2.03 8.05-5H17.3a6.5 6.5 0 0 1-5.3 2.5A6.5 6.5 0 1 1 18.5 12c0 .88-.17 1.71-.48 2.48l2.25 1.3A9 9 0 0 0 12 3zm0 4.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5z"/>
        </svg>
      );
    case 'gtm':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v8l8 4 8-4v-8l-8 4z"/>
        </svg>
      );
    default:
      return <Code2 size={24} color={fill} />;
  }
};

const PLATFORMS = [
  {
    id: 'custom',
    name: 'Custom / other',
    time: 'About 2 min',
    heading: 'Add it to your Custom / other site',
    step1: 'Open the HTML file or template that every page on your site shares - usually index.html, or your header/layout include.',
    step2: 'Paste the code just above the closing </head> tag.',
    step3: 'Save and deploy your site as you normally would.',
    note: 'On React, Next.js, Vue or Nuxt, put it in the app’s root HTML shell (index.html) or the framework’s head/layout component so it loads on every page.'
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    time: 'About 3 min',
    heading: 'Add it to your WordPress site',
    step1: 'Log into your WordPress Admin Dashboard and go to Plugins > Add New.',
    step2: 'Install "Insert Headers and Footers" (or use your theme’s custom code settings) and paste the code into the Header section.',
    step3: 'Click Save Settings and clear your cache if applicable.',
    note: 'Works seamlessly on Elementor, Divi, Astra, and all standard WordPress block themes.'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    time: 'About 2 min',
    heading: 'Add it to your Shopify store',
    step1: 'Go to Online Store > Themes in your Shopify admin.',
    step2: 'Click Actions > Edit code, open theme.liquid, and paste the code right before </head>.',
    step3: 'Click Save in the top right.',
    note: 'The chat widget will load across product pages, cart, and collections automatically.'
  },
  {
    id: 'wix',
    name: 'Wix',
    time: 'About 3 min',
    heading: 'Add it to your Wix site',
    step1: 'Go to Settings > Custom Code in your Wix dashboard.',
    step2: 'Click + Add Custom Code, paste the code, and set "Place Code in" to Head.',
    step3: 'Click Apply and publish your site changes.',
    note: 'Ensure "All pages" is selected so the assistant is accessible site-wide.'
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    time: 'About 2 min',
    heading: 'Add it to your Squarespace site',
    step1: 'In the Home Menu, go to Settings > Developer Tools > Code Injection.',
    step2: 'Paste the code into the Header injection field.',
    step3: 'Click Save at the top of the panel.',
    note: 'Available on Squarespace Business and Commerce plans.'
  },
  {
    id: 'webflow',
    name: 'Webflow',
    time: 'About 2 min',
    heading: 'Add it to your Webflow site',
    step1: 'Open your Webflow Project Settings.',
    step2: 'Go to the Custom Code tab and paste the code into the "Head Code" field.',
    step3: 'Click Save Changes and Publish to all selected domains.',
    note: 'Custom code runs on published domains and Webflow staging.'
  },
  {
    id: 'framer',
    name: 'Framer',
    time: 'About 2 min',
    heading: 'Add it to your Framer site',
    step1: 'Go to Site Settings > General in your Framer dashboard.',
    step2: 'Scroll down to Custom Code and paste the code into the "<head> tag" section.',
    step3: 'Save and Publish your Framer site.',
    note: 'Your AI agent will launch immediately on the live Framer domain.'
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    time: 'About 3 min',
    heading: 'Add it to your GoDaddy site',
    step1: 'In your GoDaddy website builder, click Add Section to your header layout.',
    step2: 'Select HTML / Custom Code and paste the snippet.',
    step3: 'Click Done and Publish.',
    note: 'Paste in global header to show on every subpage.'
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    time: 'About 2 min',
    heading: 'Add via Google Tag Manager',
    step1: 'In your GTM Workspace, click Tags > New and select Custom HTML.',
    step2: 'Paste the code snippet and set Triggering to "All Pages (Page View)".',
    step3: 'Click Save and Submit / Publish your GTM container version.',
    note: 'Enables zero-code deployment without modifying core site files.'
  }
];

export default function WebsiteChannelPage({ bots = [] }) {
  const [searchParams] = useSearchParams();
  const botIdFromQuery = searchParams.get('botId');
  const [selectedBotId, setSelectedBotId] = useState(botIdFromQuery || bots[0]?.id || 'bot-apex-agency');

  useEffect(() => {
    if (botIdFromQuery) setSelectedBotId(botIdFromQuery);
  }, [botIdFromQuery]);
  const [websiteUrl, setWebsiteUrl] = useState('buildvora.netlify.app');
  const [stepsUnlocked, setStepsUnlocked] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('custom');
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [checkingSite, setCheckingSite] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showIframeAccordion, setShowIframeAccordion] = useState(false);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];
  const origin = window.location.origin;
  const scriptUrl = `${origin}/widget.js`;

  const linkTag = `<link rel="stylesheet" href="https://chatzy-kb-store.s3.amazonaws.com/icons/5ab07987-b5db-477c-82ff-1287e0883acb"/>`;
  const scriptTag = `<script src="${scriptUrl}" id="${selectedBot?.id || 'bot-apex-agency'}" class="chatzy_widget_script" defer></script>`;

  const embedCodeSnippet = `${linkTag}\n${scriptTag}`;

  const currentPlatformObj = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];

  // Full instruction text for "Copy code + steps" button
  const fullInstructionsText = `Please add the OmniBot AI chat widget to ${websiteUrl || 'your website'}.

Platform: ${currentPlatformObj.name} (${currentPlatformObj.time.toLowerCase()})

Steps:
1. ${currentPlatformObj.step1}
2. ${currentPlatformObj.step2}
3. ${currentPlatformObj.step3}

Code to paste:
${linkTag}
${scriptTag}

Note: ${currentPlatformObj.note}`;

  const handleCopyCodeOnly = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedCode(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyFullSteps = () => {
    navigator.clipboard.writeText(fullInstructionsText);
    setShowToast(true);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 } });
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSaveDomainAndSteps = async () => {
    setStepsUnlocked(true);
    // Persist domain restriction to bot in database
    if (selectedBotId && websiteUrl.trim()) {
      try {
        await fetch(`/api/bots/${selectedBotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ website_url: websiteUrl.trim() })
        });
      } catch (e) {
        console.error('Failed to update bot website url', e);
      }
    }
  };

  const handleCheckWebsite = async () => {
    if (!websiteUrl || !websiteUrl.trim()) {
      alert('Please enter a website domain or URL.');
      return;
    }

    setCheckingSite(true);
    setCheckResult(null);

    try {
      const res = await fetch('/api/verify-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl.trim(),
          botId: selectedBotId
        })
      });

      const data = await res.json();
      setCheckResult(data);

      if (data.success) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      setCheckResult({
        success: false,
        status: 'error',
        message: 'Could not connect to verification probe server.'
      });
    } finally {
      setCheckingSite(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      {/* Top Right Toast Notification matching Chatzy Image 2 */}
      {showToast && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '400px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <Check size={13} />
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
            Steps and code copied - paste them anywhere.
          </div>

          <button 
            onClick={() => setShowToast(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={14} />
          </button>

          {/* Animated green progress bar at bottom of toast */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: '#059669',
            width: '100%',
            animation: 'toastProgress 3.5s linear forwards'
          }} />
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', gap: '6px' }}>
        <span>Channels</span>
        <span>&gt;</span>
        <span style={{ color: 'var(--primary)' }}>Website</span>
      </div>

      {/* Main Title & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '24px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Globe size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
            Website
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Put your AI agent on your website as a chat bubble. No coding needed — we'll show you exactly where to paste it.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* STEP 1: CHOOSE AI AGENT */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Check size={14} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Choose your AI agent</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                This is the agent that will answer visitors on your site.
              </p>
            </div>
          </div>

          <select
            className="form-select"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
            style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
          >
            {bots.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bot_name}
              </option>
            ))}
          </select>
        </div>

        {/* STEP 2: WHERE SHOULD IT GO? */}
        <div className="glass-panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              border: '1.5px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--primary)'
            }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Where should it go?</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                The website your visitors land on.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="e.g. buildvora.netlify.app"
              style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
            />

            <div>
              <button
                onClick={handleSaveDomainAndSteps}
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
              >
                <span>{stepsUnlocked ? 'Update install steps' : 'Get install steps'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 3: ADD IT TO YOUR SITE */}
        {stepsUnlocked && (
          <div className="glass-panel animate-fade-in" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-subtle)',
                border: '1.5px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Add it to your site</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Tell us what your site is built with and follow the steps.
                </p>
              </div>
            </div>

            {/* Full-width, High-Fidelity 3x3 Platform Grid matching Chatzy Reference Image 1 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px',
              width: '100%',
              marginBottom: '24px'
            }}>
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    style={{
                      height: '92px',
                      minHeight: '92px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.04)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 10px',
                      boxSizing: 'border-box',
                      boxShadow: isSelected 
                        ? '0 0 0 1px var(--primary), 0 2px 8px rgba(79, 70, 229, 0.08)' 
                        : '0 1px 2px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <PlatformIcon id={p.id} isSelected={isSelected} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      textAlign: 'center',
                      lineHeight: 1.25
                    }}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* STEP-BY-STEP PLATFORM INSTRUCTION CARD (Matching Chatzy Image 1) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              {/* Header Title + Estimated Time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlatformIcon id={selectedPlatform} isSelected={true} />
                  <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentPlatformObj.heading}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Clock size={13} />
                  <span>{currentPlatformObj.time}</span>
                </div>
              </div>

              {/* Numbered Steps List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '18px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    1
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {currentPlatformObj.step1}
                  </div>
                </div>

                {/* Step 2 + Embed Code Card */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    2
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '10px' }}>
                      {currentPlatformObj.step2}
                    </div>

                    {/* Chatzy Code Box */}
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        padding: '8px 14px',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#ffffff'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          Embed code
                        </span>

                        <button
                          onClick={handleCopyCodeOnly}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '2px 6px'
                          }}
                        >
                          {copiedCode ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                          <span>{copiedCode ? 'Copied code' : 'Copy code'}</span>
                        </button>
                      </div>

                      {/* Code Content with syntax colors */}
                      <pre style={{
                        padding: '14px',
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        overflowX: 'auto',
                        color: 'var(--text-primary)'
                      }}>
                        <div>
                          <span style={{ color: '#e11d48' }}>&lt;link </span>
                          <span style={{ color: '#d97706' }}>rel</span>=
                          <span style={{ color: '#059669' }}>"stylesheet" </span>
                          <span style={{ color: '#d97706' }}>href</span>=
                          <span style={{ color: '#059669' }}>"https://chatzy-kb-store.s3.amazonaws.com/icons/5ab07987-b5db-477c-82ff-1287e0883acb"</span>
                          <span style={{ color: '#e11d48' }}>/&gt;</span>
                        </div>
                        <div>
                          <span style={{ color: '#e11d48' }}>&lt;script </span>
                          <span style={{ color: '#d97706' }}>src</span>=
                          <span style={{ color: '#059669' }}>"{scriptUrl}" </span>
                          <span style={{ color: '#d97706' }}>id</span>=
                          <span style={{ color: '#059669' }}>"{selectedBot?.id || 'bot-apex-agency'}" </span>
                          <span style={{ color: '#d97706' }}>class</span>=
                          <span style={{ color: '#059669' }}>"chatzy_widget_script" </span>
                          <span style={{ color: '#d97706' }}>defer</span>
                          <span style={{ color: '#e11d48' }}>&gt;&lt;/script&gt;</span>
                        </div>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    3
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {currentPlatformObj.step3}
                  </div>
                </div>
              </div>

              {/* Amber Callout Box matching Chatzy */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '12.5px',
                color: '#92400e',
                lineHeight: 1.45
              }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
                <div>
                  {currentPlatformObj.note}
                </div>
              </div>

              {/* Blue "Copy code + steps" button matching Chatzy Image 1 */}
              <div>
                <button
                  onClick={handleCopyFullSteps}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    border: '1px solid rgba(79, 70, 229, 0.25)',
                    color: 'var(--primary)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={14} />
                  <span>Copy code + steps</span>
                </button>
              </div>
            </div>

            {/* "Did it work?" Real Live HTTP Probe Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Did it work?
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  We'll open <strong>{websiteUrl || 'your site'}</strong> and look for the widget.
                </p>
              </div>

              <button
                onClick={handleCheckWebsite}
                disabled={checkingSite}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
              >
                <RefreshCw size={13} className={checkingSite ? 'animate-spin' : ''} />
                <span>{checkingSite ? 'Checking...' : 'Check my website'}</span>
              </button>
            </div>

            {/* Verification Result Feedback */}
            {checkResult && (
              <div className="animate-fade-in" style={{
                marginTop: '12px',
                padding: '14px 16px',
                borderRadius: '10px',
                background: checkResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${checkResult.success ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: checkResult.success ? '#059669' : '#dc2626',
                lineHeight: 1.45
              }}>
                {checkResult.success ? (
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <XCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    {checkResult.success ? 'Widget Detected' : 'Widget Not Detected'}
                  </div>
                  <div>{checkResult.message}</div>
                </div>
              </div>
            )}

            {/* Accordion: Prefer inside page instead of bubble? */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button
                onClick={() => setShowIframeAccordion(!showIframeAccordion)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                <span>Prefer the agent inside a page instead of a bubble?</span>
                {showIframeAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showIframeAccordion && (
                <div className="animate-fade-in" style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Embed the AI assistant directly inside an iframe on a dedicated Contact or Help page:
                  </p>
                  <pre style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    overflowX: 'auto'
                  }}>
                    {`<iframe src="${origin}/widget.js?embed=inline&botId=${selectedBot?.id || 'bot-apex-agency'}" width="100%" height="600" frameborder="0"></iframe>`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
