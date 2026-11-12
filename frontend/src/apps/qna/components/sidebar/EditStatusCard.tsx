import React from 'react';
import { editQuestionStatus as S } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface EditStatusCardProps {
  readonly className?: string;
}

export const EditStatusCard: React.FC<EditStatusCardProps> = ({ className = '' }) => (
  <Card bordered={false} className={`p-space-md flex flex-col gap-space-sm ${className}`}>
    <div className="flex items-center justify-between">
      <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
        <Icon name="analytics" className="text-[18px] text-tertiary" />
        {S.title}
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-semantic-success-surface text-semantic-success font-code-inline text-code-inline font-medium">
        {S.badge}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
      {S.tiles.map((t) => (
        <div key={t.label} className="p-space-xs rounded bg-surface-2 flex flex-col">
          <span className="font-caption text-caption text-ink-tertiary">{t.label}</span>
          {t.variant === 'body' && (
            <span className="font-body-md text-body-md text-ink font-medium">{t.value}</span>
          )}
          {t.variant === 'code' && (
            <span className="font-code-inline text-code-inline text-ink-subtle">{t.value}</span>
          )}
          {t.variant.startsWith('headline') && (
            <span className="font-headline-sm text-headline-sm text-ink font-semibold flex items-baseline gap-1">
              {t.value}
              <span className="font-caption text-caption text-ink-subtle">
                {'suffix' in t ? t.suffix : ''}
              </span>
            </span>
          )}
        </div>
      ))}
    </div>
  </Card>
);
