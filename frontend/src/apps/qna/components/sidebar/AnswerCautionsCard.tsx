import React from 'react';
import { answerCautions as C } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface AnswerCautionsCardProps {
  readonly className?: string;
}

export const AnswerCautionsCard: React.FC<AnswerCautionsCardProps> = ({ className = '' }) => (
  <Card className={`p-space-md ${className}`}>
    <h4 className="font-headline-sm text-headline-sm text-ink font-semibold flex items-center gap-1.5 mb-space-sm">
      <Icon name="gavel" className="text-tertiary text-[18px]" />
      {C.title}
    </h4>
    <ul className="space-y-space-sm font-body-sm text-body-sm text-ink-muted">
      {C.items.map((item) => (
        <li key={item.title} className="flex items-start gap-2">
          <Icon name="check" className="text-semantic-success text-[16px] shrink-0 mt-0.5" />
          <div>
            <strong className="text-ink font-medium">{item.title}</strong>
            <p className="text-ink-tertiary font-caption text-caption mt-0.5">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  </Card>
);
