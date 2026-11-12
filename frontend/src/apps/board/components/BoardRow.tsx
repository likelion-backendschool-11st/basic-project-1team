import React from 'react';
import { ProfileLink } from '../../../shared/layout/ProfileLink';
import { mockUserId } from '../../../shared/mockUsers';
import { Link } from 'react-router-dom';
import { type Post, routes } from '../data/mockData';
import { CommentCount } from './CommentCount';
import { EditBadge } from './EditBadge';

interface BoardRowProps {
  readonly post: Post;
  readonly isOwner: boolean;
  readonly onEdit: (post: Post) => void;
}

const cell = 'border-r border-hairline';

export const BoardRow: React.FC<BoardRowProps> = ({ post, isOwner, onEdit }) => (
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
        {isOwner && <EditBadge onClick={() => onEdit(post)} />}
      </div>
    </td>
    <td className={`px-4 py-3.5 text-ink-muted ${cell}`}>
      <ProfileLink userId={mockUserId(post.author)}>{post.author}</ProfileLink>
    </td>
    <td className={`px-4 py-3.5 font-mono text-xs text-ink-subtle ${cell}`}>{post.date}</td>
    <td className="px-4 py-3.5 font-mono text-ink-muted">{post.views}</td>
  </tr>
);
