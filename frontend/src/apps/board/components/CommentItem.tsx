import React from 'react';
import { type Comment, labels } from '../data/mockData';

interface CommentItemProps {
  readonly comment: Comment;
  /** 본인 댓글이면 삭제 버튼을 보여 준다 */
  readonly onDelete?: () => void;
}

const avatarTone: Record<Comment['tone'], string> = {
  neutral: 'border-hairline-strong bg-surface-3 text-ink-muted',
  success:
    'border-semantic-success/40 bg-semantic-success/20 text-semantic-success border-semantic-success/40 bg-semantic-success/20 text-semantic-success',
  brand:
    'border-primary-container/40 bg-primary-container/20 text-primary-container border-primary-container/40 bg-primary-container/20 text-primary',
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete }) => (
  <div className="flex items-start gap-4 p-5 transition-colors hover:bg-surface-2/50 sm:px-6">
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${avatarTone[comment.tone]}`}
    >
      {comment.author.charAt(0)}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-ink">{comment.author}</span>
        <span className="flex items-center gap-2 text-xs text-ink-subtle">
          {comment.date}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded px-1.5 py-0.5 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-semantic-danger"
            >
              {labels.commentDelete}
            </button>
          )}
        </span>
      </div>
      <p className="text-sm leading-normal text-ink-muted">{comment.body}</p>
    </div>
  </div>
);
