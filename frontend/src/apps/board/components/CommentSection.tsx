import React from 'react';
import { useLoginGate } from '../../../shared/LoginGate';
import { restrictionFor } from '../../../shared/sanctions';
import { reportPath } from '../../../shared/site';
import { labels } from '../data/mockData';
import { type useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Icon } from './Icon';

interface CommentSectionProps {
  readonly comments: ReturnType<typeof useComments>;
  /** 신고 후 돌아올 게시글 주소 */
  readonly postHref: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments: c, postHref }) => {
  const { requireLogin, guardLink } = useLoginGate();
  // 댓글 제한·이용 정지 중이면 입력을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('comment');
  // 비회원이면 입력한 내용은 그대로 두고 팝업만 띄운다
  const submit = () => requireLogin() && !restriction && c.submit();

  return (
    <section className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
      <div className="flex items-center gap-2 border-b px-6 py-4 border-hairline bg-surface-3/40">
        <h3 className="text-sm font-bold text-ink sm:text-base">{labels.commentsTitle}</h3>
        <span className="rounded-full border border-primary-container/40 bg-primary-container/20 px-2 py-0.5 text-xs font-semibold text-primary-container text-primary">
          {c.comments.length}
        </span>
      </div>

      <div className="divide-y divide-hairline">
        {c.shown.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onDelete={c.isMine(comment) ? () => c.remove(comment) : undefined}
            // 본인 글은 신고할 수 없다 (API_SPEC 8장)
            reportHref={c.isMine(comment) ? undefined : reportPath('comment', comment.id, postHref)}
            onReportClick={guardLink}
          />
        ))}
      </div>

      {c.comments.length > 1 && (
        <div className="border-t py-2.5 text-center border-hairline">
          <button
            type="button"
            onClick={c.toggleExpanded}
            aria-expanded={c.expanded}
            className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium transition-colors text-ink-subtle hover:bg-surface-3 hover:text-ink"
          >
            {c.expanded ? labels.commentsLess : labels.commentsMore(c.comments.length)}
            <Icon
              name="expand_more"
              className={`text-[16px] transition-transform ${c.expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      <CommentForm
        value={c.draft}
        onChange={c.setDraft}
        onSubmit={submit}
        restriction={restriction}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
        }}
      />
    </section>
  );
};
