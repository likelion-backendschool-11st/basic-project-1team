import React from 'react';
import { questionAuthor as A } from '../../data/mockData';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';

interface AuthorProfileCardProps {
  readonly className?: string;
}

export const AuthorProfileCard: React.FC<AuthorProfileCardProps> = ({ className = '' }) => (
  <Card className={`p-space-md space-y-space-sm ${className}`}>
    <div className="flex items-center gap-space-sm">
      <Avatar initial={A.initial} size="lg" tone="primary" />
      <div className="flex flex-col">
        <span className="font-headline-sm text-headline-sm text-ink font-semibold">{A.name}</span>
        <span className="font-caption text-caption text-ink-subtle">{A.joined}</span>
      </div>
    </div>
    <p className="font-body-sm text-body-sm text-ink-muted pt-1">{A.bio}</p>
    <div className="pt-2 flex items-center justify-between text-caption font-caption text-ink-tertiary">
      <span>
        {A.acceptRateLabel} <strong className="text-ink">{A.acceptRate}</strong>
      </span>
      <span>
        {A.bonusLabel} <strong className="text-secondary">{A.bonus}</strong>
      </span>
    </div>
  </Card>
);

export default AuthorProfileCard;
