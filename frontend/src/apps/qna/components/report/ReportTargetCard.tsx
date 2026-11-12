import React from 'react';
import { reportPage as R } from '../../data/mockData';
import type { ReportTarget } from '../../data/types';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';

interface ReportTargetCardProps {
  readonly target: ReportTarget;
  readonly className?: string;
}

/** 신고 대상 요약 (질문·답변·게시글·댓글) */
export const ReportTargetCard: React.FC<ReportTargetCardProps> = ({ target, className = '' }) => (
  <Card className={`p-6 relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-1 h-full bg-semantic-danger" />
    <div className="flex items-center justify-between mb-4">
      <span className="px-2.5 py-1 rounded bg-semantic-danger-surface text-semantic-danger font-label-sm text-label-sm border border-semantic-danger-border flex items-center gap-1">
        <Icon name="flag" className="text-[13px]" />
        {R.targetBadge(target.kindLabel)}
      </span>
      {target.date && (
        <span className="font-caption text-caption text-ink-tertiary">
          {R.writtenAt(target.date)}
        </span>
      )}
    </div>
    <div className="bg-surface-2 rounded-lg p-4 border border-hairline">
      <h2 className="font-headline-sm text-headline-sm text-ink mb-2 leading-snug">
        {target.title}
      </h2>
      {target.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {target.tags.map((tag) => (
            <TagChip key={tag} label={tag} variant="small" />
          ))}
        </div>
      )}
      {target.excerpt && (
        <div className="p-3 bg-surface-1 rounded border-l-2 border-hairline-strong text-ink-subtle font-body-sm text-body-sm leading-relaxed mb-3">
          {target.excerpt}
        </div>
      )}
      <div className="flex items-center justify-between text-ink-tertiary font-caption text-caption pt-2 border-t border-hairline">
        <div className="flex items-center gap-2">
          <Avatar initial={target.author.initial} />
          <span className="text-ink-muted font-label-sm text-label-sm">{target.author.name}</span>
          {target.author.title && <span className="text-ink-tertiary">{target.author.title}</span>}
        </div>
        {target.stats && (
          <div className="flex items-center gap-3 font-code-inline text-code-inline">
            <span className="flex items-center gap-1">
              <Icon name="visibility" className="text-[13px]" /> {target.stats.views}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="forum" className="text-[13px]" /> {target.stats.answers}
            </span>
          </div>
        )}
      </div>
    </div>
  </Card>
);
