import React from 'react';

/**
 * Parses WhatsApp and Markdown style formatting:
 * - **bold** or *bold* -> <strong>
 * - _italic_ -> <em>
 * - ~strikethrough~ -> <del>
 * - `code` -> <code>
 * - Preserves line breaks
 */
export function formatWhatsAppText(text) {
  if (!text) return null;

  // Split by line breaks
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Process line formatting
    const formattedLine = parseInlineFormatting(line);

    return (
      <React.Fragment key={lineIndex}>
        {formattedLine}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function parseInlineFormatting(str) {
  if (!str) return '';

  // Regex to match **bold**, *bold*, _italic_, ~strike~, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|~[^~]+~|`[^`]+`)/g;
  const parts = str.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Double asterisk **bold**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index} style={{ fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
    }

    // Single asterisk *bold* (WhatsApp native)
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={index} style={{ fontWeight: 800 }}>{part.slice(1, -1)}</strong>;
    }

    // Underscore _italic_
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={index} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    }

    // Tilde ~strike~
    if (part.startsWith('~') && part.endsWith('~') && part.length > 2) {
      return <del key={index} style={{ textDecoration: 'line-through', opacity: 0.8 }}>{part.slice(1, -1)}</del>;
    }

    // Backtick `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.06)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
