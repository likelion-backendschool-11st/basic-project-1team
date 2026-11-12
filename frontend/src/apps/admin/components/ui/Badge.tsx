import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'muted';
export type BadgeShape = 'pill' | 'chip' | 'code';

interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly shape?: BadgeShape;
  readonly dot?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-ink border-hairline-strong',
  primary: 'bg-primary-container/15 text-primary border-primary-container/40',
  success: 'bg-tertiary-container/15 text-tertiary border-tertiary/30',
  danger: 'bg-error-container/40 text-error border-error/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  muted: 'bg-transparent text-ink-tertiary border-hairline',
};

const shapes: Record<BadgeShape, string> = {
  pill: 'rounded-full px-2.5 py-0.5 text-body-sm font-medium',
  chip: 'rounded px-2 py-0.5 text-label-sm',
  code: 'rounded px-2 py-0.5 font-mono text-code-sm font-medium',
};

/** Status pills, chips and code-style labels. Never wraps (fixes wrapping seen in the Stitch export). */
export function Badge({ tone = 'neutral', shape = 'pill', dot = false, className = '', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap border ${tones[tone]} ${shapes[shape]} ${className}`}>
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
