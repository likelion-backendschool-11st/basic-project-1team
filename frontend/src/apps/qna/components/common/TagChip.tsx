import React from 'react';
import { Link } from 'react-router-dom';

interface TagChipProps {
  readonly label: string;
  readonly hash?: boolean;
  readonly to?: string;
  readonly variant?: 'table' | 'code' | 'small' | 'muted';
}

const variants: Record<NonNullable<TagChipProps['variant']>, string> = {
  table:
    'px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-[11px] text-ink-muted',
  code: 'px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-code-inline text-ink-muted',
  small:
    'px-2 py-0.5 rounded bg-surface-1 border border-hairline font-code-inline text-[11px] text-ink-muted',
  muted: 'px-2 py-0.5 rounded bg-surface-3 font-code-inline text-caption text-ink-muted',
};

export const TagChip: React.FC<TagChipProps> = ({ label, hash = true, to, variant = 'code' }) => {
  const text = `${hash ? '#' : ''}${label}`;
  const base = `inline-flex items-center ${variants[variant]}`;
  if (to) {
    return (
      <Link
        to={to}
        className={`${base} hover:bg-surface-3 hover:border-primary hover:text-primary-hover transition-colors`}
      >
        {text}
      </Link>
    );
  }
  return <span className={base}>{text}</span>;
};
