import React from 'react';
import { editQuestionStatus as S } from '../../data/mockData';
import type { Question } from '../../data/types';
import { formatCount, formatDate } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface EditStatusCardProps {
  readonly question: Question;
  readonly className?: string;
}

const statusBadge = (q: Question) =>
  q.isAccepted ? S.badge.accepted : q.answerCount > 0 ? S.badge.answered : S.badge.waiting;

export const EditStatusCard: React.FC<EditStatusCardProps> = ({ question: q, className = '' }) => (
  <Card bordered={false} className={`p-space-md flex flex-col gap-space-sm ${className}`}>
    <div className="flex items-center justify-between">
      <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
        <Icon name="analytics" className="text-[18px] text-tertiary" />
        {S.title}
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-semantic-success-surface text-semantic-success font-code-inline text-code-inline font-medium">
        {statusBadge(q)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
      <div className="p-space-xs rounded bg-surface-2 flex flex-col">
        <span className="font-caption text-caption text-ink-tertiary">{S.answersLabel}</span>
        <span className="font-headline-sm text-headline-sm text-ink font-semibold flex items-baseline gap-1">
          {formatCount(q.answerCount)}
          <span className="font-caption text-caption text-ink-subtle">
            {S.answersSuffix(q.isAccepted)}
          </span>
        </span>
      </div>
      <div className="p-space-xs rounded bg-surface-2 flex flex-col">
        <span className="font-caption text-caption text-ink-tertiary">{S.viewsLabel}</span>
        <span className="font-body-md text-body-md text-ink font-medium">
          {S.views(formatCount(q.viewCount))}
        </span>
      </div>
      <div className="p-space-xs rounded bg-surface-2 flex flex-col">
        <span className="font-caption text-caption text-ink-tertiary">{S.createdLabel}</span>
        <span className="font-code-inline text-code-inline text-ink-subtle">
          {formatDate(q.createdAt)}
        </span>
      </div>
    </div>
  </Card>
);
