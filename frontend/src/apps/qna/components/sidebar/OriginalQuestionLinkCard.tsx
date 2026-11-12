import React from 'react';
import { Link } from 'react-router-dom';
import { originalQuestionLink as O } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface OriginalQuestionLinkCardProps {
  readonly to: string;
}

export const OriginalQuestionLinkCard: React.FC<OriginalQuestionLinkCardProps> = ({ to }) => (
  <Card className="p-space-md">
    <div className="flex items-center justify-between mb-space-xs">
      <span className="font-caption text-caption text-ink-tertiary font-code-inline uppercase tracking-wider">
        {O.label}
      </span>
      <Icon name="link" className="text-ink-subtle text-[16px]" />
    </div>
    <p className="font-label-md text-label-md text-ink font-semibold line-clamp-2">{O.title}</p>
    <div className="mt-2 flex items-center justify-between font-caption text-caption text-ink-tertiary">
      <span>{O.author}</span>
      <span className="font-code-inline text-primary">{O.answers}</span>
    </div>
    <Link
      to={to}
      target="_blank"
      className="mt-space-sm w-full py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink font-caption text-caption flex items-center justify-center gap-1 transition-colors"
    >
      {O.open}
      <Icon name="open_in_new" className="text-[13px]" />
    </Link>
  </Card>
);
