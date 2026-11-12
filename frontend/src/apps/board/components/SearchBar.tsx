import React, { type FormEvent } from 'react';
import { labels } from '../data/mockData';

interface SearchBarProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit }) => (
  <form className="mx-auto mb-6 max-w-xl" onSubmit={onSubmit} role="search">
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchPlaceholder}
        className="h-11 w-full rounded-lg border pl-4 pr-24 text-sm transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container border-hairline-strong bg-surface-2 text-ink placeholder-ink-subtle"
      />
      <button
        type="submit"
        className="absolute right-1.5 h-8 rounded-md bg-primary-container px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
      >
        {labels.searchButton}
      </button>
    </div>
  </form>
);
