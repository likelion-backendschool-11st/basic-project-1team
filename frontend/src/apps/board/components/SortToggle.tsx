import React from 'react';
import { labels } from '../data/mockData';
import type { PostSort } from '../data/types';

interface SortToggleProps {
  readonly value: PostSort;
  readonly onChange: (mode: PostSort) => void;
}

const active = 'font-semibold text-primary';
const idle = 'text-ink-subtle hover:text-ink';

export const SortToggle: React.FC<SortToggleProps> = ({ value, onChange }) => (
  <div className="mb-3 flex items-center justify-end text-sm">
    <span className="mr-2 font-medium text-ink-subtle">{labels.sortLabel}</span>
    <button
      type="button"
      aria-pressed={value === 'latest'}
      onClick={() => onChange('latest')}
      className={`transition-colors ${value === 'latest' ? active : idle}`}
    >
      {labels.sortLatest}
    </button>
    <span className="mx-1.5 text-ink-tertiary">/</span>
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
