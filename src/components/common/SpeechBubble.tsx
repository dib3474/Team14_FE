import type { ReactNode } from 'react';
import './speech-bubble.css';

const SpeechBubble = ({
  children,
  tone = 'neutral',
  compact = false,
  tail = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent';
  compact?: boolean;
  tail?: boolean;
  as?: 'div' | 'span';
}) => (
  <Tag
    className={`inline-block max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] ${tone === 'accent' ? 'bg-primary-100 text-ui-ink rounded-tr-sm' : 'bg-white border border-ui-line text-ui-ink rounded-tl-sm'}${compact ? ' speech-bubble-compact' : ''}${tail ? ' speech-bubble-tail' : ''}`}
  >
    {children}
  </Tag>
);

export default SpeechBubble;
