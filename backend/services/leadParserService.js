/**
 * Lead Parser Service: Automatically extracts Phone, Email, Name, and Intent
 * from raw visitor chat messages without disrupting conversation flow.
 */

// Email regex pattern
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;

// Phone regex patterns (International, Indian, US/Canada, standard digits)
const PHONE_PATTERNS = [
  /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // standard 10-11 digit (+1 555 123 4567 or 555-123-4567)
  /(\+91[\-\s]?)?[6789]\d{9}/,                                  // Indian format +91 9876543210
  /\b\d{10}\b/                                                 // Raw 10 digits
];

// Name extraction patterns (English + Hinglish)
const NAME_PATTERNS = [
  /(?:my name is|i am|this is|call me|name:?|mera naam|naam|main hoon)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:here|at|from|bol raha hoon|bol rha hu)\b/i
];

export function extractLeadDetails(userMessage, messageHistory = []) {
  if (!userMessage || typeof userMessage !== 'string') return null;

  let leadEmail = null;
  let leadPhone = null;
  let leadName = null;

  // Check email
  const emailMatch = userMessage.match(EMAIL_REGEX);
  if (emailMatch) {
    leadEmail = emailMatch[0].trim();
  }

  // Check phone
  for (const pattern of PHONE_PATTERNS) {
    const phoneMatch = userMessage.match(pattern);
    if (phoneMatch) {
      leadPhone = phoneMatch[0].trim();
      break;
    }
  }

  // Check name
  for (const pattern of NAME_PATTERNS) {
    const nameMatch = userMessage.match(pattern);
    if (nameMatch && nameMatch[1]) {
      leadName = nameMatch[1].trim();
      break;
    }
  }

  // If not found in current message, optionally look back 1-2 messages in history
  if ((!leadPhone || !leadEmail) && messageHistory.length > 0) {
    const recentUserMsgs = messageHistory
      .filter(m => m.sender === 'user')
      .slice(-3);

    for (const msg of recentUserMsgs) {
      if (!leadEmail) {
        const eMatch = msg.content.match(EMAIL_REGEX);
        if (eMatch) leadEmail = eMatch[0].trim();
      }
      if (!leadPhone) {
        for (const pattern of PHONE_PATTERNS) {
          const pMatch = msg.content.match(pattern);
          if (pMatch) {
            leadPhone = pMatch[0].trim();
            break;
          }
        }
      }
      if (!leadName) {
        for (const pattern of NAME_PATTERNS) {
          const nMatch = msg.content.match(pattern);
          if (nMatch && nMatch[1]) {
            leadName = nMatch[1].trim();
            break;
          }
        }
      }
    }
  }

  // Only consider it a lead if at least a phone number or email is provided
  if (leadPhone || leadEmail) {
    return {
      lead_phone: leadPhone || null,
      lead_email: leadEmail || null,
      lead_name: leadName || 'Website Visitor',
      lead_requirement: userMessage.substring(0, 300)
    };
  }

  return null;
}
