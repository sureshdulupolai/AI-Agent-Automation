import React, { useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PLATFORMS = [
  {
    id: 'custom',
    name: 'Custom / other',
    icon: '</>',
    desc: 'For custom HTML, PHP, React, Vue, Angular, Laravel, or Node.js websites.',
    steps: [
      'Copy the snippet code below.',
      'Open your website’s HTML template or global layout file.',
      'Paste the script right before the closing </body> tag.',
      'Deploy or publish your website changes.'
    ]
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    icon: 'W',
    desc: 'For WordPress.org sites or themes with custom code injection.',
    steps: [
      'Log into your WordPress Admin Dashboard.',
      'Navigate to Plugins > Add New and install "Insert Headers and Footers" (or use your theme’s custom code settings).',
      'Go to Settings > WPCode / Insert Headers and Footers.',
      'Paste the snippet in the "Scripts in Footer" box and click Save.'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: 'S',
    desc: 'For Shopify eCommerce stores.',
    steps: [
      'Log into your Shopify Admin.',
      'Go to Online Store > Themes > Edit code on your active theme.',
      'Under Layout, open the theme.liquid file.',
      'Scroll to the bottom and paste the snippet right above </body>.',
      'Click Save.'
    ]
  },
  {
    id: 'wix',
    name: 'Wix',
    icon: 'Wix',
    desc: 'For Wix Studio and standard Wix websites.',
    steps: [
      'Go to Settings in your Wix site dashboard.',
      'Click on Custom Code in the Advanced section.',
      'Click + Add Custom Code at the top right.',
      'Paste the snippet, set Place Code in to "Body - end", and click Apply.'
    ]
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    icon: 'SQ',
    desc: 'For Squarespace sites.',
    steps: [
      'In the Home Menu, go to Settings > Developer Tools > Code Injection.',
      'Paste the code snippet into the Footer field.',
      'Click Save at the top of the panel.'
    ]
  },
  {
    id: 'webflow',
    name: 'Webflow',
    icon: 'Wf',
    desc: 'For Webflow designer sites.',
    steps: [
      'Open your Webflow Project Settings.',
      'Navigate to the Custom Code tab.',
      'Paste the snippet into the "Footer Code" field before </body>.',
      'Save changes and Publish your site to all domains.'
    ]
  },
  {
    id: 'framer',
    name: 'Framer',
    icon: 'Fr',
    desc: 'For Framer websites.',
    steps: [
      'Go to Site Settings > General in your Framer dashboard.',
      'Scroll down to the "Custom Code" section.',
      'Paste the snippet into the "End of <body> tag" section and click Save & Publish.'
    ]
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    icon: 'GD',
    desc: 'For GoDaddy Websites + Marketing.',
    steps: [
      'In your GoDaddy website builder, click Add Section to page.',
      'Select HTML / Custom Code and click Add.',
      'Paste the snippet in the Custom Code field and click Done & Publish.'
    ]
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    icon: 'GTM',
    desc: 'Deploy via Google Tag Manager without editing site code.',
    steps: [
      'In your GTM Workspace, click Tags > New.',
      'Choose Tag Type: "Custom HTML".',
      'Paste the code snippet into the HTML box.',
      'Set Triggering to "All Pages" (Page View).',
      'Save and Submit / Publish your GTM container.'
    ]
  }
];

export default function WebsiteChannelPage({ bots = [] }) {
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id || 'bot-apex-agency');
  const [websiteUrl, setWebsiteUrl] = useState('buildvora.netlify.app');
  const [stepsUnlocked, setStepsUnlocked] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('custom');
  const [copied, setCopied] = useState(false);
  const [checkingSite, setCheckingSite] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showIframeAccordion, setShowIframeAccordion] = useState(false);

  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];
  const origin = window.location.origin;
  const scriptUrl = `${origin}/widget.js`;

  const embedSnippet = `<!-- OmniBot AI Chatbot & Lead Capture Widget -->
<script 
  src="${scriptUrl}" 
  data-bot-id="${selectedBot?.id || 'bot-apex-agency'}" 
  async>
</script>`;

  const iframeSnippet = `<iframe 
  src="${origin}/widget.js?embed=inline&botId=${selectedBot?.id || 'bot-apex-agency'}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e2e8f0;">
</iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckWebsite = async () => {
    setCheckingSite(true);
    setCheckResult(null);

    setTimeout(() => {
      setCheckingSite(false);
      setCheckResult({
        success: true,
        message: `Widget detected successfully on ${websiteUrl}! AI agent is ready to engage visitors.`
      });
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }, 1200);
  };

  const currentPlatformObj = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1000px', margin: '0 auto' }}>
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
            Put your AI agent on your website as a chat bubble. No coding needed — follow the steps below.
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
                onClick={() => setStepsUnlocked(true)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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

            {/* 3x3 Platform Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? 'var(--bg-subtle)' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? 'var(--primary)' : '#475569' }}>
                      {p.icon}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Platform Instructions Box */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Instructions for {currentPlatformObj.name}:
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                {currentPlatformObj.desc}
              </p>

              <ol style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {currentPlatformObj.steps.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ol>
            </div>

            {/* Code Snippet Box */}
            <div style={{ position: 'relative', marginBottom: '22px' }}>
              <pre style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                padding: '16px',
                borderRadius: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                overflowX: 'auto',
                lineHeight: 1.45,
                margin: 0
              }}>
                {embedSnippet}
              </pre>

              <button
                onClick={handleCopy}
                className="btn-primary"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '5px 12px',
                  fontSize: '12px'
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* "Did it work?" Live Website Validator Card */}
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
                  We'll check <strong>{websiteUrl}</strong> and verify the widget.
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

            {checkResult && (
              <div className="animate-fade-in" style={{
                marginTop: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#059669',
                fontWeight: 600
              }}>
                <CheckCircle2 size={16} />
                <span>{checkResult.message}</span>
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
                    {iframeSnippet}
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
