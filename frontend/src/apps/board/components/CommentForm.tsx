import React, { type KeyboardEvent } from 'react';
import { labels } from '../data/mockData';
import { Icon } from './Icon';

interface CommentFormProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ value, onChange, onSubmit, onKeyDown }) => (
  <div className="border-t border-line-light bg-card-head-light p-4 dark:border-line-dark dark:bg-field-dark/40 sm:p-6">
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={labels.commentPlaceholder}
        aria-label={labels.commentPlaceholder}
        className="flex-1 rounded-control border border-line-strong-light bg-field-light px-4 py-3 text-sm text-ink-light placeholder-ink-faint-light shadow-inner transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand dark:border-line-strong-dark dark:bg-field-dark dark:text-ink-dark dark:placeholder-ink-subtle-dark"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-control bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {labels.commentSubmit}
        <Icon name="arrow_forward" className="text-[16px]" />
      </button>
    </div>
  </div>
);
