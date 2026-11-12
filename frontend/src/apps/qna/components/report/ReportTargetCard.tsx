import React from 'react';
import { reportPage as R } from '../../data/mockData';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';

interface ReportTargetCardProps {
  readonly className?: string;
}

export const ReportTargetCard: React.FC<ReportTargetCardProps> = ({ className = '' }) => (
  <Card className={`p-6 relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-1 h-full bg-semantic-danger" />
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded bg-semantic-danger-surface text-semantic-danger font-label-sm text-label-sm border border-semantic-danger-border flex items-center gap-1">
          <Icon name="flip_camera_ios" className="text-[13px]" />
          {R.targetBadge}
        </span>
        <span className="font-code-inline text-code-inline text-ink-subtle">{R.targetId}</span>
      </div>
      <span className="font-caption text-caption text-ink-tertiary">{R.targetDate}</span>
    </div>
    <div className="bg-surface-2 rounded-lg p-4 border border-hairline">
      <h2 className="font-headline-sm text-headline-sm text-ink mb-2 leading-snug">
        {R.targetTitle}
      </h2>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {R.targetTags.map((tag) => (
          <TagChip key={tag} label={tag} variant="small" />
        ))}
      </div>
      <div className="p-3 bg-surface-1 rounded border-l-2 border-hairline-strong text-ink-subtle font-body-sm text-body-sm leading-relaxed mb-3">
        {R.targetExcerpt}
      </div>
      <div className="flex items-center justify-between text-ink-tertiary font-caption text-caption pt-2 border-t border-hairline">
        <div className="flex items-center gap-2">
          <Avatar initial={R.targetAuthor.initial} />
          <span className="text-ink-muted font-label-sm text-label-sm">{R.targetAuthor.name}</span>
          <span className="text-ink-tertiary">{R.targetAuthor.title}</span>
        </div>
        <div className="flex items-center gap-3 font-code-inline text-code-inline">
          <span className="flex items-center gap-1">
            <Icon name="thumb_up" className="text-[13px]" /> {R.targetStats.votes}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="visibility" className="text-[13px]" /> {R.targetStats.views}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="forum" className="text-[13px]" /> {R.targetStats.answers}
          </span>
        </div>
      </div>
    </div>
  </Card>
);
