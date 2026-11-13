import React from 'react';
import { myAnswerStatus as M } from '../../data/mockData';
import type { Answer } from '../../data/types';
import { formatCount, formatDateTime } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface MyAnswerStatusCardProps {
  readonly answer: Answer;
  readonly className?: string;
}

export const MyAnswerStatusCard: React.FC<MyAnswerStatusCardProps> = ({
  answer: a,
  className = '',
}) => (
  <Card className={`p-space-md ${className}`}>
    <div className="flex items-center justify-between pb-space-xs border-b border-hairline">
      <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
        <Icon name="verified" className="text-semantic-success text-[18px]" />
        {M.title}
      </span>
      <span className="font-code-inline text-[11px] text-semantic-success bg-semantic-success-surface border border-semantic-success-border px-2 py-0.5 rounded font-semibold">
        {a.isAccepted ? M.badge.accepted : M.badge.waiting}
      </span>
    </div>
    <div className="mt-space-sm space-y-space-xs">
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-hairline">
        <div className="flex items-center gap-2">
          <Icon name="thumb_up" className="text-primary text-[20px]" />
          <span className="font-body-sm text-body-sm text-ink-muted">{M.votesLabel}</span>
        </div>
        <span className="font-code-inline text-headline-sm text-primary font-bold">
          {formatCount(a.voteCount)}
        </span>
      </div>
      <div className="pt-space-xs border-t border-hairline flex flex-col gap-1 font-caption text-caption text-ink-tertiary">
        <div className="flex justify-between">
          <span>{M.createdLabel}</span>
          <span className="font-code-inline text-ink-muted">{formatDateTime(a.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>{M.historyLabel}</span>
          <span className="font-code-inline text-ink-tertiary">
            {a.editedAt ? formatDateTime(a.editedAt) : M.noHistory}
          </span>
        </div>
      </div>
    </div>
  </Card>
);
