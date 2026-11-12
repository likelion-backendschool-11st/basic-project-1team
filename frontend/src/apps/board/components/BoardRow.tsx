import React from 'react';
import { ProfileLink } from '../../../shared/layout/ProfileLink';
import { mockUserId } from '../../../shared/mockUsers';
import { Link } from 'react-router-dom';
import { type Post, labels, routes } from '../data/mockData';
import { CommentCount } from './CommentCount';

interface BoardRowProps {
  readonly post: Post;
  /** 내가 쓴 글 (API 의 isMine) */
  readonly isMine: boolean;
}

const cell = 'border-r border-hairline';

export const BoardRow: React.FC<BoardRowProps> = ({ post, isMine }) => (
  <tr className="border-b transition-colors border-hairline hover:bg-surface-2">
    <td className={`px-3 py-3.5 font-mono text-ink-subtle ${cell}`}>{post.id}</td>
    <td className={`px-6 py-3.5 text-left ${cell}`}>
      <div className="flex items-center gap-2">
        <Link
          to={routes.detail(post.id)}
          className="font-medium transition-colors hover:underline text-ink hover:text-primary"
        >
          {post.title}
        </Link>
        <CommentCount count={post.comments} />
        {isMine && (
          <span className="shrink-0 rounded border border-hairline-strong bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-subtle">
            {labels.mine}
          </span>
        )}
      </div>
    </td>
    <td className={`px-4 py-3.5 text-ink-muted ${cell}`}>
      <ProfileLink userId={mockUserId(post.author)}>{post.author}</ProfileLink>
    </td>
    <td className={`px-4 py-3.5 font-mono text-xs text-ink-subtle ${cell}`}>{post.date}</td>
    <td className="px-4 py-3.5 font-mono text-ink-muted">{post.views}</td>
  </tr>
);
