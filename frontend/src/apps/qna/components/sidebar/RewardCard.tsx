import React from 'react';
import { rewardCard as R } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface RewardCardProps {
  readonly className?: string;
}

const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

export const RewardCard: React.FC<RewardCardProps> = ({ className = '' }) => (
  <Card bordered={false} className={`p-space-lg ${className}`}>
    <div className="flex items-center justify-between mb-space-sm">
      <div className="flex items-center gap-space-xs">
        <Icon name="military_tech" className="text-tertiary text-[20px]" />
        <h3 className="font-headline-sm text-headline-sm text-ink font-semibold">{R.title}</h3>
      </div>
      <span className="px-2 py-0.5 rounded bg-surface-2 text-ink-subtle font-code-inline text-[11px]">{R.season}</span>
    </div>
    <div className="grid grid-cols-2 gap-space-xs mb-space-sm">
      {R.tiles.map((t) => (
        <div key={t.label} className="bg-surface-2 rounded-lg p-space-sm flex flex-col">
          <span className="text-caption text-ink-tertiary">{t.label}</span>
          <span className={`font-headline-md text-headline-md mt-1 font-semibold ${t.tone === 'secondary' ? 'text-secondary' : 'text-primary'}`}>{t.value}</span>
          <span className="text-[11px] text-ink-tertiary">{t.note}</span>
        </div>
      ))}
    </div>
    <div className="p-space-sm bg-surface-2 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-space-xs">
        <svg className="w-8 h-8" viewBox="0 0 36 36" aria-hidden="true">
          <path className="text-surface-container-highest" d={RING_PATH} fill="none" stroke="currentColor" strokeWidth="3.5" />
          <path className="text-primary-container" d={RING_PATH} fill="none" stroke="currentColor" strokeDasharray={`${R.levelPercent}, 100`} strokeLinecap="round" strokeWidth="3.5" />
          <text className="fill-ink text-[9px] font-code-inline" textAnchor="middle" x="18" y="20.5">
            {R.levelBadge}
          </text>
        </svg>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-ink">{R.levelTitle}</span>
          <span className="font-code-inline text-[11px] text-ink-tertiary">{R.levelProgress}</span>
        </div>
      </div>
      <Icon name="chevron_right" className="text-ink-tertiary text-[18px]" />
    </div>
  </Card>
);

export default RewardCard;
