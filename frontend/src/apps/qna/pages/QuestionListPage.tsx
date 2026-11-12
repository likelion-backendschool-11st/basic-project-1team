import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { communityStats, questionListPage as P, questions } from '../data/mockData';
import { isQuestionDeleted } from '../data/mockStore';
import { usePagination } from '../hooks/usePagination';
import { blockIfRestricted } from '../../../shared/sanctions';
import { useLoginGate } from '../../../shared/LoginGate';
import { useQuestionFilters } from '../hooks/useQuestionFilters';
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
  // mock: 삭제 상태인 질문은 목록에서 뺀다 (API 는 처음부터 내려주지 않는다)
  const f = useQuestionFilters(questions.filter((q) => !isQuestionDeleted(q.id)));
  const pager = usePagination(P.totalPages, P.visiblePages);
  const [params] = useSearchParams();
  const tagParam = params.get('tag');
  const { guardLink } = useLoginGate();

  // Tag chips elsewhere in the app link here as /questions?tag=...
  useEffect(() => {
    if (tagParam) f.selectTag(tagParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagParam]);

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
            activeTag={f.activeTag}
            onSelectTag={f.selectTag}
            onReset={f.reset}
          />
        )}
      </div>

      <QuestionTable
        questions={f.results}
        linkFor={(q) => routes.question(q.id)}
        emptyMessage="조건에 맞는 질문이 없습니다."
      />

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-xs">
        <div className="font-caption text-caption text-ink-tertiary hidden sm:flex items-center gap-2">
          <span>{P.totalLabel}</span>
          <span>•</span>
          <span className="font-code-inline">
            Page {pager.page} of {pager.totalPages}
          </span>
        </div>
        <Pagination
          page={pager.page}
          pages={pager.pages}
          hasPrev={pager.hasPrev}
          hasNext={pager.hasNext}
          onPrev={pager.prev}
          onNext={pager.next}
          onSelect={pager.goTo}
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

      <CommunityStats stats={communityStats} linkTo={routes.questions()} />
    </div>
  );
};
