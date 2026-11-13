import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FilterChip } from '../../../shared/layout/FilterChip';
import { useLoginGate } from '../../../shared/LoginGate';
import { blockIfRestricted } from '../../../shared/sanctions';
import {
  ANSWER_AUTHOR_PARAM,
  AUTHOR_PARAM,
  authorFilterCopy,
  userIdParam,
} from '../../../shared/site';
import { questionListPage as P } from '../data/mockData';
import { formatCount, toCommunityStats } from '../display';
import { useAuthorFilterName } from '../hooks/useAuthorFilterName';
import { useCommunityStats } from '../hooks/useCommunityStats';
import { usePopularTags } from '../hooks/usePopularTags';
import { useQuestionFilters } from '../hooks/useQuestionFilters';
import { useQuestionList } from '../hooks/useQuestionList';
import { Icon } from '../components/common/Icon';
import { CommunityStats } from '../components/questions/CommunityStats';
import { FilterPanel } from '../components/questions/FilterPanel';
import { ListHeader } from '../components/questions/ListHeader';
import { Pagination } from '../components/questions/Pagination';
import { QuestionTable } from '../components/questions/QuestionTable';
import { SearchFilterBar } from '../components/questions/SearchFilterBar';
import { routes } from '../routes';

interface QuestionListPageProps {
  readonly className?: string;
}

export const QuestionListPage: React.FC<QuestionListPageProps> = ({ className = '' }) => {
  const [params] = useSearchParams();
  // 회원 프로필 "전체 보기": 그 회원이 쓴 질문(authorId) 또는 답변한 질문(answerAuthorId) (API_SPEC 3장)
  const authorId = userIdParam(params.get(AUTHOR_PARAM));
  const answerAuthorId = userIdParam(params.get(ANSWER_AUTHOR_PARAM));
  const filterName = useAuthorFilterName(authorId ?? answerAuthorId);
  const f = useQuestionFilters(params.get('tag'));
  const list = useQuestionList(f.filters, authorId, answerAuthorId);
  const popularTags = usePopularTags();
  const stats = useCommunityStats();
  const { guardLink } = useLoginGate();

  return (
    <div className={`w-full py-space-lg flex flex-col gap-space-lg ${className}`}>
      <ListHeader newQuestionTo={routes.newQuestion()} />

      <div className="w-full flex flex-col gap-space-xs">
        <SearchFilterBar
          scope={f.scope}
          onScopeChange={f.setScope}
          query={f.query}
          onQueryChange={f.setQuery}
          onSubmit={f.submitSearch}
          sort={f.sort}
          onSortChange={f.setSort}
          panelOpen={f.panelOpen}
          onTogglePanel={f.togglePanel}
        />
        {f.panelOpen && (
          <FilterPanel
            answerFilter={f.answerFilter}
            onAnswerFilterChange={f.setAnswerFilter}
            acceptedFilter={f.acceptedFilter}
            onAcceptedFilterChange={f.setAcceptedFilter}
            tagFilter={f.tagFilter}
            onTagFilterChange={f.setTagFilter}
            popularTags={popularTags}
            activeTag={f.activeTag}
            onSelectTag={f.selectTag}
            onReset={f.reset}
          />
        )}
      </div>

      {filterName && (
        <FilterChip
          label={
            authorId !== null
              ? authorFilterCopy.questions(filterName)
              : authorFilterCopy.answers(filterName)
          }
          clearHref={routes.questions()}
          clearLabel={authorFilterCopy.clear}
        />
      )}

      <QuestionTable
        questions={list.questions}
        linkFor={(q) => routes.question(q.id)}
        emptyMessage={list.errorMessage ?? (list.loading ? P.loadingMessage : P.emptyMessage)}
      />

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-xs">
        <div className="font-caption text-caption text-ink-tertiary hidden sm:flex items-center gap-2">
          <span>{P.totalLabel(formatCount(list.totalCount))}</span>
          <span>•</span>
          <span className="font-code-inline">
            Page {list.page} of {list.totalPages}
          </span>
        </div>
        <Pagination
          page={list.page}
          pages={list.pages}
          hasPrev={list.hasPrev}
          hasNext={list.hasNext}
          onPrev={list.prev}
          onNext={list.next}
          onSelect={list.goTo}
        />
        <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
          <Link
            to={routes.newQuestion()}
            onClick={(e) => {
              guardLink(e);
              if (!e.defaultPrevented) blockIfRestricted('write', e);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-1 hover:bg-surface-2 border border-hairline hover:border-hairline-strong text-ink font-label-md text-label-md transition-colors"
          >
            <Icon name="edit_square" className="text-[16px] text-ink-subtle" />
            <span>{P.newQuestion}</span>
          </Link>
        </div>
      </div>

      <CommunityStats stats={toCommunityStats(stats)} linkTo={routes.questions()} />
    </div>
  );
};
