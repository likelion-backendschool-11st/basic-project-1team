import React from 'react';
import { labels } from '../data/mockData';
import type { SortMode } from '../hooks/useBoard';

interface SortToggleProps {
  readonly value: SortMode;
  readonly onChange: (mode: SortMode) => void;
}

const active = 'font-semibold text-accent-light dark:text-accent-dark';
const idle =
  'text-ink-subtle-light hover:text-ink-light dark:text-ink-subtle-dark dark:hover:text-ink-dark';

export const SortToggle: React.FC<SortToggleProps> = ({ value, onChange }) => (
  <div className="mb-3 flex items-center justify-end text-sm">
    <span className="mr-2 font-medium text-ink-subtle-light dark:text-ink-subtle-dark">
      {labels.sortLabel}
    </span>
    <button
      type="button"
      aria-pressed={value === 'latest'}
      onClick={() => onChange('latest')}
      className={`transition-colors ${value === 'latest' ? active : idle}`}
    >
      {labels.sortLatest}
    </button>
    <span className="mx-1.5 text-ink-faint-light dark:text-ink-faint-dark">/</span>
    <button
      type="button"
      aria-pressed={value === 'oldest'}
      onClick={() => onChange('oldest')}
      className={`transition-colors ${value === 'oldest' ? active : idle}`}
    >
      {labels.sortOldest}
    </button>
  </div>
);
