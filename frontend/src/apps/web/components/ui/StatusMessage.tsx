import React from 'react';
import { Icon } from './Icon';

export type StatusTone = 'info' | 'success' | 'danger';

interface StatusMessageProps {
  readonly tone?: StatusTone;
  readonly text: string;
  readonly id?: string;
}

const TONES: Record<StatusTone, { readonly icon: string; readonly color: string }> = {
  info: { icon: 'info', color: 'text-ink-subtle' },
  success: { icon: 'check_circle', color: 'text-semantic-success' },
  danger: { icon: 'cancel', color: 'text-semantic-danger' },
};

/** One-line helper / validation message under a field. */
export const StatusMessage: React.FC<StatusMessageProps> = ({ tone = 'info', text, id }) => (
  <p
    id={id}
    role={tone === 'danger' ? 'alert' : undefined}
    className={`flex items-center gap-1.5 pt-0.5 font-body-sm text-body-sm ${TONES[tone].color}`}
  >
    <Icon name={TONES[tone].icon} className="text-[15px]" />
    <span>{text}</span>
  </p>
);
