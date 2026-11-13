import React from 'react';
import { Link } from 'react-router-dom';
import { relatedQuestions as R } from '../../data/mockData';
import type { RelatedQuestion } from '../../data/types';
import { formatCount, formatDate } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface RelatedQuestionsCardProps {
  /** GET /api/questions/:questionId/related (태그가 많이 겹치는 순서, 최대 5개) */
  readonly items: readonly RelatedQuestion[];
  readonly linkFor: (id: number) => string;
}

export const RelatedQuestionsCard: React.FC<RelatedQuestionsCardProps> = ({ items, linkFor }) => (
  <Card className="p-space-md space-y-space-sm">
    <h3 className="font-headline-sm text-headline-sm text-ink font-semibold flex items-center gap-2">
      <Icon name="forum" className="text-primary text-[18px]" />
      <span>{R.title}</span>
    </h3>
    {items.length === 0 ? (
      <p className="font-body-sm text-body-sm text-ink-tertiary">{R.empty}</p>
    ) : (
      <div className="space-y-2.5">
        {items.map((item) => (
          <Link
            key={item.id}
            to={linkFor(item.id)}
            className="block p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 transition-colors border border-hairline group"
          >
            <p className="font-body-sm text-body-sm text-ink font-medium line-clamp-1 group-hover:text-primary-hover transition-colors">
              {item.title}
            </p>
            <div className="flex items-center justify-between mt-1 font-caption text-caption text-ink-tertiary">
              <span className={item.isAccepted ? 'text-secondary font-medium' : 'text-ink-subtle'}>
                {R.status(item.isAccepted, formatCount(item.answerCount))}
              </span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    )}
  </Card>
);
