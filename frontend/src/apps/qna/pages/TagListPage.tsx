import React from 'react';
import { Link } from 'react-router-dom';
import { tagListPage as T } from '../data/mockData';
import { formatCount } from '../display';
import { TAG_LIST_SIZE, type TagListSort, useTagList } from '../hooks/useTagList';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { routes } from '../routes';

interface TagListPageProps {
  readonly className?: string;
}

/** 태그 목록 (상단 메뉴 "태그", REQ-TAG-001). 인기순·이름순, 이름 앞부분 검색. 누르면 태그 상세 */
export const TagListPage: React.FC<TagListPageProps> = ({ className = '' }) => {
  const list = useTagList();

  return (
    <div className={`w-full py-space-lg flex flex-col gap-space-md ${className}`}>
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
          {T.title}
        </h1>
        <p className="font-body-sm text-body-sm text-ink-subtle">{T.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
        <label className="relative flex-1">
          <span className="sr-only">{T.searchLabel}</span>
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-ink-tertiary"
          />
          <input
            type="search"
            value={list.keyword}
            onChange={(e) => list.setKeyword(e.target.value)}
            placeholder={T.searchPlaceholder}
            maxLength={31}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-1 border border-hairline text-ink font-body-sm text-body-sm placeholder-ink-tertiary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </label>
        <div role="group" className="flex gap-1 p-1 rounded-lg bg-surface-1 border border-hairline">
          {T.sorts.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={list.sort === option.value}
              onClick={() => list.setSort(option.value as TagListSort)}
              className={`px-space-sm py-1 rounded font-label-md text-label-md transition-colors ${
                list.sort === option.value
                  ? 'bg-surface-3 text-ink font-semibold'
                  : 'text-ink-subtle hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {list.errorMessage && (
        <p className="font-body-sm text-body-sm text-semantic-danger">{list.errorMessage}</p>
      )}

      {list.tags.length === 0 ? (
        <Card className="py-space-xl text-center">
          <p className="font-body-md text-body-md text-ink-subtle">
            {list.loading ? T.loading : T.empty}
          </p>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
          {list.tags.map((tag) => (
            <li key={tag.id}>
              <Link
                to={routes.tag(tag.name)}
                className="h-full flex flex-col gap-1.5 p-space-md rounded-xl bg-surface-1 border border-hairline hover:border-primary-container hover:bg-surface-2 transition-colors group"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-code-inline text-code-inline text-ink font-semibold group-hover:text-primary">
                    #{tag.name}
                  </span>
                  <span className="shrink-0 font-code-inline text-[11px] text-ink-tertiary">
                    {T.questionCount(formatCount(tag.questionCount))}
                  </span>
                </span>
                <span
                  className={`line-clamp-2 font-caption text-caption ${tag.description ? 'text-ink-subtle' : 'text-ink-tertiary'}`}
                >
                  {tag.description ?? T.noDescription}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {list.tags.length >= TAG_LIST_SIZE && (
        <p className="font-caption text-caption text-ink-tertiary">{T.limitNote(TAG_LIST_SIZE)}</p>
      )}
    </div>
  );
};
