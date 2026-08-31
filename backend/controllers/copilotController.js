import * as copilotAgentService from '../services/copilotAgentService.js';

/**
 * POST /api/copilot/chat
 */
export async function handleCopilotChat(req, res) {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const response = await copilotAgentService.processCopilotCommand({
      message,
      conversationHistory: history || []
    });

    return res.json({
      success: true,
      ...response
    });
  } catch (err) {
    console.error('Copilot Chat Controller Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
