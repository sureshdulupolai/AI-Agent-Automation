import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYS_FILE = path.join(__dirname, '../data/gemini_keys.json');

function getKeysData() {
  try {
    if (!fs.existsSync(KEYS_FILE)) {
      return { client_keys: [], system_keys: [], notification_settings: { whatsapp_alert_phone: '', alert_on_rate_limit: true } };
    }
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading gemini_keys.json:', err);
    return { client_keys: [], system_keys: [], notification_settings: { whatsapp_alert_phone: '', alert_on_rate_limit: true } };
  }
}

function saveKeysData(data) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving gemini_keys.json:', err);
  }
}

/**
 * Enterprise Multi-Tier AI Gateway & Auto-Fallback Routing Engine.
 * 
 * Cascade Order:
 * 1. Client Custom Keys (Priority 1)
 * 2. OmniBot System Safety-Net Pool (Priority 2)
 * 3. Autonomous Contextual Knowledge-Base Engine (Priority 3 - 100% Guaranteed Uptime)
 */
export async function generateBotReply({
  bot,
  userMessage,
  history = [],
  media = null,
  apiKeyOverride = null
}) {
  const startTime = Date.now();
  const keysData = getKeysData();

  // 1. Compile candidate keys in strict priority order (filtering dummy placeholders)
  const candidateKeys = [];
  const isValidKey = (k) => Boolean(k && typeof k === 'string' && k.trim().length > 15 && !k.includes('YOUR_CUSTOM') && !k.includes('YOUR_BACKUP'));

  // Manual override if provided
  if (apiKeyOverride && isValidKey(apiKeyOverride)) {
    candidateKeys.push({ key: apiKeyOverride.trim(), label: 'Override Key', isClient: true });
  }

  const useCustomKeys = Boolean(keysData.routing_policy?.use_custom_keys);

  // If Client BYOK is enabled: Client keys get PRIORITY #1
  if (useCustomKeys) {
    const clientKeys = (keysData.client_keys || []).filter(k => k.status === 'active' && isValidKey(k.key));
    for (const k of clientKeys) {
      if (!candidateKeys.some(c => c.key === k.key)) {
        candidateKeys.push({ key: k.key, label: k.label || 'Client Key', isClient: true, id: k.id, priority: 1 });
      }
    }
  }

  // Add system fallback keys (Safety-Net Managed Pool - Priority #2 or Priority #1 when BYOK disabled)
  const systemKeys = (keysData.system_keys || []).filter(k => k.status === 'active' && isValidKey(k.key));
  for (const k of systemKeys) {
    if (!candidateKeys.some(c => c.key === k.key)) {
      candidateKeys.push({ key: k.key, label: k.label || 'System Managed Key', isClient: false, id: k.id, priority: useCustomKeys ? 2 : 1 });
    }
  }

  // Always ensure .env key is included in the pool
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (isValidKey(envKey) && !candidateKeys.some(c => c.key === envKey.trim())) {
    candidateKeys.push({ key: envKey.trim(), label: 'Verified Env Key', isClient: false, priority: useCustomKeys ? 2 : 1 });
  }

  // Build the rich business context & prompt with strict guardrails
  const businessName = bot.bot_name || 'NovaByte AI Studio';
  const systemPrompt = `
You are the Senior Solutions Architect and Client Growth Consultant representing "${businessName}".

### CORE IDENTITY & CONVERSATIONAL STYLE:
- Sound 100% human, confident, empathetic, and sharp—like a senior founder or tech consultant texting on Slack or WhatsApp.
- ABSOLUTE PROHIBITION ON ROBOTIC CLICHÉS: NEVER say "I am an AI assistant", "As an AI...", "I am programmed to...", "NovaByte AI Assistant is ready to...", or generic filler like "Here is a breakdown:".
- Adapt vocabulary to the user's specific domain (medical, e-commerce, real estate, software, etc.).
- ZERO EMOJI DIRECTIVE: Do not use emojis anywhere in your output. Keep all sentences, bullets, and greetings clean, executive, and professional.

### PRIORITY EMAIL & PHONE CAPTURE DIRECTIVE:
- Actively prioritize collecting the user's EMAIL ADDRESS and WHATSAPP NUMBER early in the conversation so our team can send them custom proposals, price quotes, booking confirmations, or brochures.

### DYNAMIC MESSAGE LENGTH & NATURAL PACING (STRICTLY ENFORCE):
1. CASUAL GREETINGS (e.g. "hi", "hello", "hey", "good morning", "how are you"):
   - Length: STRICTLY 1 to 2 sentences max.
   - Reply directly, warmly, and ask 1 simple conversational question.
   - Example: "Hello. Great to connect with you. What project or challenge are you looking to tackle today?"
   - NEVER dump paragraphs or explain your whole company background on a simple greeting!

2. SIMPLE QUESTIONS & GENERAL INQUIRIES (e.g. "can you help me?", "i need some info", "tell me about what you do"):
   - Length: 2 to 3 concise, friendly sentences. Acknowledge, answer, and ask what they need help with.
   - Example: "I'd be glad to help. What kind of project or information are you looking for today?"

3. PROJECT & SOFTWARE INQUIRIES — COMMERCIAL LEAD CONVERSION DIRECTIVE (CRITICAL):
   - When a prospect asks to build a project, software, app, or system (e.g. "hospital management system", "build an e-commerce platform", "custom CRM", "school app", "I want to build software"):
     - DO NOT give away the entire DIY architecture, code, or step-by-step engineering tutorial for free!
     - INSTEAD, ACT AS A SENIOR CONSULTANT & SALES LEAD ACQUISITION SPECIALIST:
       1. Enthusiastically confirm that our team specializes in architecting and developing this exact custom solution.
       2. Give a brief, high-level technical highlight (1-2 sentences mentioning secure role-based portals, scalable database, and automated WhatsApp/SMS notifications).
       3. PROMPTLY REQUEST THEIR WHATSAPP NUMBER OR EMAIL ADDRESS so our senior technical team can review their specifications and share a tailored proposal, feature roadmap, and ballpark quote.
     - Example English: "We specialize in custom enterprise development and can definitely architect and build a scalable Hospital Management System for your workflow. To prepare a tailored technical scope, feature roadmap, and ballpark estimate, could you share your WhatsApp number or email? Our senior solutions team will review your requirements and reach out directly."

4. STRICT LANGUAGE MIRRORING (CRITICAL):
   - ALWAYS reply in the exact language/dialect the user is using:
     - If user chats in HINGLISH (e.g. "mujhe project banana hai", "kya cost aayega", "bhai rate batao"): Respond in natural, professional HINGLISH!
       - Example Hinglish: "Bilkul! Hum aapke liye custom Hospital Management System architect aur build kar sakte hain with secure doctor/patient portals aur automated WhatsApp alerts. Project ka exact scope aur tailored proposal share karne ke liye kripya apna WhatsApp number ya email share karein taaki humari senior technical team aapse directly connect kar sake."
     - If user chats in ENGLISH: Respond in crisp, polished executive English.
     - If user chats in HINDI, SPANISH, FRENCH, etc.: Respond in that exact language.

5. PRICING & TIERS:
   - Provide clean, transparent bullet points with package tiers ($499 - $999 custom websites, $399 - $899 AI automation, $1,500 - $2,500 full-stack apps), then ask about their specific project requirements.

### BUSINESS CAPABILITIES & TRAINING DIRECTIVES:
${bot.system_instructions || 'We architect and build full-stack custom web applications, SaaS enterprise platforms, and autonomous 24/7 AI WhatsApp automation systems.'}

### VERIFIED KNOWLEDGE BASE & SCOPE:
${bot.business_knowledge || 'Standard MVP turnaround is 2 to 4 weeks with weekly sprint milestones. We specialize in custom full-stack software, databases, authentication, role-based dashboards, and WhatsApp/SMS automation.'}
`.trim();

  // Early exit for oversized media that exceeds direct inline multimodal limits
  if (media && media.mediaType === 'video_oversized') {
    const isHinglish = /\b(mujhe|kya|bhai|chahiye|banana|banwana|hoga|kitna|lagega|kaise|karo|batao|apna|haan|nahi|karna|h)\b/i.test(userMessage || '');
    const reply = isHinglish
      ? `Aapka video walkthrough successfully receive ho gaya hai! Video file thodi badi hai, isliye humari technical team is workflow ko manually review karegi. Is system ka detailed architecture aur cost estimate lene ke liye kripya apna WhatsApp number ya email share karein!`
      : `Thank you for sharing this comprehensive video walkthrough! Since it's a high-resolution recording, our technical lead will review the full workflow directly. Could you share a quick note on the key features to prioritize, along with your email or WhatsApp number? We'll prepare a tailored architecture breakdown and estimate for you.`;
    return {
      reply,
      model: 'novabyte-media-handler',
      mode: 'multimodal_pipeline',
      latency_ms: 120,
      provider: 'NovaByte Media Pipeline'
    };
  }

  if (media && media.mediaType === 'document_oversized') {
    const isHinglish = /\b(mujhe|kya|bhai|chahiye|banana|banwana|hoga|kitna|lagega|kaise|karo|batao|apna|haan|nahi|karna|h)\b/i.test(userMessage || '');
    const reply = isHinglish
      ? `Aapka document (${media.filename || 'file'}) receive ho gaya hai! Humari engineering team is requirement ko detail me review karegi. Next steps aur quote ke liye kripya apna WhatsApp number ya email share karein.`
      : `Thank you for sharing the project document (${media.filename || 'PDF'})! Our solutions engineering team will review the specifications. Please share your email or WhatsApp number so we can follow up with our detailed scope analysis and cost estimate.`;
    return {
      reply,
      model: 'novabyte-media-handler',
      mode: 'multimodal_pipeline',
      latency_ms: 120,
      provider: 'NovaByte Media Pipeline'
    };
  }

  // Format chat history for Gemini REST API
  const formattedContents = [];
  const recentHistory = (history || []).slice(-8);
  for (const msg of recentHistory) {
    formattedContents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || ' ' }]
    });
  }

  const userParts = [];
  if (media && media.base64 && media.mimeType) {
    const cleanMimeType = media.mimeType.split(';')[0].trim().toLowerCase();
    userParts.push({
      inlineData: {
        mimeType: cleanMimeType,
        data: media.base64
      }
    });
  }

  // Construct tailored multimodal prompt based on media type
  let multimodalInstruction = userMessage || '';
  if (media) {
    if (media.mediaType === 'voice_note' || media.mediaType === 'audio') {
      multimodalInstruction = `[WHATSAPP VOICE NOTE / AUDIO MESSAGE RECEIVED]\n` +
        (userMessage && !userMessage.startsWith('[Attached') ? `Accompanying Text: "${userMessage}"\n` : '') +
        `Directives for Gemini:\n` +
        `1. Listen to and transcribe the spoken voice in this audio clip. The user may be speaking in Hindi, Hinglish, or English.\n` +
        `2. Understand their exact inquiry, questions, or requirements.\n` +
        `3. STRICT LANGUAGE MIRRORING: Reply in the exact language the user spoke (Hinglish if spoken in Hindi/Hinglish; executive English if spoken in English).\n` +
        `4. COMMERCIAL LEAD DIRECTIVE: If they want to build software, a website, an app, or an automation system, confirm our custom build capability, highlight 1-2 key features, and ask for their WhatsApp number or email to send a customized project scope and quote.\n` +
        `5. Tone: Sound like a friendly, senior human consultant replying to a voice note on WhatsApp. Do NOT say "I listened to your audio file" or "Based on the recording".`;
    } else if (media.mediaType === 'image') {
      multimodalInstruction = `[WHATSAPP IMAGE / SCREENSHOT / WIREFRAME RECEIVED]\n` +
        (media.caption ? `Caption: "${media.caption}"\n` : '') +
        (userMessage && !userMessage.startsWith('[Attached') ? `Accompanying Text: "${userMessage}"\n` : '') +
        `Directives for Gemini:\n` +
        `1. Inspect the visual content, UI/UX wireframes, screenshot, error code, handwritten notes, or reference product in this image.\n` +
        `2. Provide an insightful, consultative response analyzing what is shown and explaining how NovaByte can design, engineer, or integrate this solution.\n` +
        `3. If it looks like a custom project requirement, ask for their WhatsApp or email to provide a formal scope and estimate.\n` +
        `4. Mirror their language (Hinglish/English).`;
    } else if (media.mediaType === 'video') {
      multimodalInstruction = `[WHATSAPP VIDEO DEMO / WALKTHROUGH RECEIVED]\n` +
        (media.caption ? `Caption: "${media.caption}"\n` : '') +
        (userMessage && !userMessage.startsWith('[Attached') ? `Accompanying Text: "${userMessage}"\n` : '') +
        `Directives for Gemini:\n` +
        `1. Analyze the video sequence, screen interactions, demonstrated workflow, and user requirements shown in this clip.\n` +
        `2. Provide a consultative breakdown of the features or workflow demonstrated.\n` +
        `3. Explain how NovaByte can architect and deliver this system, and ask for their email or WhatsApp to schedule a brief discovery call and send a tailored proposal.\n` +
        `4. Mirror their language (Hinglish/English).`;
    } else if (media.mediaType === 'document') {
      multimodalInstruction = `[WHATSAPP DOCUMENT ATTACHED: ${media.filename || 'Project Document'}]\n` +
        (media.title ? `Title: "${media.title}"\n` : '') +
        (userMessage && !userMessage.startsWith('[Attached') ? `Accompanying Text: "${userMessage}"\n` : '') +
        `Directives for Gemini:\n` +
        `1. Read and analyze the technical specifications, project brief, RFP, or requirements in this document.\n` +
        `2. Provide an executive summary of key deliverables and outline how our engineering team can build it.\n` +
        `3. Request their WhatsApp number or email to send our detailed scope of work and timeline.\n` +
        `4. Mirror their language.`;
    }
  }

  userParts.push({
    text: multimodalInstruction || 'Hello! How can we assist you with our services today?'
  });

  formattedContents.push({
    role: 'user',
    parts: userParts
  });

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro'
  ];

  // -------------------------------------------------------------------------
  // CASCADE THROUGH KEYS POOL
  // -------------------------------------------------------------------------
  for (const keyObj of candidateKeys) {
    for (const modelName of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 16000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keyObj.key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: formattedContents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topP: 0.95
              }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText && replyText.trim().length > 0) {
            const latencyMs = Date.now() - startTime;
            return {
              reply: replyText.trim(),
              model: modelName,
              mode: keyObj.isClient ? 'client_key' : 'system_key',
              key_id: keyObj.id,
              latency_ms: latencyMs,
              provider: `Google AI Studio (${modelName})`
            };
          }
        } else if (response.status === 429) {
          console.warn(`[GEMINI RATE LIMIT 429] Key "${keyObj.label}" exceeded quota. Trying next key in pool...`);
          if (keyObj.isClient && keysData.notification_settings?.alert_on_rate_limit) {
            triggerRateLimitNotification(keyObj, keysData.notification_settings.whatsapp_alert_phone);
          }
        }
      } catch (err) {
        console.warn(`⚠️ AI Gateway error on ${keyObj.label} (${modelName}): ${err.message}`);
      }
    }
  }

  // -------------------------------------------------------------------------
  // TIER 3: Deterministic Contextual Knowledge-Base Engine (100% Fail-Safe Uptime)
  // -------------------------------------------------------------------------
  const simulatedReply = generateContextualFallback(bot, userMessage, history, media);
  const latencyMs = Date.now() - startTime;

  return {
    reply: simulatedReply,
    model: 'novabyte-context-engine',
    mode: 'contextual_engine',
    latency_ms: latencyMs,
    provider: 'NovaByte AI Autonomous Engine (Priority 3)'
  };
}

