import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
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
      <header className="mb-10">
        <div className="mb-6 flex items-center justify-between border-b border-line-light pb-6 dark:border-line-dark">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Link
              to={routes.write}
              className="inline-flex items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-hover"
            >
              <Icon name="edit" className="text-[16px]" />
              {labels.writeButton}
            </Link>
            <Link
              to={routes.board}
              className="inline-block rounded-control border border-line-strong-light bg-card-light px-4 py-2 text-sm font-medium text-ink-muted-light shadow-sm transition-colors hover:bg-card-head-light dark:border-line-strong-dark dark:bg-raised-dark dark:text-ink-muted-dark dark:hover:bg-field-dark"
            >
              {labels.boardTitle}
            </Link>
          </div>
        </div>
        <h1 className="text-center text-3xl font-bold tracking-tight text-ink-light dark:text-ink-dark">{labels.myPostsTitle}</h1>
      </header>

      <MyPostsTable posts={myPosts} rows={MY_POSTS_ROWS} />
      <Pagination pages={pager.pages} current={pager.page} onChange={pager.goTo} />
    </PageCard>
  );
};
