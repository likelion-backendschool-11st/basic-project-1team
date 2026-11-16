import React from 'react';
import { Link } from 'react-router-dom';
import { labels, routes } from '../data/mockData';
import type { PopularPost } from '../data/types';
import { CommentCount } from './CommentCount';

interface PopularPostsProps {
  readonly posts: readonly PopularPost[];
}

// 1~3위는 강조색으로 순위를 보여 준다
const rankClass = (rank: number) =>
  rank <= 3 ? 'bg-tertiary-container text-white' : 'bg-surface-3 text-ink-subtle';

/** 목록 위 최근 7일 인기글 순위 (REQ-BOARD-013). 글이 없으면 그리지 않는다 */
export const PopularPosts: React.FC<PopularPostsProps> = ({ posts }) => {
  if (posts.length === 0) return null;

  return (
    <section className="mb-4 rounded-lg border px-4 py-3 border-hairline bg-surface-2">
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-sm font-bold text-ink">{labels.popularTitle}</h2>
        <span className="text-xs text-ink-subtle">{labels.popularCaption}</span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {posts.map((post) => (
          <li key={post.id} className="flex min-w-0 items-center gap-2 text-sm">
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${rankClass(post.rank)}`}
            >
              {post.rank}
            </span>
            <Link
              to={routes.detail(post.id)}
              className="truncate text-ink transition-colors hover:text-primary hover:underline"
            >
              {post.title}
            </Link>
            <CommentCount count={post.commentCount} />
          </li>
        ))}
      </ol>
    </section>
  );
};
