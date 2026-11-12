import React from 'react';
import { writingGuide as G } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { NumberBadge } from '../common/NumberBadge';

interface WritingGuideCardProps {
  readonly className?: string;
}

export const WritingGuideCard: React.FC<WritingGuideCardProps> = ({ className = '' }) => (
  <Card bordered={false} className={`p-space-lg ${className}`}>
    <div className="flex items-center gap-space-xs mb-space-md">
      <Icon name="help_center" className="text-primary-fixed-dim text-[20px]" />
      <h2 className="font-headline-sm text-headline-sm text-ink font-semibold">{G.title}</h2>
    </div>
    <ul className="space-y-space-md font-body-sm text-body-sm text-ink-subtle">
      {G.items.map((item, i) => (
        <li key={item.title} className="flex items-start gap-2.5">
          <NumberBadge index={i + 1} shape="square" />
          <div>
            <strong className="text-ink font-medium">{item.title}</strong>
            <p className="text-caption text-ink-tertiary mt-0.5">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-space-md bg-surface-2 rounded-lg p-space-sm">
      <div className="flex items-center gap-1.5 text-secondary font-label-md text-label-md">
        <Icon name="verified" className="text-[18px]" />
        {G.highlightTitle}
      </div>
      <p className="text-caption text-ink-tertiary mt-1">{G.highlightBody}</p>
    </div>
  </Card>
);
