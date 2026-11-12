import React from 'react';
import { Link } from 'react-router-dom';
import { BoardTable } from '../components/BoardTable';
import { BrandLogo } from '../components/BrandLogo';
import { PageCard } from '../components/PageCard';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { SortToggle } from '../components/SortToggle';
import { useLoginGate } from '../../../shared/LoginGate';
import { TOTAL_PAGES, labels, routes } from '../data/mockData';
import { useBoard } from '../hooks/useBoard';
import { usePagination } from '../hooks/usePagination';

interface BoardListPageProps {
  readonly className?: string;
}

export const BoardListPage: React.FC<BoardListPageProps> = () => {
  const board = useBoard();
  const pager = usePagination(TOTAL_PAGES);
  const { requireLogin, guardLink } = useLoginGate();

  return (
    <PageCard>
      <header className="flex items-center justify-between border-b border-line-light bg-card-head-light px-6 py-6 dark:border-line-dark dark:bg-card-head-dark sm:px-8">
        <BrandLogo />
        <h1 className="flex-1 text-center text-2xl font-bold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          {labels.boardTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => requireLogin() && board.toggleMineOnly()}
            aria-pressed={board.mineOnly}
            className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
              board.mineOnly
                ? 'border-brand bg-brand text-white'
                : 'border-line-strong-light bg-card-light text-ink-muted-light hover:bg-card-head-light dark:border-line-strong-dark dark:bg-field-dark dark:text-ink-muted-dark dark:hover:bg-raised-dark'
            }`}
          >
            {labels.myPostsButton}
          </button>
          <Link
            to={routes.myPosts}
            onClick={guardLink}
            title={labels.myPostsTitle}
            className="hidden text-xs text-ink-subtle-light hover:text-accent-light hover:underline dark:text-ink-subtle-dark dark:hover:text-accent-dark md:inline"
          >
            {labels.myPostsTitle} →
          </Link>
        </div>
      </header>

      <section className="p-6 pb-4 sm:p-8 sm:pb-4">
        <SearchBar value={board.draftQuery} onChange={board.setDraftQuery} onSubmit={board.submitSearch} />
        <SortToggle value={board.sort} onChange={board.setSort} />
      </section>

      <BoardTable posts={board.visible} isOwner={board.isOwner} onEdit={board.editTitle} />
      <Pagination pages={pager.pages} current={pager.page} onChange={pager.goTo} />
    </PageCard>
  );
};