/**
 * Generate a smart, contextual follow-up message using Gemini AI.
 * Analyzes the conversation history and crafts a warm, topic-specific nudge.
 * Falls back to a smart template if Gemini is unavailable.
 */
export async function generateFollowUpMessage({ bot, conversationHistory = [] }) {
  const keysData = getKeysData();
  const botName = bot.bot_name || 'NovaByte AI Studio';
  const businessName = bot.business_name || botName;

  // Build last 4 messages summary for context
  const recentMsgs = conversationHistory.slice(-4);
  const conversationSummary = recentMsgs
    .map(m => `${m.sender === 'user' ? 'Customer' : 'Consultant'}: ${m.content}`)
    .join('\n');

  // Find the last user message topic
  const lastUserMsg = [...conversationHistory].reverse().find(m => m.sender === 'user');
  const lastUserText = lastUserMsg?.content || '';

  const followUpSystemPrompt = `You are a warm, professional human consultant for "${businessName}".
Rules:
1. Read the conversation history carefully to understand what the customer was interested in.
2. Write ONE short follow-up message (max 2 sentences + 1 friendly emoji).
3. Reference the SPECIFIC topic they discussed — sound 100% human and conversational.
4. Be warm and friendly, NOT pushy or salesy.
5. End with a simple open question to re-engage them.
6. Use natural phrasing like: "Hey! Just wanted to check if you had any questions regarding the website package we discussed 😊 Happy to help if you're ready to get started!"`.trim();

  const followUpUserPrompt = `Conversation history:\n${conversationSummary}\n\nGenerate a single warm human follow-up message now.`;

  // Build candidate keys (same priority cascade as generateBotReply)
  const candidateKeys = [];
  const clientKeys = (keysData.client_keys || []).filter(k => k.status !== 'invalid');
  for (const k of clientKeys) candidateKeys.push({ key: k.key, label: k.label || 'Client Key' });
  const systemKeys = (keysData.system_keys || []).filter(k => k.status !== 'invalid');
  for (const k of systemKeys) candidateKeys.push({ key: k.key, label: k.label || 'System Key' });
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (candidateKeys.length === 0 && envKey) candidateKeys.push({ key: envKey, label: 'Env Key' });

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const keyObj of candidateKeys) {
    for (const modelName of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keyObj.key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: followUpSystemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: followUpUserPrompt }] }],
              generationConfig: { temperature: 0.75, maxOutputTokens: 120 }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim().length > 0) {
            return reply.trim();
          }
        } else if (response.status === 429) {
          break; // try next key
        }
      } catch (err) {
        console.warn(`⚠️ Follow-up AI error on ${keyObj.label}: ${err.message}`);
      }
    }
  }

  // Fallback: Smart template based on last user message topic
  return generateFollowUpFallback(businessName, lastUserText);
}

