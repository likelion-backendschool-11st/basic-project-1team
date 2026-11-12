import React from 'react';
import { Link } from 'react-router-dom';
import { similarSolved as S } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface SimilarSolvedCardProps {
  readonly linkFor: (id: number) => string;
}

export const SimilarSolvedCard: React.FC<SimilarSolvedCardProps> = ({ linkFor }) => (
  <Card bordered={false} className="p-space-lg">
    <div className="flex items-center justify-between mb-space-sm">
      <h3 className="font-headline-sm text-headline-sm text-ink font-semibold">{S.title}</h3>
      <Icon name="auto_fix_high" className="text-ink-tertiary text-[18px]" />
    </div>
    <p className="font-caption text-caption text-ink-tertiary mb-space-sm">{S.description}</p>
    <div className="flex flex-col gap-2">
      {S.items.map((item) => (
        <Link key={item.id} to={linkFor(item.id)} className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors flex flex-col gap-1 group">
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-semantic-success-surface text-semantic-success font-code-inline text-[10px] font-medium flex items-center gap-0.5">
              <Icon name="check_circle" className="text-[12px]" />
              {S.solvedLabel}
            </span>
            <span className="text-ink-tertiary font-code-inline text-[10px]">{item.answers}</span>
          </div>
          <span className="font-body-sm text-body-sm text-ink group-hover:text-primary transition-colors line-clamp-1">{item.title}</span>
        </Link>
      ))}
    </div>
  </Card>
);

export default SimilarSolvedCard;
