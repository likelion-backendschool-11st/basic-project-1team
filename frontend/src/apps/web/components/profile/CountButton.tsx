import React from 'react';
import { Icon } from '../ui/Icon';

interface CountButtonProps {
  readonly icon: string;
  readonly label: string;
  readonly count: number;
  readonly onClick?: () => void;
}

/** "질문 보기 18" style action with a count badge. */
export const CountButton: React.FC<CountButtonProps> = ({ icon, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-3 px-3.5 py-2.5 font-label-md text-label-md text-ink-muted shadow-sm transition-colors hover:bg-surface-bright hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
  >
    <Icon name={icon} className="text-[16px]" />
    {label}
    <span className="rounded bg-surface-2 px-1.5 py-0.5 font-label-code text-[10px] text-ink-subtle">{count}</span>
  </button>
);