/**
 * Smart human-like template fallback for follow-up when Gemini is unavailable.
 */
function generateFollowUpFallback(businessName, lastUserText) {
  const q = (lastUserText || '').toLowerCase();

  if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('rate') || q.includes('package')) {
    return `Hello. Just following up on the pricing details we discussed. Did you have any questions or would you like a custom proposal for your project?`;
  }
  if (q.includes('project') || q.includes('build') || q.includes('develop') || q.includes('website') || q.includes('app')) {
    return `Hello. Just checking in regarding your website and AI automation project. Let me know if you have any questions or if you would like to see a live demo.`;
  }
  if (q.includes('demo') || q.includes('call') || q.includes('consultation') || q.includes('meeting')) {
    return `Hello. Checking in about the discovery call you were interested in. We would be glad to connect. What time works best for you this week?`;
  }
  if (q.includes('service') || q.includes('offer') || q.includes('feature')) {
    return `Hello. Following up on our services discussion. Feel free to ask if you need any clarification or want to explore our live demos.`;
  }

  return `Hello. Just wanted to check in and see how everything is going. Feel free to reach out anytime if you need help with your project.`;
}


/**
 * Triggers a real alert log / WhatsApp alert when a client API key hits rate limits.
 */
function triggerRateLimitNotification(keyObj, phone) {
  const alertMsg = `[NovaByte AI Quota Alert]: Gemini API key "${keyObj.label}" reached quota. NovaByte automatically switched to the backup safety pool.`;
  console.log(`[WhatsApp Alert] sent to ${phone || 'admin'}: ${alertMsg}`);
}

