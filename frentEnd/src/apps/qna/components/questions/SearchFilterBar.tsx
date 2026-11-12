import React from 'react';
import { questionListPage, searchScopes, sortOptions } from '../../data/mockData';
import { Icon } from '../common/Icon';
import { SelectField } from './SelectField';

interface SearchFilterBarProps {
  readonly scope: string;
  readonly onScopeChange: (v: string) => void;
  readonly query: string;
  readonly onQueryChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly sort: string;
  readonly onSortChange: (v: string) => void;
  readonly panelOpen: boolean;
  readonly onTogglePanel: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  scope,
  onScopeChange,
  query,
  onQueryChange,
  onSubmit,
  sort,
  onSortChange,
  panelOpen,
  onTogglePanel,
}) => (
  <div className="w-full p-2.5 rounded-xl bg-surface-1 border border-hairline flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm shadow-sm">
    <div className="flex flex-1 items-center gap-space-xs">
      <SelectField variant="scope" options={searchScopes} value={scope} onChange={onScopeChange} ariaLabel="검색 범위" />
      <div className="relative flex-1 flex items-center h-9 px-space-sm bg-surface-2 border border-hairline focus-within:border-primary-focus focus-within:ring-1 focus-within:ring-primary-focus rounded-lg transition-colors">
        <Icon name="search" className="text-[18px] text-ink-tertiary mr-2" />
        <input
          className="w-full bg-transparent text-ink placeholder:text-ink-tertiary font-body-md text-body-md focus:outline-none"
          placeholder={questionListPage.searchPlaceholder}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <button
          aria-label="Search"
          type="button"
          onClick={onSubmit}
          className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-1 border border-hairline font-code-inline text-code-inline text-ink-subtle hover:text-ink"
        >
          <span>↵</span>
          <span>Enter</span>
        </button>
      </div>
    </div>
    <div className="flex items-center gap-space-xs shrink-0">
      <div className="hidden md:flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-hairline text-ink-subtle font-label-sm text-label-sm">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSortChange(opt.value)}
            className={`px-2.5 py-1 rounded cursor-pointer ${sort === opt.value ? 'bg-surface-3 text-ink font-semibold' : 'hover:text-ink'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onTogglePanel}
        aria-expanded={panelOpen}
        className={`flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg hover:bg-surface-3 border hover:border-hairline-strong text-ink font-label-md text-label-md transition-colors ${
          panelOpen ? 'border-primary-focus bg-surface-3' : 'border-hairline bg-surface-2'
        }`}
      >
        <Icon name="tune" className="text-[18px] text-ink-subtle" />
        <span>{questionListPage.filterLabel}</span>
        <Icon name="expand_more" className={`text-[16px] text-ink-tertiary transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  </div>
);

export default SearchFilterBar;
