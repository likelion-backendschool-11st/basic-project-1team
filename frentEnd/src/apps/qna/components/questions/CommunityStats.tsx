import React from 'react';
import { Link } from 'react-router-dom';
import type { CommunityStat } from '../../data/types';

interface CommunityStatsProps {
  readonly stats: readonly CommunityStat[];
  readonly linkTo: string;
}

const valueTones = { secondary: 'text-secondary', ink: 'text-ink', primary: 'text-primary', tertiary: 'text-tertiary' } as const;

export const CommunityStats: React.FC<CommunityStatsProps> = ({ stats, linkTo }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs pt-space-xs border-t border-hairline">
    {stats.map((s) => (
      <div key={s.label} className="p-3 rounded-lg bg-surface-1 border border-hairline flex flex-col gap-0.5">
        <span className="font-caption text-caption text-ink-tertiary">{s.label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-headline-sm text-headline-sm font-bold ${valueTones[s.valueTone]}`}>{s.value}</span>
          {s.noteTone === 'link' ? (
            <Link to={linkTo} className="font-caption text-caption text-ink-subtle hover:text-ink underline">
              {s.note}
            </Link>
          ) : (
            <span className={`font-caption text-caption ${s.noteTone === 'secondary' ? 'text-secondary' : 'text-ink-subtle'}`}>{s.note}</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default CommunityStats;
