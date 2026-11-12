import React from 'react';
import { Link } from 'react-router-dom';
import type { QuestionSummary } from '../../data/types';

interface QuestionMobileCardProps {
  readonly question: QuestionSummary;
  readonly to: string;
}

export const QuestionMobileCard: React.FC<QuestionMobileCardProps> = ({ question: q, to }) => (
  <div className={`p-3.5 flex flex-col gap-2 hover:bg-surface-2/50 ${q.accepted ? 'bg-semantic-success-surface/25' : ''}`}>
    <div className="flex items-center justify-between gap-2">
      <span className="px-2 py-0.5 rounded bg-surface-2 font-code-inline text-[11px] text-ink-muted">{q.tag}</span>
      <span className="font-code-inline text-caption text-ink-tertiary">{q.date}</span>
    </div>
    <Link to={to} className="font-headline-sm text-headline-sm text-ink font-medium hover:text-primary flex items-center gap-1.5">
      {q.accepted && <span className="text-secondary text-[14px]">✓</span>}
      {q.title}
    </Link>
    <div className="flex items-center justify-between pt-1 text-ink-subtle font-body-sm text-body-sm">
      <span>{q.author}</span>
      <div className="flex items-center gap-3">
        <span className="font-code-inline text-caption">조회 {q.views}</span>
        <span
          className={`px-2 py-0.5 rounded font-code-inline text-code-inline ${
            q.accepted ? 'bg-semantic-success text-on-primary font-bold' : 'bg-surface-2 text-ink'
          }`}
        >
          {q.accepted ? '채택' : '답변'} {q.answers}
        </span>
      </div>
    </div>
  </div>
);

export default QuestionMobileCard;
