import React from 'react';
import { Link } from 'react-router-dom';
import { BoardTable } from '../components/BoardTable';
import { Icon } from '../components/Icon';
import { PageCard } from '../components/PageCard';
import { PopularPosts } from '../components/PopularPosts';
import { SearchBar } from '../components/SearchBar';
import { SortToggle } from '../components/SortToggle';
import { useLoginGate } from '../../../shared/LoginGate';
import { FilterChip } from '../../../shared/layout/FilterChip';
import { Pagination } from '../../../shared/layout/Pagination';
import { authorFilterCopy } from '../../../shared/site';
import { useSanctionGuard } from '../../../shared/sanctions';
import { labels, routes } from '../data/mockData';
import { useBoard } from '../hooks/useBoard';
import { usePopularPosts } from '../hooks/usePopularPosts';

interface BoardListPageProps {
  readonly className?: string;
}

export const BoardListPage: React.FC<BoardListPageProps> = () => {
  const { blockIfRestricted } = useSanctionGuard();
  const board = useBoard();
  const popular = usePopularPosts();
  const { requireLogin, guardLink } = useLoginGate();
  // 내 게시글·회원 작성 목록을 볼 때는 전체 인기글 순위를 숨긴다
  const showPopular = !board.mineOnly && board.authorName === null;

  return (
    <PageCard>
      <header className="flex items-center justify-between border-b px-6 py-6 border-hairline bg-surface-2 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {labels.boardTitle}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to={routes.write}
            onClick={(e) => {
              guardLink(e);
              if (!e.defaultPrevented) blockIfRestricted('write', e);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Icon name="edit" className="text-[16px]" />
            {labels.writeButton}
          </Link>
          <button
            type="button"
            onClick={() => requireLogin() && board.toggleMineOnly()}
            aria-pressed={board.mineOnly}
            className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container ${
              board.mineOnly
                ? 'border-primary-container bg-primary-container text-white'
                : 'border-hairline-strong bg-surface-2 text-ink-muted hover:bg-surface-3'
            }`}
          >
            {labels.myPostsButton}
          </button>
        </div>
      </header>

      <section className="p-6 pb-4 sm:p-8 sm:pb-4">
        {showPopular && <PopularPosts posts={popular.posts} />}
        <SearchBar
          value={board.draftQuery}
          onChange={board.setDraftQuery}
          onSubmit={board.submitSearch}
        />
        <SortToggle value={board.sort} onChange={board.setSort} />
        {board.authorName && (
          <FilterChip
            label={authorFilterCopy.posts(board.authorName)}
            clearHref={routes.board}
            clearLabel={authorFilterCopy.clear}
            className="mt-3"
          />
        )}
      </section>

      <BoardTable
        posts={board.posts}
        loading={board.loading}
        errorMessage={board.errorMessage}
        numberAt={board.numberAt}
      />
      <Pagination
        page={board.page}
        totalPages={board.totalPages}
        onChange={board.goTo}
        className="py-8"
      />
    </PageCard>
  );
};
