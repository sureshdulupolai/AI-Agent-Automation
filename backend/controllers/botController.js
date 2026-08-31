import { db } from '../config/database.js';

export async function listBots(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const bots = await db.getBots(userId);
    return res.json({ bots });
  } catch (err) {
    console.error('List bots error:', err);
    return res.status(500).json({ error: 'Failed to retrieve bots' });
  }
}

export async function getBot(req, res) {
  try {
    const { botId } = req.params;
    const bot = await db.getBotById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    return res.json({ bot });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve bot' });
  }
}

/**
 * Public config endpoint accessed by embedded widget.js
 */
export async function getPublicBotConfig(req, res) {
  try {
    const { botId } = req.params;
    const bot = await db.getBotById(botId);
    if (!bot || !bot.is_active) {
      return res.status(404).json({ error: 'Bot not found or inactive' });
    }

    // Return safe, public properties including appearance settings
    return res.json({
      id: bot.id,
      bot_name: bot.bot_name,
      bot_avatar_url: bot.bot_avatar_url,
      primary_color: bot.primary_color || '#4f46e5',
      welcome_message: bot.welcome_message,
      placeholder_text: bot.placeholder_text || 'Type a message...',
      quick_prompts: bot.quick_prompts || [],
      launcher_icon: bot.launcher_icon || 'chat',
      launcher_position: bot.launcher_position || 'bottom-right',
      teaser_text: bot.teaser_text || 'How can I help you today?',
      show_teaser: bot.show_teaser !== false,
      theme_mode: bot.theme_mode || 'light',
      website_url: bot.website_url || null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load public bot config' });
  }
}

export async function createBot(req, res) {
  try {
    const userId = req.user?.userId || 'usr-demo-1';
    const {
      bot_name,
      bot_avatar_url,
      primary_color,
      welcome_message,
      placeholder_text,
      quick_prompts,
      system_instructions,
      business_knowledge,
      whatsapp_number,
      launcher_icon,
      launcher_position,
      teaser_text,
      show_teaser,
      theme_mode,
      website_url
    } = req.body;

    if (!bot_name) {
      return res.status(400).json({ error: 'Bot name is required' });
    }

    const newBot = await db.createBot({
      user_id: userId,
      bot_name,
      bot_avatar_url: bot_avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      primary_color: primary_color || '#4f46e5',
      welcome_message: welcome_message || 'Hello! How can I help you today?',
      placeholder_text: placeholder_text || 'Type your message...',
      quick_prompts: quick_prompts || ['What services do you offer?', 'Pricing details'],
      system_instructions: system_instructions || 'You are a helpful AI business representative.',
      business_knowledge: business_knowledge || '',
      whatsapp_number: whatsapp_number || null,
      launcher_icon: launcher_icon || 'chat',
      launcher_position: launcher_position || 'bottom-right',
      teaser_text: teaser_text || 'How can I help you today?',
      show_teaser: show_teaser !== false,
      theme_mode: theme_mode || 'light',
      website_url: website_url || null
    });

    return res.status(201).json({ bot: newBot });
  } catch (err) {
    console.error('Create bot error:', err);
    return res.status(500).json({ error: 'Failed to create bot' });
  }
}

export async function updateBot(req, res) {
  try {
    const { botId } = req.params;
    const updates = req.body;

    const updated = await db.updateBot(botId, updates);
    if (!updated) return res.status(404).json({ error: 'Bot not found' });

    return res.json({ bot: updated });
  } catch (err) {
    console.error('Update bot error:', err);
    return res.status(500).json({ error: 'Failed to update bot' });
  }
}

export async function deleteBot(req, res) {
  try {
    const { botId } = req.params;
    await db.deleteBot(botId);
    return res.json({ success: true, message: 'Bot deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete bot' });
  }
}

/**
 * 1-Click Website URL Crawler & Knowledge Trainer
 */
export async function crawlWebsite(req, res) {
  try {
    const { botId } = req.params;
    let { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log(`🌐 Crawling website for bot ${botId}: ${url}`);

    // Fetch website HTML
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OmniBot-Crawler/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(400).json({ error: `Failed to fetch website (HTTP ${response.status})` });
    }

    const html = await response.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract Meta Description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

    // Clean HTML to extract readable text
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to first 2,500 characters of high-signal content
    if (cleanText.length > 2500) {
      cleanText = cleanText.substring(0, 2500) + '...';
    }

    // Format knowledge snippet
    const extractedKnowledge = `WEBSITE SOURCE: ${url}
TITLE: ${title || 'Business Website'}
DESCRIPTION: ${metaDesc || 'N/A'}
CONTENT SUMMARY:
${cleanText}`;

    // Update bot database
    const bot = await db.getBotById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const currentKnowledge = bot.business_knowledge || '';
    const updatedKnowledge = currentKnowledge.trim()
      ? `${currentKnowledge}\n\n---\n${extractedKnowledge}`
      : extractedKnowledge;

    const updatedBot = await db.updateBot(botId, {
      website_url: url,
      business_knowledge: updatedKnowledge
    });

    console.log(`✅ Website knowledge successfully extracted for bot ${botId}`);

    return res.json({
      success: true,
      url,
      title,
      metaDesc,
      extractedSnippet: cleanText.substring(0, 300),
      bot: updatedBot
    });
  } catch (err) {
    console.error('Website crawling error:', err);
    return res.status(500).json({ error: 'Failed to crawl website: ' + err.message });
  }
}

