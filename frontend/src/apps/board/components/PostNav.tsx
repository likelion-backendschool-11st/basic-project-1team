import React from 'react';
import { Link } from 'react-router-dom';
import { labels, routes } from '../data/mockData';
import type { PostLink } from '../data/types';
import { Icon } from './Icon';

interface PostNavProps {
  /** 더 최근 글 */
  readonly prevPost: PostLink | null;
  /** 더 오래된 글 */
  readonly nextPost: PostLink | null;
}

interface NavRowProps {
  readonly label: string;
  readonly icon: string;
  readonly post: PostLink | null;
  readonly emptyText: string;
}

const NavRow: React.FC<NavRowProps> = ({ label, icon, post, emptyText }) => (
  <div className="flex min-w-0 items-center gap-3 px-5 py-3.5 text-sm sm:px-6">
    <span className="flex shrink-0 items-center gap-1 font-medium text-ink-subtle">
      <Icon name={icon} className="text-[18px]" />
      {label}
    </span>
    {post ? (
      <Link
        to={routes.detail(post.id)}
        className="truncate text-ink transition-colors hover:text-primary hover:underline"
      >
        {post.title}
      </Link>
    ) : (
      <span className="text-ink-tertiary">{emptyText}</span>
    )}
  </div>
);

/** 상세 아래 이전글·다음글 (REQ-BOARD-017). 목록 최신순 기준 */
export const PostNav: React.FC<PostNavProps> = ({ prevPost, nextPost }) => (
  <nav
    aria-label={`${labels.prevPost} / ${labels.nextPost}`}
    className="mt-6 divide-y overflow-hidden rounded-xl border divide-hairline border-hairline bg-surface-1"
  >
    <NavRow
      label={labels.prevPost}
      icon="expand_less"
      post={prevPost}
      emptyText={labels.noPrevPost}
    />
    <NavRow
      label={labels.nextPost}
      icon="expand_more"
      post={nextPost}
      emptyText={labels.noNextPost}
    />
  </nav>
);
