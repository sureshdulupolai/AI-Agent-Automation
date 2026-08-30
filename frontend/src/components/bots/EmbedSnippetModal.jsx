import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe, Terminal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EmbedSnippetModal({ bot, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('html');

  if (!bot) return null;

  const origin = window.location.origin;
  const scriptUrl = `${origin}/widget.js`;

  const htmlCode = `<!-- OmniBot AI Chatbot & Lead Capture Widget -->
<script 
  src="${scriptUrl}" 
  data-bot-id="${bot.id}"
  async>
</script>`;

  const reactCode = `import { useEffect } from 'react';

export default function OmniBotWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "${scriptUrl}";
    script.setAttribute('data-bot-id', "${bot.id}");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`;

  const nextJsCode = `import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script 
          src="${scriptUrl}" 
          data-bot-id="${bot.id}"
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}`;

  const wordpressCode = `1. Go to your WordPress Dashboard -> Appearance -> Theme File Editor (or install 'Insert Headers and Footers' plugin).
2. Paste the following script right before the closing </body> tag:

<script src="${scriptUrl}" data-bot-id="${bot.id}"></script>`;

  const snippets = {
    html: htmlCode,
    react: reactCode,
    nextjs: nextJsCode,
    wordpress: wordpressCode
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '680px',
        maxWidth: '100%',
        backgroundColor: 'var(--bg-surface)',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>1-Click Embed Snippet</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Embed <strong>{bot.bot_name}</strong> on any website or CMS in 10 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          {[
            { id: 'html', label: 'HTML / PHP / Shopify' },
            { id: 'react', label: 'React.js' },
            { id: 'nextjs', label: 'Next.js' },
            { id: 'wordpress', label: 'WordPress / Webflow' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <pre style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '18px',
            borderRadius: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            overflowX: 'auto',
            lineHeight: 1.5
          }}>
            {snippets[activeTab]}
          </pre>

          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 12px',
              fontSize: '12px'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied Code!' : 'Copy'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'var(--bg-subtle)',
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12.5px',
          color: 'var(--text-secondary)'
        }}>
          💡 <strong>Tip:</strong> Paste this code right before the closing <code>&lt;/body&gt;</code> tag of your website. The widget loads asynchronously without affecting site speed.
        </div>
      </div>
    </div>
  );
}
