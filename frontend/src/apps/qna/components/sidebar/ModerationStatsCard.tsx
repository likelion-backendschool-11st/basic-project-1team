import React from 'react';
import { moderationStats as M } from '../../data/mockData';
import { Card } from '../common/Card';

interface ModerationStatsCardProps {
  readonly className?: string;
}

export const ModerationStatsCard: React.FC<ModerationStatsCardProps> = ({ className = '' }) => (
  <Card className={`p-5 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center justify-between text-ink-subtle font-label-md text-label-md">
      <span>{M.title}</span>
      <span className="font-code-inline text-code-inline text-ink-tertiary">{M.date}</span>
    </div>
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-caption font-caption text-ink-tertiary">
        <span>{M.rateLabel}</span>
        <span className="font-code-inline text-ink">{M.rate}</span>
      </div>
      <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden flex">
        <div className="h-full bg-primary-container" style={{ width: `${M.normalPercent}%` }} />
        <div className="h-full bg-semantic-danger" style={{ width: `${M.blindPercent}%` }} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-1">
      {M.tiles.map((t) => (
        <div key={t.label} className="bg-surface-2 p-2.5 rounded border border-hairline text-center">
          <div className={`font-code-inline text-code-inline font-semibold ${t.danger ? 'text-semantic-danger' : 'text-ink'}`}>{t.value}</div>
          <div className="font-caption text-[11px] text-ink-tertiary">{t.label}</div>
        </div>
      ))}
    </div>
  </Card>
);
