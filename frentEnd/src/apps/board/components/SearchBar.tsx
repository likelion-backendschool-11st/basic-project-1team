import React, { FormEvent } from 'react';
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
        className="h-11 w-full rounded-control border border-line-strong-light bg-field-light pl-4 pr-24 text-sm text-ink-light placeholder-ink-faint-light transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand dark:border-line-strong-dark dark:bg-field-dark dark:text-ink-dark dark:placeholder-ink-subtle-dark"
      />
      <button
        type="submit"
        className="absolute right-1.5 h-8 rounded-md bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
      >
        {labels.searchButton}
      </button>
    </div>
  </form>
);

export default SearchBar;
