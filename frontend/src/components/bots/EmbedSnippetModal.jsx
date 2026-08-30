import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
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

  const wordpressCode = `<!-- WordPress / Webflow Integration -->
1. Open Theme Editor or Header/Footer script injection.
2. Paste before closing </body> tag:

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
        width: '640px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        padding: '24px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>1-Click Embed Snippet</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Embed <strong>{bot.bot_name}</strong> on any website or CMS in 10 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '5px', borderRadius: '50%', width: '30px', height: '30px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Selector - Fixed Height & Non-wrapping */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '14px',
          height: '38px',
          boxSizing: 'border-box'
        }}>
          {[
            { id: 'html', label: 'HTML / JS' },
            { id: 'react', label: 'React' },
            { id: 'nextjs', label: 'Next.js' },
            { id: 'wordpress', label: 'WordPress' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                borderRadius: '6px',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Snippet Box - Fixed Rigid Height */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <pre style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            padding: '16px',
            borderRadius: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            overflowX: 'auto',
            overflowY: 'auto',
            lineHeight: 1.45,
            height: '180px',
            minHeight: '180px',
            maxHeight: '180px',
            boxSizing: 'border-box',
            margin: 0
          }}>
            {snippets[activeTab]}
          </pre>

          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '5px 10px',
              fontSize: '11.5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          background: 'var(--bg-subtle)',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.4
        }}>
          <strong>Tip:</strong> Paste this code right before the closing <code>&lt;/body&gt;</code> tag of your website.
        </div>
      </div>
    </div>
  );
}
