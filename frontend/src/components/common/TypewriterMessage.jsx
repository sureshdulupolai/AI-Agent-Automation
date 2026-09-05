import React, { useState, useEffect, useRef } from 'react';

/**
 * High-performance, fast word-by-word streaming typewriter component.
 * Types incoming AI replies smoothly and rapidly without dumping all data at once.
 */
export default function TypewriterMessage({ 
  text = '', 
  isStreaming = false, 
  speed = 20, 
  formatter,
  onStreamEnd 
}) {
  const [displayedText, setDisplayedText] = useState(isStreaming ? '' : text);
  const [streamingActive, setStreamingActive] = useState(isStreaming);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isStreaming || !text) {
      setDisplayedText(text);
      setStreamingActive(false);
      return;
    }

    // Split text into tokens (words and spaces/newlines preserved)
    const tokens = text.match(/(\s+|\S+)/g) || [text];
    let currentIndex = 0;
    setDisplayedText('');
    setStreamingActive(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      currentIndex += 1;
      const partial = tokens.slice(0, currentIndex).join('');
      setDisplayedText(partial);

      if (currentIndex >= tokens.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setStreamingActive(false);
        if (onStreamEnd) onStreamEnd();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, isStreaming, speed]);

  const contentToDisplay = formatter ? formatter(displayedText) : displayedText;

  return (
    <span>
      {contentToDisplay}
      {streamingActive && (
        <span 
          style={{
            display: 'inline-block',
            width: '3px',
            height: '13px',
            backgroundColor: '#4f46e5',
            marginLeft: '3px',
            verticalAlign: 'middle',
            borderRadius: '1px',
            animation: 'pulse 0.7s infinite'
          }}
        />
      )}
    </span>
  );
}
