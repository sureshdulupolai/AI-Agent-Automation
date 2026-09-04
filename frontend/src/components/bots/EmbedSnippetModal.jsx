import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import confetti from 'canvas-confetti';

const COLOR_PRESETS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#0891b2', // Cyan
  '#d97706', // Amber
  '#e11d48', // Rose
  '#7c3aed'  // Purple
];

export default function EmbedSnippetModal({ bot, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('html');
  const [embedColor, setEmbedColor] = useState(bot?.primary_color || '#4f46e5');

  if (!bot) return null;

  const activeEmbedColor = (embedColor && embedColor.trim())
    ? (embedColor.trim().startsWith('#') ? embedColor.trim() : `#${embedColor.trim()}`)
    : (bot.primary_color || '#4f46e5');

  const origin = window.location.origin;
  const scriptUrl = `${origin}/widget.js`;
  const previewUrl = `${origin}/demo?botId=${bot.id}&color=${encodeURIComponent(activeEmbedColor)}`;

  const htmlCode = `<!-- NovaByte AI Chatbot & Lead Capture Widget -->
<script 
  src="${scriptUrl}?color=${encodeURIComponent(activeEmbedColor)}" 
  data-bot-id="${bot.id}"
  data-color="${activeEmbedColor}"
  async>
</script>`;

  const reactCode = `import { useEffect } from 'react';

export default function NovaByteWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "${scriptUrl}?color=${encodeURIComponent(activeEmbedColor)}";
    script.setAttribute('data-bot-id', "${bot.id}");
    script.setAttribute('data-color', "${activeEmbedColor}");
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
          src="${scriptUrl}?color=${encodeURIComponent(activeEmbedColor)}" 
          data-bot-id="${bot.id}"
          data-color="${activeEmbedColor}"
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}`;

  const wordpressCode = `<!-- WordPress / Webflow Integration -->
1. Open Theme Editor or Header/Footer script injection.
2. Paste before closing </body> tag:

<script src="${scriptUrl}?color=${encodeURIComponent(activeEmbedColor)}" data-bot-id="${bot.id}" data-color="${activeEmbedColor}"></script>`;

  const directUrlCode = `<!-- Direct Standalone URL (Zero DB Load) -->\n${previewUrl}`;

  const snippets = {
    html: htmlCode,
    react: reactCode,
    nextjs: nextJsCode,
    wordpress: wordpressCode,
    direct: directUrlCode
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${activeEmbedColor}, #0891b2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 3px 10px ${activeEmbedColor}40`,
              transition: 'all 0.3s ease'
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

        {/* Dynamic Color Palette & Zero-DB Customizer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Embed Brand Color:
            </span>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {COLOR_PRESETS.map((color) => {
                const isSelected = activeEmbedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setEmbedColor(color)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: isSelected ? '2px solid #0f172a' : '1.5px solid transparent',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: isSelected ? `0 2px 6px ${color}80` : '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ position: 'relative', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', margin: 0 }}>
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(activeEmbedColor) ? activeEmbedColor : '#4f46e5'}
                onChange={(e) => setEmbedColor(e.target.value)}
                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
              />
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: activeEmbedColor,
                border: '1px solid rgba(0,0,0,0.2)'
              }} />
            </label>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>#</span>
            <input
              type="text"
              maxLength={6}
              value={activeEmbedColor.replace(/^#/, '')}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                setEmbedColor(clean ? `#${clean}` : '');
              }}
              style={{
                width: '56px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#0f172a',
                textTransform: 'uppercase',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Tab Selector - 5 Responsive Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
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
            { id: 'wordpress', label: 'WordPress' },
            { id: 'direct', label: 'Direct URL' }
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
                fontSize: '12px',
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
          <strong>⚡ Dynamic & Server-Safe:</strong> The color code is passed directly in the script / URL query parameters, so your client website renders with this color dynamically without requiring extra database updates or overloading the server.
        </div>
      </div>
    </div>
  );
}
