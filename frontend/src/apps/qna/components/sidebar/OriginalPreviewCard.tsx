import React from 'react';
import { Link } from 'react-router-dom';
import { originalPreview as P } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface OriginalPreviewCardProps {
  readonly to: string;
}

export const OriginalPreviewCard: React.FC<OriginalPreviewCardProps> = ({ to }) => (
  <Card bordered={false} className="p-space-md flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <span className="font-caption text-caption text-ink-tertiary">{P.label}</span>
      <Link
        to={to}
        target="_blank"
        className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5"
      >
        {P.open}
        <Icon name="open_in_new" className="text-[13px]" />
      </Link>
    </div>
    <Link to={to} className="p-space-sm rounded-lg bg-surface-2 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-semantic-success" />
        <span className="font-label-sm text-label-sm text-ink truncate">{P.title}</span>
      </div>
      <p className="font-caption text-caption text-ink-subtle line-clamp-2">{P.excerpt}</p>
      <div className="flex items-center gap-2 pt-1 font-caption text-caption text-ink-tertiary">
        <span>{P.meta[0]}</span>
        <span>•</span>
        <span>{P.meta[1]}</span>
      </div>
    </Link>
  </Card>
);
