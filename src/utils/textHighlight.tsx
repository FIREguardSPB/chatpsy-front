import type { ReactNode } from 'react';

export type HighlightConfig = {
  label: string; // text to search for
  className: string; // CSS class for highlighting
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights specific text patterns within a string using React elements
 */
export function highlightText(
  text: string,
  highlights: HighlightConfig[],
): ReactNode {
  if (!text || !highlights.length) return text;

  const pattern = new RegExp(
    '(' + highlights.map((h) => escapeRegExp(h.label)).join('|') + ')',
    'g',
  );

  const parts = text.split(pattern);
  const byLabel = new Map(highlights.map((h) => [h.label, h]));

  return parts.map((part, index) => {
    const cfg = byLabel.get(part);
    if (!cfg) {
      return <span key={index}>{part}</span>;
    }
    return (
      <span key={index} className={cfg.className}>
        {part}
      </span>
    );
  });
}
