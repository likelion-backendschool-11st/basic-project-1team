import React from 'react';
import { type Comment } from '../data/mockData';

interface CommentItemProps {
  readonly comment: Comment;
}

const avatarTone: Record<Comment['tone'], string> = {
  neutral:
    'border-line-strong-light bg-raised-light text-ink-muted-light dark:border-line-strong-dark dark:bg-raised-dark dark:text-ink-muted-dark',
  success:
    'border-success/40 bg-success/20 text-success dark:border-success/40 dark:bg-success/20 dark:text-success',
  brand:
    'border-brand/40 bg-brand/20 text-brand dark:border-brand/40 dark:bg-brand/20 dark:text-accent-dark',
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => (
  <div className="flex items-start gap-4 p-5 transition-colors hover:bg-card-head-light dark:hover:bg-field-dark/50 sm:px-6">
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarTone[comment.tone]}`}
    >
      {comment.author.charAt(0)}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-ink-light dark:text-ink-dark">
          {comment.author}
        </span>
        <span className="text-xs text-ink-subtle-light dark:text-ink-subtle-dark">
          {comment.date}
        </span>
      </div>
      <p className="text-sm leading-normal text-ink-muted-light dark:text-ink-muted-dark">
        {comment.body}
      </p>
    </div>
  </div>
);
