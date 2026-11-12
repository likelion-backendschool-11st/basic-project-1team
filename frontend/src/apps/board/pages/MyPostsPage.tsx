import React from 'react';
import { blockIfRestricted } from '../../../shared/sanctions';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { MyPostsTable } from '../components/MyPostsTable';
import { PageCard } from '../components/PageCard';
import { Pagination } from '../components/Pagination';
import { MY_POSTS_ROWS, TOTAL_PAGES, labels, myPosts, routes } from '../data/mockData';
import { usePagination } from '../hooks/usePagination';

interface MyPostsPageProps {
  readonly className?: string;
}

export const MyPostsPage: React.FC<MyPostsPageProps> = () => {
  const pager = usePagination(TOTAL_PAGES);

  return (
    <PageCard padded>
      <header className="mb-10 flex items-center justify-between border-b pb-6 border-hairline">
        <h1 className="text-3xl font-bold tracking-tight text-ink">{labels.myPostsTitle}</h1>
        <div className="flex items-center gap-2">
          <Link
            to={routes.write}
            onClick={(e) => blockIfRestricted('write', e)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Icon name="edit" className="text-[16px]" />
            {labels.writeButton}
          </Link>
          <Link
            to={routes.board}
            className="inline-block rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-colors border-hairline-strong bg-surface-3 text-ink-muted hover:bg-surface-2"
          >
            {labels.boardTitle}
          </Link>
        </div>
      </header>

      <MyPostsTable posts={myPosts} rows={MY_POSTS_ROWS} />
      <Pagination pages={pager.pages} current={pager.page} onChange={pager.goTo} />
    </PageCard>
  );
};
