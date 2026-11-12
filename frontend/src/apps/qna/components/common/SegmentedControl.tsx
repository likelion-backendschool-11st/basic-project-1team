import React from 'react';
import type { SelectOption } from '../../data/types';

interface SegmentedControlProps {
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
}) => {
  const text =
    size === 'sm' ? 'font-label-sm text-label-sm px-2.5' : 'font-label-md text-label-md px-3';
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 p-0.5 rounded-lg bg-surface-1 border border-hairline ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`${text} py-1 rounded transition-colors ${
              active
                ? 'bg-surface-3 text-ink font-semibold'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
