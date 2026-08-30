import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

/**
 * Generate AI response using Google Gemini 2.0 / 1.5 Flash with custom business prompt & guardrails.
 */
export async function generateBotReply({
  bot,
  userMessage,
  history = [],
  apiKeyOverride = null
}) {
  const apiKey = apiKeyOverride || DEFAULT_GEMINI_KEY;

  // Build the rich business context & prompt
  const systemPrompt = `
You are "${bot.bot_name}", the official and highly capable AI assistant for this business.

### CORE IDENTITY & OBJECTIVES:
${bot.system_instructions || 'Answer visitor questions clearly, politely, and accurately. Help visitors find the right product/service and capture their contact info when relevant.'}

### VERIFIED BUSINESS KNOWLEDGE BASE:
${bot.business_knowledge || 'No specific knowledge base provided.'}

### STRICT CONVERSATIONAL GUIDELINES:
1. Always base your factual answers on the provided business knowledge.
2. If the user asks for information NOT contained in the knowledge base, be transparent: politely offer to connect them with a human specialist or ask for their phone number / email so the team can follow up.
3. Keep responses concise, clear, and engaging (1-3 brief paragraphs or bullet points). Use emojis naturally where appropriate.
4. If the user shows high purchase intent or asks for a quote/demo, encourage them to provide their WhatsApp number or email.
5. If the user provides their contact details (phone, email), warmly acknowledge it and confirm that the team will reach out promptly.
`.trim();

  // If Gemini API Key is available, call Google Gemini
  if (apiKey && apiKey.trim().length > 10) {
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    for (const modelName of candidateModels) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt
        });

        // Format conversation history for Gemini chat
        const chatHistory = history.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        // Initialize chat session
        const chat = model.startChat({
          history: chatHistory.slice(-10) // last 10 messages for context
        });

        const result = await chat.sendMessage(userMessage);
        const replyText = result.response.text();
        return {
          reply: replyText.trim(),
          model: modelName,
          mode: 'live_gemini'
        };
      } catch (err) {
        console.warn(`⚠️ Model ${modelName} error (${err.message}), trying next candidate...`);
      }
    }
  }

  // Smart Contextual Fallback Generator (Active when no Gemini API Key is provided)
  const simulatedReply = generateContextualFallback(bot, userMessage, history);
  return {
    reply: simulatedReply,
    model: 'omnibot-context-engine',
    mode: 'simulated_fallback'
  };
}

/**
 * Intelligent contextual fallback engine that parses the bot's knowledge base
 * to generate realistic answers when Gemini key is not yet configured.
 */
function generateContextualFallback(bot, userMessage, history) {
  const query = userMessage.toLowerCase();
  const knowledge = bot.business_knowledge || '';
  const botName = bot.bot_name || 'Assistant';

  // Contact capture acknowledgment
  if (query.includes('@') || /(\+?\d{1,3}[-.\s]?)?\d{10}/.test(query)) {
    return `Thank you! I have securely recorded your contact details. Our team at ${botName} will review your request and reach out to you shortly via WhatsApp or email. Is there anything else you would like to know in the meantime? 😊`;
  }

  // Pricing & Cost questions
  if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('how much') || query.includes('rate')) {
    const lines = knowledge.split('\n').filter(l => /price|pricing|cost|\$|tier|plan|fee/i.test(l));
    if (lines.length > 0) {
      return `Here is what we offer regarding pricing:\n\n${lines.join('\n')}\n\nWould you like a custom quote tailored to your exact requirements? Please share your email or phone number!`;
    }
    return `Our pricing is flexible based on your exact requirements. Could you share your email or phone number so our team can provide a customized quote?`;
  }

  // Services & Features questions
  if (query.includes('service') || query.includes('offer') || query.includes('feature') || query.includes('what do you do') || query.includes('help')) {
    const lines = knowledge.split('\n').filter(l => /service|offer|product|solution|treatment/i.test(l));
    if (lines.length > 0) {
      return `We specialize in the following:\n\n${lines.slice(0, 5).join('\n')}\n\nWhich of these would you like to explore further?`;
    }
    return `Hello! We provide full-service solutions tailored to your business needs. What specific project or goal are you working on today?`;
  }

  // Hours & Location / Contact questions
  if (query.includes('hour') || query.includes('time') || query.includes('open') || query.includes('location') || query.includes('address') || query.includes('contact')) {
    const lines = knowledge.split('\n').filter(l => /hour|location|address|contact|phone|email|plaza|suite/i.test(l));
    if (lines.length > 0) {
      return `Here are our contact and operating details:\n\n${lines.join('\n')}\n\nLet me know if you need directions or would like to schedule a visit!`;
    }
  }

  // General consultation response
  return `Thank you for reaching out to ${botName}! Based on our services, we'd love to help you with that. If you'd like to receive full details or speak with a specialist, feel free to drop your phone number or email here! ✨`;
}
