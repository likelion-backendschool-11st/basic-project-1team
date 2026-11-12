import React from 'react';

interface NumberBadgeProps {
  readonly index: number | string;
  readonly shape?: 'circle' | 'square';
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({ index, shape = 'circle' }) => (
  <span
    className={`flex items-center justify-center w-5 h-5 shrink-0 bg-surface-2 font-code-inline text-[11px] ${
      shape === 'circle' ? 'rounded-full text-primary-fixed-dim' : 'rounded text-ink font-semibold mt-0.5'
    }`}
  >
    {index}
  </span>
);
