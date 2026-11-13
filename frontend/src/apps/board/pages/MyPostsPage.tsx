import React from 'react';
import { Link } from 'react-router-dom';
import { blockIfRestricted } from '../../../shared/sanctions';
import { MY_POSTS_ROWS, labels, routes } from '../data/mockData';
import { useMyPosts } from '../hooks/useMyPosts';
import { Icon } from '../components/Icon';
import { MyPostsTable } from '../components/MyPostsTable';
import { PageCard } from '../components/PageCard';
import { Pagination } from '../components/Pagination';

interface MyPostsPageProps {
  readonly className?: string;
}

export const MyPostsPage: React.FC<MyPostsPageProps> = () => {
  const my = useMyPosts();
  const notice = my.loading
    ? labels.loading
    : (my.errorMessage ?? (my.posts.length === 0 ? labels.empty : null));

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

      <MyPostsTable
        posts={my.loading ? [] : my.posts}
        rows={MY_POSTS_ROWS}
        startNo={my.startNo}
        notice={notice}
      />
      <Pagination pages={my.pages} current={my.page} onChange={my.goTo} />
    </PageCard>
  );
};
