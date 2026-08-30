export const JOURNEY_TEMPLATES = [
  {
    id: 'tpl-wa-agent',
    title: 'Use AI Agent on WhatsApp',
    category: 'featured',
    channel: 'whatsapp',
    flowSequence: ['whatsapp', 'agent', 'message', 'message'],
    bullets: [
      'Assign incoming WhatsApp chats to an AI Agent',
      'Send follow-up messages if customers don’t reply'
    ],
    badge: 'WhatsApp not connected',
    badgeAction: 'Upgrade →',
    defaultTrigger: {
      type: 'conversation',
      channel: 'whatsapp',
      label: 'Conversation'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'assign_agent',
        title: 'Assign to AI Agent',
        bot_id: 'bot-apex-agency',
        bot_name: 'Apex AI Assistant',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 6,
        duration_unit: 'hours',
        is_configured: true
      },
      {
        id: 'node-3',
        type: 'send_message',
        title: 'Send Message in Conversation',
        message_text: 'Hey! Just following up to see if you needed any further details?',
        is_configured: true
      }
    ]
  },
  {
    id: 'tpl-ig-dm',
    title: 'Use AI Agent on Instagram DMs',
    category: 'featured',
    channel: 'instagram',
    flowSequence: ['instagram', 'agent', 'message'],
    bullets: [
      'Assign incoming Instagram DMs to an AI Agent',
      'Send follow-up messages if customers don’t reply'
    ],
    defaultTrigger: {
      type: 'conversation',
      channel: 'instagram',
      label: 'Instagram Direct Message'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'assign_agent',
        title: 'Assign to AI Agent',
        bot_id: 'bot-apex-agency',
        bot_name: 'Apex AI Assistant',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 2,
        duration_unit: 'hours',
        is_configured: true
      },
      {
        id: 'node-3',
        type: 'send_message',
        title: 'Send Message in Conversation',
        message_text: 'Thanks for reaching out on Instagram! Let us know how we can help.',
        is_configured: true
      }
    ]
  },
  {
    id: 'tpl-ig-comments',
    title: 'Auto Reply/DM to Instagram Comments',
    category: 'featured',
    channel: 'instagram',
    flowSequence: ['instagram', 'instagram', 'message'],
    bullets: [
      'Auto-reply to comments on Instagram posts or reels',
      'Send them a DM with a message or link'
    ],
    defaultTrigger: {
      type: 'comment',
      channel: 'instagram',
      label: 'Instagram Post / Reel Comment'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'send_message',
        title: 'Public Reply to Comment',
        message_text: 'Thanks for your comment! We just sent you a DM with full details 🙌',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 1,
        duration_unit: 'minutes',
        is_configured: true
      },
      {
        id: 'node-3',
        type: 'send_message',
        title: 'Send Message in DM',
        message_text: 'Hey! Here is the link you requested: https://omnibot.io/demo',
        is_configured: true
      }
    ]
  },
  {
    id: 'tpl-transfer-agents',
    title: 'Transfer Conversations Between Agents',
    category: 'all',
    channel: 'omnichannel',
    flowSequence: ['flow', 'agent'],
    bullets: [
      'Move conversations between Flow-based and Conversational AI Agents',
      'Or escalate conversations to a human agent'
    ],
    defaultTrigger: {
      type: 'conversation',
      channel: 'all',
      label: 'Any Inbound Conversation'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'condition',
        title: 'Check Customer Intent',
        condition_rule: 'intent == "speak_human"',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'assign_agent',
        title: 'Escalate to Live Support Rep',
        bot_id: 'human-rep',
        bot_name: 'Human Support Agent',
        is_configured: true
      }
    ]
  },
  {
    id: 'tpl-nurture-leads',
    title: 'Nurture WhatsApp Leads',
    category: 'all',
    channel: 'whatsapp',
    flowSequence: ['lead', 'message', 'message', 'message'],
    bullets: [
      'Send WhatsApp messages to leads at scheduled intervals'
    ],
    defaultTrigger: {
      type: 'lead_captured',
      channel: 'whatsapp',
      label: 'New Lead Captured'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'send_message',
        title: 'Welcome Message (Day 0)',
        message_text: 'Welcome! We received your contact info. Check out our quick intro guide here: https://omnibot.io',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 2,
        duration_unit: 'days',
        is_configured: true
      },
      {
        id: 'node-3',
        type: 'send_message',
        title: 'Case Study Follow-up (Day 2)',
        message_text: 'Hi there! Did you know our clients see a 3x increase in lead conversion with OmniBot AI?',
        is_configured: true
      }
    ]
  },
  {
    id: 'tpl-reply-new-chats',
    title: 'Reply to New WhatsApp Chats',
    category: 'all',
    channel: 'whatsapp',
    flowSequence: ['whatsapp', 'message', 'message'],
    bullets: [
      'Send an instant reply when a new WhatsApp chat starts',
      'Send a follow-up message if the customer doesn’t reply'
    ],
    defaultTrigger: {
      type: 'conversation',
      channel: 'whatsapp',
      label: 'New WhatsApp Chat Started'
    },
    defaultNodes: [
      {
        id: 'node-1',
        type: 'send_message',
        title: 'Instant Welcome Message',
        message_text: 'Hello! Thanks for contacting us. How may we assist you today?',
        is_configured: true
      },
      {
        id: 'node-2',
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 1,
        duration_unit: 'hours',
        is_configured: true
      },
      {
        id: 'node-3',
        type: 'send_message',
        title: 'Friendly Follow-Up',
        message_text: 'Are you still looking for assistance? Feel free to ask anytime.',
        is_configured: true
      }
    ]
  }
];