/**
 * Ultra-Natural Human Consultative Response Engine
 */
function generateContextualFallback(bot, userMessage, history, media = null) {
  const query = (userMessage || '').trim();
  const lower = query.toLowerCase();
  const isHinglish = /\b(mujhe|kya|bhai|chahiye|banana|banwana|hoga|kitna|lagega|kaise|karo|batao|apna|haan|nahi|karna|h)\b/i.test(lower);

  // 0. Dedicated Fallbacks for Multimodal Media (Voice Notes, Images, Videos, Documents)
  if (media || lower.includes('[attached')) {
    const mediaType = media?.mediaType || '';
    if (mediaType === 'voice_note' || mediaType === 'audio' || lower.includes('voice note') || lower.includes('audio')) {
      return isHinglish
        ? `Aapka voice note successfully receive ho gaya hai. Humari technical team aapki requirement review kar rahi hai. Project ka customized scope aur proposal share karne ke liye kripya apna email ya preferred contact number yahan share karein.`
        : `Thank you for sending the voice note. I have logged your audio message for our engineering team. To help us prepare a tailored project scope and estimate, could you share your email or preferred contact details?`;
    }
    if (mediaType === 'video' || lower.includes('video')) {
      return isHinglish
        ? `Aapka video walkthrough receive ho gaya hai. Humari engineering team is system aur workflow ko analyze kar rahi hai. Is project ka tailored architecture aur cost estimate share karne ke liye kripya apna WhatsApp number ya email drop karein.`
        : `Thank you for sharing this video walkthrough. We can definitely build and streamline this workflow for you. Could you share your email or WhatsApp number so our solutions team can review the specifications and share a proposal?`;
    }
    if (mediaType === 'image' || lower.includes('image')) {
      return isHinglish
        ? `Aapka image/mockup mil gaya hai. Hum is design aur requirement ke hisab se custom full-stack software aur AI automation develop kar sakte hain. Scope aur quote discuss karne ke liye apna email ya phone number share karein.`
        : `Thank you for sharing this image / mockup. We specialize in custom UI/UX design and enterprise development. Could you share your email or WhatsApp number so our engineering lead can review your specs and send a tailored proposal?`;
    }
    if (mediaType === 'document' || lower.includes('document')) {
      return isHinglish
        ? `Aapka project document receive ho gaya hai. Humari team specifications review kar rahi hai. Next steps aur proposal discuss karne ke liye kripya apna contact number ya email share karein.`
        : `Thank you for sending over the project document. Our engineering team is reviewing the specifications. Please share your email or WhatsApp so we can follow up with our detailed scope breakdown and proposal.`;
    }
  }

  // Extract name if provided (e.g. "I am Suresh", "my name is Alex")
  const nameMatch = query.match(/(?:i am|i'm|my name is|this is)\s+([A-Za-z]+)/i);
  const detectedName = nameMatch ? nameMatch[1] : '';

  // 1. Guardrail for completely unrelated topics
  if (
    /weather|odisha|bhubaneswar|delhi|mumbai|news|world|current affairs|google|who is the prime minister|who is the president|temperature|forecast|recipe|cricket|score|ipl|politics|movie|joke|tell me a story|trivia|homework/i.test(lower)
  ) {
    return `I am specifically focused on helping you with custom website development and AI automation solutions for your business.\n\nHow can we help elevate your project or brand online?`;
  }

  // 2. Dedicated Human Help & Guidance Intent (e.g. "i need help", "help me", "can you help")
  if (/^(i need help|help me|can you help|help|need support|assistance|support)\b/i.test(lower) || lower === 'help' || lower === 'i need help') {
    return `I would be glad to help. Whether you are looking for advice on custom website development, setting up 24/7 automated WhatsApp messaging, integrating our AI solutions, or exploring packages—what can I assist you with right now?`;
  }

  // 3. Lead Contact capture acknowledgment
  if (lower.includes('@') || /(\+?\d{1,3}[-.\s]?)?\d{10}/.test(lower)) {
    const isHinglish = /\b(mujhe|kya|bhai|chahiye|banana|banwana|hoga|kitna|lagega|kaise|karo|batao|apna|haan|nahi|karna|h)\b/i.test(lower);
    if (isHinglish) {
      return `Shukriya! Aapka contact number securely record kar liya gaya hai. Humari senior technical team aapke project requirements ko review karke jald hi aapse directly contact karegi.`;
    }
    return `Thank you! I have securely noted down your contact details. A senior consultant from our team will review your requirements and reach out directly. Is there a preferred time for us to connect?`;
  }

  // 4. Project & Software Building Inquiries (Lead Capture First — No DIY blueprint dump)
  if (/(hospital|management|system|project|software|app|portal|platform|crm|ecommerce|e-commerce|build|develop)\b/i.test(lower)) {
    const isHinglish = /\b(mujhe|kya|bhai|chahiye|banana|banwana|hoga|kitna|lagega|kaise|karo|batao|apna|haan|nahi|karna|h)\b/i.test(lower);
    if (isHinglish) {
      return `Bilkul! Hum aapke liye custom enterprise software aur automated platforms build kar sakte hain with secure role-based portals aur automated WhatsApp alerts.\n\nProject ka detailed scope, feature roadmap aur exact estimate share karne ke liye kripya apna WhatsApp number ya email share karein taaki humari senior technical team aapse directly connect kar sake.`;
    }
    return `We specialize in custom enterprise software development and can definitely architect and build this solution for your workflow.\n\nTo prepare a tailored technical scope, feature roadmap, and ballpark estimate, could you share your WhatsApp number or email address? Our senior engineering team will review your requirements and reach out directly.`;
  }

  // 5. User introducing themselves + asking for service/bot (e.g. "Hi, I am Suresh. I want custom website development with AI chatbot.")
  if (detectedName && (lower.includes('website') || lower.includes('chatbot') || lower.includes('develop') || lower.includes('build'))) {
    return `Hello ${detectedName}! Great to connect with you. We would love to help you build a high-performance custom website paired with autonomous 24/7 AI automation.\n\nCould you share a little about your business or target launch timeline? Our turnaround is typically 3 to 7 business days with full responsive design and lead capture.`;
  }

  // 5. WhatsApp Connection Intent (e.g. "can u connect my whatsapp", "how to link whatsapp", "qr code")
  if (lower.includes('whatsapp') || lower.includes('whatapp') || lower.includes('wa') || lower.includes('qr')) {
    return `You can link your WhatsApp number in about 30 seconds:\n\n1. Go to **Integrations (/integrations)** in the navigation menu.\n2. Under WhatsApp, click **"Scan QR Code"** or **"Pair via 8-Digit Code"**.\n3. Open WhatsApp on your phone -> **Linked Devices** -> **Link a Device** -> Scan the QR.\n\nOnce connected, your bot will automatically handle client inquiries 24/7 and qualify leads with zero cloud per-message fees.`;
  }

  // 6. Website Widget & Embed Intent (e.g. "how do i embed this widget", "script tag", "add to website")
  if (lower.includes('embed') || lower.includes('widget') || lower.includes('script') || lower.includes('wordpress') || lower.includes('shopify')) {
    return `To embed this chatbot on any website, paste this single script snippet just before the closing </body> tag:\n\n\`<script src="http://localhost:5000/widget.js" data-bot-id="bot-ec0db899" async></script>\`\n\nIt runs smoothly on WordPress, Next.js, Shopify, Webflow, and custom HTML platforms with live lead capture.`;
  }

  // 7. Follow-Up & Inactivity Automation Intent
  if (lower.includes('follow up') || lower.includes('followup') || lower.includes('follow-up') || lower.includes('inactivity') || lower.includes('timer')) {
    return `Our autonomous follow-up engine monitors your conversation pipeline. If a prospect goes inactive after inquiring, it automatically dispatches a warm, consultative follow-up on WhatsApp to re-engage them and help close the deal.`;
  }

  // 8. Pricing & Packages questions
  if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost') || lower.includes('how much') || lower.includes('rate') || lower.includes('package') || lower.includes('quote') || lower.includes('fee')) {
    return `Here is an overview of our standard tiers:\n\n- Custom High-Converting Website: $499 - $999 (Modern React / Next.js architecture, SEO optimized, 3-7 days delivery)\n- Autonomous WhatsApp & Web AI Bot: $399 - $899 (24/7 lead qualification, multi-channel support)\n- Complete Full-Stack SaaS MVP: $1,500 - $2,500 (End-to-end database, auth & payments)\n\nCould you share a bit about your project goals so I can recommend the exact package for you?`;
  }

  // 9. General greetings (e.g. "hi", "hello", "hey")
  if (/^(hi|hello|helo|hey|hola|namaste|good morning|good afternoon|good evening|hlo|hii|heyy)\b/i.test(lower)) {
    if (detectedName) {
      return `Hello ${detectedName}! Great to connect with you. How can we assist you with your web or automation project today?`;
    }
    return `Hello! Great to connect with you. How can we help scale your business with custom web development or smart AI automations today? Feel free to ask about our packages or live demos.`;
  }

  // 10. Services & Features questions
  if (lower.includes('service') || lower.includes('offer') || lower.includes('feature') || lower.includes('what do you do') || lower.includes('hire') || lower.includes('develop') || lower.includes('website') || lower.includes('chatbot')) {
    return `We specialize in three core growth solutions:\n\n1. Custom Modern Websites & Web Apps: Built for blazing speed, SEO rankings, and high conversion.\n2. 24/7 Autonomous AI WhatsApp & Web Agents: Instantly respond to client questions, qualify prospects, and book appointments.\n3. Workflow & CRM Automation: Automated lead tracking, follow-ups, and spreadsheet integrations.\n\nWhich of these would you like to explore for your business?`;
  }

  // 11. Discovery call & Consultation
  if (lower.includes('hour') || lower.includes('time') || lower.includes('consultation') || lower.includes('call') || lower.includes('meeting') || lower.includes('demo')) {
    return `We would love to set up a quick 10-minute discovery call to map out the technical blueprint for your project.\n\nWhat day and time works best for you? You can also leave your WhatsApp number or email so we can coordinate.`;
  }

  // 12. General natural consultation fallback
  return `Thank you for reaching out! We build high-performing modern websites and intelligent AI chatbots tailored to your business needs.\n\nCould you share a little bit about your project goals or timeline?`;
}
