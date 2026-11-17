import React from 'react';
import { ProfileLink } from '../../../shared/layout/ProfileLink';
import { labels } from '../data/mockData';
import type { Comment } from '../data/types';
import { formatDateTime } from '../format';

/** 댓글을 고치는 중일 때 입력창 상태 (REQ-BOARD-016) */
interface CommentEditState {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly saving: boolean;
}

interface CommentItemProps {
  readonly comment: Comment;
  /** 본인 댓글이면 삭제 버튼을 보여 준다 */
  readonly onDelete?: () => void;
  /** 본인 댓글이면 수정 버튼을 보여 준다 */
  readonly onEdit?: () => void;
  /** 이 댓글을 고치는 중이면 본문 대신 입력창을 보여 준다 */
  readonly editing?: CommentEditState;
  /** 다른 회원 댓글이면 신고 화면 주소 */
  readonly reportHref?: string;
  readonly onReportClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// 내 댓글은 강조색, 다른 회원 댓글은 기본색 아바타
const AVATAR_MINE =
  'border-primary-container/40 bg-primary-container/20 text-primary-container text-primary';
const AVATAR_OTHER = 'border-hairline-strong bg-surface-3 text-ink-muted';
const ACTION =
  'rounded px-1.5 py-0.5 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink';

const CommentEditor: React.FC<{ readonly editing: CommentEditState }> = ({ editing }) => (
  <div className="flex flex-col gap-2">
    <textarea
      value={editing.value}
      onChange={(e) => editing.onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') editing.onCancel();
      }}
      maxLength={labels.commentMax}
      rows={2}
      autoFocus
      aria-label={labels.commentEdit}
      className="w-full resize-y rounded-lg border px-3 py-2 text-sm transition-colors focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container border-hairline-strong bg-surface-2 text-ink"
    />
    <div className="flex items-center justify-end gap-2 text-xs">
      <span className="mr-auto text-ink-subtle">
        {editing.value.length} / {labels.commentMax}
      </span>
      <button type="button" onClick={editing.onCancel} className={ACTION}>
        {labels.commentEditCancel}
      </button>
      <button
        type="button"
        onClick={editing.onSave}
        disabled={editing.saving || !editing.value.trim()}
        className="rounded bg-primary-container px-3 py-1 font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {editing.saving ? labels.commentEditSaving : labels.commentEditSave}
      </button>
    </div>
  </div>
);

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  onEdit,
  editing,
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
          {comment.isEdited && <span>{labels.edited}</span>}
          {reportHref && (
            <a
              href={reportHref}
              onClick={onReportClick}
              className="rounded px-1.5 py-0.5 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-semantic-danger"
            >
              {labels.report}
            </a>
          )}
          {onEdit && !editing && (
            <button type="button" onClick={onEdit} className={ACTION}>
              {labels.commentEdit}
            </button>
          )}
          {onDelete && !editing && (
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
      {editing ? (
        <CommentEditor editing={editing} />
      ) : (
        // 댓글은 일반 텍스트라 줄바꿈만 살려 그대로 보여 준다 (API_SPEC 1.9)
        <p className="whitespace-pre-wrap break-words text-sm leading-normal text-ink-muted">
          {comment.body}
        </p>
      )}
    </div>
  </div>
);
