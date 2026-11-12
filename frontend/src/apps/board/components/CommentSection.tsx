import React from 'react';
import { useLoginGate } from '../../../shared/LoginGate';
import { labels } from '../data/mockData';
import { type useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Icon } from './Icon';

interface CommentSectionProps {
  readonly comments: ReturnType<typeof useComments>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments: c }) => {
  const { requireLogin } = useLoginGate();
  // 비회원이면 입력한 내용은 그대로 두고 팝업만 띄운다
  const submit = () => requireLogin() && c.submit();

  return (
    <section className="overflow-hidden rounded-xl border border-line-light bg-card-light dark:border-line-dark dark:bg-card-dark">
      <div className="flex items-center gap-2 border-b border-line-light bg-card-head-light px-6 py-4 dark:border-line-dark dark:bg-raised-dark/40">
        <h3 className="text-sm font-bold text-ink-light dark:text-ink-dark sm:text-base">{labels.commentsTitle}</h3>
        <span className="rounded-full border border-brand/40 bg-brand/20 px-2 py-0.5 text-xs font-semibold text-brand dark:text-accent-dark">
          {c.comments.length}
        </span>
      </div>

      <div className="divide-y divide-line-light dark:divide-line-dark">
        {c.shown.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {c.comments.length > 1 && (
        <div className="border-t border-line-light py-2.5 text-center dark:border-line-dark">
          <button
            type="button"
            onClick={c.toggleExpanded}
            aria-expanded={c.expanded}
            className="inline-flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium text-ink-subtle-light transition-colors hover:bg-raised-light hover:text-ink-light dark:text-ink-subtle-dark dark:hover:bg-raised-dark dark:hover:text-ink-dark"
          >
            {c.expanded ? labels.commentsLess : labels.commentsMore(c.comments.length)}
            <Icon name="expand_more" className={`text-[16px] transition-transform ${c.expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      <CommentForm
        value={c.draft}
        onChange={c.setDraft}
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
        }}
      />
    </section>
  );
};
