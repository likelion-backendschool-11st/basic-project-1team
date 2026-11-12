import React from 'react';
import { myAnswerStatus as M } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface MyAnswerStatusCardProps {
  readonly className?: string;
}

export const MyAnswerStatusCard: React.FC<MyAnswerStatusCardProps> = ({ className = '' }) => (
  <Card className={`p-space-md ${className}`}>
    <div className="flex items-center justify-between pb-space-xs border-b border-hairline">
      <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
        <Icon name="verified" className="text-semantic-success text-[18px]" />
        {M.title}
      </span>
      <span className="font-code-inline text-[11px] text-semantic-success bg-semantic-success-surface border border-semantic-success-border px-2 py-0.5 rounded font-semibold">{M.badge}</span>
    </div>
    <div className="mt-space-sm space-y-space-xs">
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-hairline">
        <div className="flex items-center gap-2">
          <Icon name="thumb_up" className="text-primary text-[20px]" />
          <span className="font-body-sm text-body-sm text-ink-muted">{M.votesLabel}</span>
        </div>
        <span className="font-code-inline text-headline-sm text-primary font-bold">{M.votes}</span>
      </div>
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-hairline">
        <div className="flex items-center gap-2">
          <Icon name="military_tech" className="text-tertiary text-[20px]" />
          <span className="font-body-sm text-body-sm text-ink-muted">{M.expLabel}</span>
        </div>
        <span className="font-code-inline text-body-lg text-tertiary font-bold">{M.exp}</span>
      </div>
      <div className="pt-space-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-[14px]">{M.author.name}</div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-label-md text-label-md text-ink font-semibold truncate">{M.author.name}</span>
            <span className="font-code-inline text-[11px] text-tertiary">{M.author.level}</span>
          </div>
          <span className="font-caption text-caption text-ink-tertiary">{M.author.summary}</span>
        </div>
      </div>
      <div className="pt-space-xs border-t border-hairline flex flex-col gap-1 font-caption text-caption text-ink-tertiary">
        <div className="flex justify-between">
          <span>{M.createdLabel}</span>
          <span className="font-code-inline text-ink-muted">{M.createdAt}</span>
        </div>
        <div className="flex justify-between">
          <span>{M.historyLabel}</span>
          <span className="font-code-inline text-ink-tertiary">{M.history}</span>
        </div>
      </div>
    </div>
  </Card>
);
