import React from 'react';
import { labels } from '../data/mockData';
import type { PostSort } from '../data/types';

interface SortToggleProps {
  readonly value: PostSort;
  readonly onChange: (mode: PostSort) => void;
}

const active = 'font-semibold text-primary';
const idle = 'text-ink-subtle hover:text-ink';

// 최신순 / 오래된순 / 인기순 (REQ-BOARD-008·013)
const OPTIONS: readonly { readonly value: PostSort; readonly label: string }[] = [
  { value: 'latest', label: labels.sortLatest },
  { value: 'oldest', label: labels.sortOldest },
  { value: 'popular', label: labels.sortPopular },
];

export const SortToggle: React.FC<SortToggleProps> = ({ value, onChange }) => (
  <div className="mb-3 flex items-center justify-end text-sm">
    <span className="mr-2 font-medium text-ink-subtle">{labels.sortLabel}</span>
    {OPTIONS.map((option, i) => (
      <React.Fragment key={option.value}>
        {i > 0 && <span className="mx-1.5 text-ink-tertiary">/</span>}
        <button
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`transition-colors ${value === option.value ? active : idle}`}
        >
          {option.label}
        </button>
      </React.Fragment>
    ))}
  </div>
);
