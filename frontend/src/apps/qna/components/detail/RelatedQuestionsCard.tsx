import React from 'react';
import { Link } from 'react-router-dom';
import { relatedQuestions } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface RelatedQuestionsCardProps {
  readonly linkFor: (id: number) => string;
}

export const RelatedQuestionsCard: React.FC<RelatedQuestionsCardProps> = ({ linkFor }) => (
  <Card className="p-space-md space-y-space-sm">
    <h3 className="font-headline-sm text-headline-sm text-ink font-semibold flex items-center gap-2">
      <Icon name="forum" className="text-primary text-[18px]" />
      <span>{relatedQuestions.title}</span>
    </h3>
    <div className="space-y-2.5">
      {relatedQuestions.items.map((item) => (
        <Link
          key={item.id}
          to={linkFor(item.id)}
          className="block p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 transition-colors border border-hairline group"
        >
          <p className="font-body-sm text-body-sm text-ink font-medium line-clamp-1 group-hover:text-primary-hover transition-colors">{item.title}</p>
          <div className="flex items-center justify-between mt-1 font-caption text-caption text-ink-tertiary">
            <span className={item.solved ? 'text-secondary font-medium' : 'text-ink-subtle'}>{item.status}</span>
            <span>{item.ago}</span>
          </div>
        </Link>
      ))}
    </div>
  </Card>
);
