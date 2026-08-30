/**
 * OmniBot Universal Web Embed Widget - v2.0 (Chatzy Inspired)
 * High-Performance, Zero-Dependency, Encapsulated Shadow DOM Chatbot
 * Supports: Custom Launcher Icons, Teaser Popups, Left/Right Positioning, Light/Dark Modes
 */

(function () {
  'use strict';

  if (window.__OMNIBOT_INITIALIZED__) return;
  window.__OMNIBOT_INITIALIZED__ = true;

  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('widget.js')) return scripts[i];
    }
    return scripts[scripts.length - 1];
  })();

  const botId = currentScript ? currentScript.getAttribute('data-bot-id') : null;
  const scriptUrl = currentScript ? currentScript.src : window.location.origin;
  const urlObj = new URL(scriptUrl, window.location.href);
  const backendBaseUrl = currentScript.getAttribute('data-api-url') || urlObj.origin;

  if (!botId) {
    console.warn('⚠️ OmniBot Widget: "data-bot-id" attribute is required.');
    return;
  }

  const STORAGE_KEY = `omnibot_sess_${botId}`;
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  const hostElement = document.createElement('div');
  hostElement.id = 'omnibot-widget-host';
  document.body.appendChild(hostElement);

  const shadow = hostElement.attachShadow({ mode: 'open' });

  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  let botConfig = {
    id: botId,
    bot_name: 'AI Support Assistant',
    bot_avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    primary_color: '#4f46e5',
    welcome_message: 'Hello! 👋 How can I help you today?',
    placeholder_text: 'Type a message...',
    quick_prompts: ['What services do you offer?', 'Pricing details', 'Talk to an agent'],
    launcher_icon: 'chat',
    launcher_position: 'bottom-right',
    teaser_text: '👋 Need help? Chat with our AI!',
    show_teaser: true,
    theme_mode: 'light'
  };

  let isOpen = false;
  let isTyping = false;
  let isTeaserVisible = true;
  let messages = [];

  // Get icon SVG based on launcher_icon
  function getLauncherIconSvg(iconType, avatarUrl) {
    if (iconType === 'avatar' && avatarUrl) {
      return `<img src="${avatarUrl}" class="launcher-avatar-img" alt="Chat" />`;
    }
    if (iconType === 'sparkles') {
      return `<svg class="icon-chat" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    }
    if (iconType === 'headset') {
      return `<svg class="icon-chat" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`;
    }
    if (iconType === 'bot') {
      return `<svg class="icon-chat" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
    }
    // Default chat bubble
    return `<svg class="icon-chat" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  }

  function renderWidget() {
    const primary = botConfig.primary_color || '#4f46e5';
    const isLeft = botConfig.launcher_position === 'bottom-left';
    const isDark = botConfig.theme_mode === 'dark';

    shadow.innerHTML = `
      <style>
        :host {
          --omnibot-primary: ${primary};
          --omnibot-bg: ${isDark ? '#0f172a' : '#ffffff'};
          --omnibot-body-bg: ${isDark ? '#090d16' : '#f8fafc'};
          --omnibot-text: ${isDark ? '#f8fafc' : '#0f172a'};
          --omnibot-text-muted: ${isDark ? '#94a3b8' : '#64748b'};
          --omnibot-border: ${isDark ? '#24324f' : '#e2e8f0'};
          --omnibot-bot-bubble: ${isDark ? '#1e293b' : '#ffffff'};
          --omnibot-input-bg: ${isDark ? '#131d31' : '#f1f5f9'};
          --omnibot-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          all: initial;
          font-family: var(--omnibot-font);
          z-index: 999999;
          position: fixed;
          bottom: 24px;
          ${isLeft ? 'left: 24px;' : 'right: 24px;'}
          display: flex;
          flex-direction: column;
          align-items: ${isLeft ? 'flex-start' : 'flex-end'};
          pointer-events: none;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Teaser Popup Bubble */
        .teaser-bubble {
          pointer-events: auto;
          background: #ffffff;
          color: #0f172a;
          padding: 10px 14px;
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08);
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          cursor: pointer;
          transform-origin: ${isLeft ? 'bottom left' : 'bottom right'};
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 260px;
          line-height: 1.35;
        }

        .teaser-bubble.hidden { display: none; }

        .teaser-close {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 50%;
        }
        .teaser-close:hover { color: #0f172a; }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Launcher Button */
        .launcher-btn {
          pointer-events: auto;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--omnibot-primary);
          color: #ffffff;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }

        .launcher-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 14px 28px -4px rgba(0, 0, 0, 0.35);
        }

        .launcher-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .launcher-btn svg {
          width: 26px;
          height: 26px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .launcher-btn.open svg.icon-chat, .launcher-btn.open .launcher-avatar-img { display: none; }
        .launcher-btn:not(.open) svg.icon-close { display: none; }

        .badge-dot {
          position: absolute;
          top: 0;
          right: 0;
          width: 13px;
          height: 13px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }

        /* Chat Window */
        .chat-window {
          pointer-events: auto;
          width: 380px;
          max-width: calc(100vw - 32px);
          height: 580px;
          max-height: calc(100vh - 110px);
          background: var(--omnibot-bg);
          border-radius: 20px;
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px var(--omnibot-border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-bottom: 14px;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          transform-origin: ${isLeft ? 'bottom left' : 'bottom right'};
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chat-window.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }

        /* Header */
        .chat-header {
          background: var(--omnibot-primary);
          color: #ffffff;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left { display: flex; align-items: center; gap: 12px; }

        .avatar-wrap {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.6);
        }

        .avatar-status {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 10px;
          height: 10px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }

        .bot-meta h3 { font-size: 15px; font-weight: 600; line-height: 1.2; color: #ffffff; }
        .bot-meta p { font-size: 12px; color: rgba(255, 255, 255, 0.85); display: flex; align-items: center; gap: 4px; }

        .header-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-btn:hover { background: rgba(255, 255, 255, 0.35); }

        /* Message Stream */
        .chat-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--omnibot-body-bg);
          scroll-behavior: smooth;
        }

        .msg-row { display: flex; gap: 8px; max-width: 85%; }
        .msg-row.bot { align-self: flex-start; }
        .msg-row.user { align-self: flex-end; flex-direction: row-reverse; }

        .msg-bubble {
          padding: 11px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.45;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .msg-row.bot .msg-bubble {
          background: var(--omnibot-bot-bubble);
          color: var(--omnibot-text);
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--omnibot-border);
        }

        .msg-row.user .msg-bubble {
          background: var(--omnibot-primary);
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        .quick-prompts-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }

        .prompt-chip {
          background: var(--omnibot-bg);
          color: var(--omnibot-primary);
          border: 1px solid var(--omnibot-border);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .prompt-chip:hover {
          background: var(--omnibot-primary);
          color: #ffffff;
          border-color: var(--omnibot-primary);
        }

        .typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          background: var(--omnibot-bot-bubble);
          border: 1px solid var(--omnibot-border);
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          width: fit-content;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: var(--omnibot-primary);
          border-radius: 50%;
          opacity: 0.6;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        /* Footer */
        .chat-footer {
          background: var(--omnibot-bg);
          padding: 12px 16px;
          border-top: 1px solid var(--omnibot-border);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--omnibot-input-bg);
          border-radius: 12px;
          padding: 4px 6px 4px 14px;
          border: 1px solid transparent;
        }
        .input-row:focus-within {
          background: var(--omnibot-bg);
          border-color: var(--omnibot-primary);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 13.5px;
          color: var(--omnibot-text);
          outline: none;
          padding: 8px 0;
          font-family: inherit;
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--omnibot-primary);
          color: #ffffff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .send-btn:disabled { opacity: 0.4; }

        .branding-tag {
          font-size: 10px;
          color: var(--omnibot-text-muted);
          text-align: center;
          font-weight: 500;
        }
        .branding-tag span { color: var(--omnibot-primary); font-weight: 600; }
      </style>

      <!-- Teaser Greeting Popup Bubble -->
      ${botConfig.show_teaser && botConfig.teaser_text && isTeaserVisible && !isOpen ? `
        <div class="teaser-bubble" id="teaser-bubble">
          <span>${escapeHtml(botConfig.teaser_text)}</span>
          <button class="teaser-close" id="teaser-close-btn" title="Dismiss">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      ` : ''}

      <!-- Chat Window -->
      <div class="chat-window" id="omnibot-window">
        <div class="chat-header">
          <div class="header-left">
            <div class="avatar-wrap">
              <img class="avatar-img" id="bot-avatar" src="${botConfig.bot_avatar_url}" alt="${botConfig.bot_name}" />
              <div class="avatar-status"></div>
            </div>
            <div class="bot-meta">
              <h3 id="bot-name">${botConfig.bot_name}</h3>
              <p>Online</p>
            </div>
          </div>
          <button class="header-btn" id="close-modal-btn" title="Close Chat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="chat-body" id="chat-stream"></div>

        <div class="chat-footer">
          <div class="input-row">
            <input type="text" class="chat-input" id="chat-input" placeholder="${botConfig.placeholder_text}" autocomplete="off" />
            <button class="send-btn" id="send-btn" title="Send message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <div class="branding-tag">Powered by <span>OmniBot</span></div>
        </div>
      </div>

      <!-- Floating Launcher Button -->
      <button class="launcher-btn" id="launcher-btn" aria-label="Open Chat">
        <div class="badge-dot"></div>
        ${getLauncherIconSvg(botConfig.launcher_icon, botConfig.bot_avatar_url)}
        <svg class="icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;

    bindEvents();
    renderMessages();
  }

  function bindEvents() {
    const launcherBtn = shadow.getElementById('launcher-btn');
    const closeBtn = shadow.getElementById('close-modal-btn');
    const sendBtn = shadow.getElementById('send-btn');
    const input = shadow.getElementById('chat-input');
    const teaserBubble = shadow.getElementById('teaser-bubble');
    const teaserClose = shadow.getElementById('teaser-close-btn');

    launcherBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    if (teaserBubble) {
      teaserBubble.addEventListener('click', (e) => {
        if (e.target.closest('#teaser-close-btn')) return;
        toggleChat();
      });
    }

    if (teaserClose) {
      teaserClose.addEventListener('click', (e) => {
        e.stopPropagation();
        isTeaserVisible = false;
        renderWidget();
      });
    }

    sendBtn.addEventListener('click', () => sendMessage(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    isTeaserVisible = false;
    const windowEl = shadow.getElementById('omnibot-window');
    const launcherBtn = shadow.getElementById('launcher-btn');
    const teaserBubble = shadow.getElementById('teaser-bubble');

    if (teaserBubble) teaserBubble.classList.add('hidden');

    if (isOpen) {
      windowEl.classList.add('visible');
      launcherBtn.classList.add('open');
      const input = shadow.getElementById('chat-input');
      setTimeout(() => input.focus(), 250);
    } else {
      windowEl.classList.remove('visible');
      launcherBtn.classList.remove('open');
    }
  }

  function renderMessages() {
    const stream = shadow.getElementById('chat-stream');
    if (!stream) return;

    let html = '';

    messages.forEach((msg) => {
      const isBot = msg.sender === 'bot';
      html += `
        <div class="msg-row ${isBot ? 'bot' : 'user'}">
          <div class="msg-bubble">${escapeHtml(msg.content)}</div>
        </div>
      `;
    });

    if (messages.length === 1 && botConfig.quick_prompts && botConfig.quick_prompts.length > 0) {
      html += `
        <div class="quick-prompts-wrap">
          ${botConfig.quick_prompts
            .map((p) => `<button class="prompt-chip" data-prompt="${escapeHtml(p)}">${escapeHtml(p)}</button>`)
            .join('')}
        </div>
      `;
    }

    if (isTyping) {
      html += `
        <div class="msg-row bot">
          <div class="typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      `;
    }

    stream.innerHTML = html;
    stream.scrollTop = stream.scrollHeight;

    stream.querySelectorAll('.prompt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt');
        sendMessage(text);
      });
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function sendMessage(text) {
    if (!text || !text.trim() || isTyping) return;

    const input = shadow.getElementById('chat-input');
    input.value = '';

    messages.push({
      sender: 'user',
      content: text.trim(),
      created_at: new Date().toISOString()
    });

    isTyping = true;
    renderMessages();

    try {
      const response = await fetch(`${backendBaseUrl}/api/chat/${botId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId })
      });

      if (!response.ok) throw new Error('Chat API returned error');
      const data = await response.json();
      isTyping = false;

      messages.push({
        sender: 'bot',
        content: data.reply,
        created_at: data.timestamp || new Date().toISOString()
      });

      playChime();
    } catch (err) {
      isTyping = false;
      messages.push({
        sender: 'bot',
        content: "Sorry, I am having trouble connecting to the server. Please try again shortly.",
        created_at: new Date().toISOString()
      });
    }

    renderMessages();
  }

  async function fetchConfig() {
    try {
      const res = await fetch(`${backendBaseUrl}/api/bots/${botId}/public`);
      if (res.ok) {
        const data = await res.json();
        botConfig = { ...botConfig, ...data };
      }
    } catch (e) {}

    messages = [
      {
        sender: 'bot',
        content: botConfig.welcome_message,
        created_at: new Date().toISOString()
      }
    ];

    renderWidget();
  }

  fetchConfig();
})();
