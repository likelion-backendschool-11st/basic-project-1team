import React from 'react';
import { filterPanel, questionListPage } from '../../data/mockData';
import { Icon } from '../common/Icon';
import { SelectField } from './SelectField';

interface FilterPanelProps {
  readonly answerFilter: string;
  readonly onAnswerFilterChange: (v: string) => void;
  readonly acceptedFilter: string;
  readonly onAcceptedFilterChange: (v: string) => void;
  readonly tagFilter: string;
  readonly onTagFilterChange: (v: string) => void;
  /** 인기 태그 이름 (GET /api/tags?sort=popular) */
  readonly popularTags: readonly string[];
  /** 지금 적용된 태그. 빈 값이면 전체 */
  readonly activeTag: string;
  readonly onSelectTag: (tag: string) => void;
  readonly onReset: () => void;
}

const FilterLabel: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <label className="font-label-sm text-label-sm text-ink-subtle flex items-center justify-between">
    <span>{children}</span>
  </label>
);

export const FilterPanel: React.FC<FilterPanelProps> = ({
  answerFilter,
  onAnswerFilterChange,
  acceptedFilter,
  onAcceptedFilterChange,
  tagFilter,
  onTagFilterChange,
  popularTags,
  activeTag,
  onSelectTag,
  onReset,
}) => (
  <div className="w-full p-space-md rounded-xl bg-surface-1 border border-hairline flex flex-col gap-space-md transition-all">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      <div className="flex flex-col gap-1.5">
        <FilterLabel>{filterPanel.answerFilter.label}</FilterLabel>
        <SelectField
          options={filterPanel.answerFilter.options}
          value={answerFilter}
          onChange={onAnswerFilterChange}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FilterLabel>{filterPanel.acceptedFilter.label}</FilterLabel>
        <SelectField
          options={filterPanel.acceptedFilter.options}
          value={acceptedFilter}
          onChange={onAcceptedFilterChange}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FilterLabel>{filterPanel.tagFilter.label}</FilterLabel>
        <div className="relative flex items-center">
          <input
            className="w-full h-9 pl-3 pr-8 rounded-lg bg-surface-2 border border-hairline font-body-sm text-body-sm text-ink placeholder:text-ink-tertiary focus:border-primary-focus focus:outline-none"
            placeholder={filterPanel.tagFilter.placeholder}
            type="text"
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
          />
          <Icon
            name="tag"
            className="absolute right-2 text-[16px] text-ink-tertiary pointer-events-none"
          />
        </div>
      </div>
    </div>
    <div className="pt-space-xs border-t border-hairline flex flex-wrap items-center gap-1.5">
      <span className="font-caption text-caption text-ink-tertiary mr-1">
        {questionListPage.quickTagsLabel}
      </span>
      {['', ...popularTags].map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelectTag(tag)}
          className={`px-2 py-0.5 rounded border font-code-inline text-[11px] transition-colors ${
            activeTag === tag
              ? 'bg-primary-container/20 border-primary-container text-primary hover:bg-primary-container/30'
              : 'bg-surface-2 border-hairline text-ink-muted hover:border-hairline-strong hover:text-ink'
          }`}
        >
          {tag === '' ? `#${questionListPage.allTag}` : `#${tag}`}
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="ml-auto text-ink-subtle hover:text-ink font-label-sm text-label-sm inline-flex items-center gap-1"
      >
        <Icon name="refresh" className="text-[14px]" />
        {questionListPage.resetLabel}
      </button>
    </div>
  </div>
);
