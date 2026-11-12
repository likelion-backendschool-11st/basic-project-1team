import React from 'react';
import { Link } from 'react-router-dom';
import { Post, routes } from '../data/mockData';
import CommentCount from './CommentCount';
import EditBadge from './EditBadge';

interface BoardRowProps {
  readonly post: Post;
  readonly isOwner: boolean;
  readonly onEdit: (post: Post) => void;
}

const cell = 'border-r border-line-light dark:border-line-dark';

export const BoardRow: React.FC<BoardRowProps> = ({ post, isOwner, onEdit }) => (
  <tr className="border-b border-line-light transition-colors hover:bg-card-head-light dark:border-line-dark dark:hover:bg-field-dark">
    <td className={`px-3 py-3.5 font-mono text-ink-subtle-light dark:text-ink-subtle-dark ${cell}`}>{post.id}</td>
    <td className={`px-6 py-3.5 text-left ${cell}`}>
      <div className="flex items-center gap-2">
        <Link
          to={routes.detail(post.id)}
          className="font-medium text-ink-light transition-colors hover:text-accent-light hover:underline dark:text-ink-dark dark:hover:text-accent-dark"
        >
          {post.title}
        </Link>
        <CommentCount count={post.comments} />
        {isOwner && <EditBadge onClick={() => onEdit(post)} />}
      </div>
    </td>
    <td className={`px-4 py-3.5 text-ink-muted-light dark:text-ink-muted-dark ${cell}`}>{post.author}</td>
    <td className={`px-4 py-3.5 font-mono text-xs text-ink-subtle-light dark:text-ink-subtle-dark ${cell}`}>{post.date}</td>
    <td className="px-4 py-3.5 font-mono text-ink-subtle-light dark:text-ink-muted-dark">{post.views}</td>
  </tr>
);

export default BoardRow;
