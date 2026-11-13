import React from 'react';
import { ProfileLink } from '../../../shared/layout/ProfileLink';
import { labels } from '../data/mockData';
import type { Comment } from '../data/types';
import { formatDateTime } from '../format';

interface CommentItemProps {
  readonly comment: Comment;
  /** 본인 댓글이면 삭제 버튼을 보여 준다 */
  readonly onDelete?: () => void;
  /** 다른 회원 댓글이면 신고 화면 주소 */
  readonly reportHref?: string;
  readonly onReportClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// 내 댓글은 강조색, 다른 회원 댓글은 기본색 아바타
const AVATAR_MINE =
  'border-primary-container/40 bg-primary-container/20 text-primary-container text-primary';
const AVATAR_OTHER = 'border-hairline-strong bg-surface-3 text-ink-muted';

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  reportHref,
  onReportClick,
}) => (
  <div className="flex items-start gap-4 p-5 transition-colors hover:bg-surface-2/50 sm:px-6">
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
        comment.isMine ? AVATAR_MINE : AVATAR_OTHER
      }`}
    >
      {comment.author.nickname.charAt(0)}
    </div>
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <ProfileLink userId={comment.author.id} className="text-sm font-bold text-ink">
          {comment.author.nickname}
        </ProfileLink>
        <span className="flex items-center gap-2 text-xs text-ink-subtle">
          {formatDateTime(comment.createdAt)}
          {reportHref && (
            <a
              href={reportHref}
              onClick={onReportClick}
              className="rounded px-1.5 py-0.5 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-semantic-danger"
            >
              {labels.report}
            </a>
          )}
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
      {/* 댓글은 일반 텍스트라 줄바꿈만 살려 그대로 보여 준다 (API_SPEC 1.9) */}
      <p className="whitespace-pre-wrap break-words text-sm leading-normal text-ink-muted">
        {comment.body}
      </p>
    </div>
  </div>
);
