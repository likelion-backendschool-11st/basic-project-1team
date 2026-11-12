import React from 'react';
import type { Tone } from '../../data/mockData';

interface StatusPillProps {
  readonly label: string;
  /** Colored dot before the label; omit for a plain chip. */
  readonly dot?: Tone;
  readonly pulse?: boolean;
  /** Text color tone; defaults to subtle ink. */
  readonly textTone?: Tone;
  readonly background?: 'surface-1' | 'surface-2' | 'surface-3' | 'none';
  readonly className?: string;
}

export const DOT_CLASSES: Record<Tone, string> = {
  success: 'bg-semantic-success',
  danger: 'bg-semantic-danger',
  warning: 'bg-semantic-warning',
  tertiary: 'bg-tertiary',
  primary: 'bg-primary',
  neutral: 'bg-ink-tertiary',
};

const TEXT_CLASSES: Record<Tone, string> = {
  success: 'text-semantic-success',
  danger: 'text-semantic-danger',
  warning: 'text-semantic-warning',
  tertiary: 'text-tertiary',
  primary: 'text-secondary',
  neutral: 'text-ink-subtle',
};

const BG_CLASSES = {
  'surface-1': 'bg-surface-1 px-3 py-1',
  'surface-2': 'bg-surface-2 px-3 py-1',
  'surface-3': 'bg-surface-3 px-2.5 py-1',
  none: '',
} as const;

/** Rounded status chip: "AUTH V2.4 ONLINE", "온라인", "LV.42", "동기화됨"… */
export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  dot,
  pulse = false,
  textTone = 'neutral',
  background = 'surface-2',
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-label-code text-label-code leading-none ${BG_CLASSES[background]} ${TEXT_CLASSES[textTone]} ${className}`}
  >
    {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[dot]} ${pulse ? 'animate-pulse' : ''}`} />}
    {label}
  </span>
);
