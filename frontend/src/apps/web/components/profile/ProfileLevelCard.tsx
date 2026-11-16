import React from 'react';
import { TierBadge } from '../../../../shared/layout/TierBadge';
import { levelProgressPercent, type Tier } from '../../../../shared/points';
import { mypageContent } from '../../data/mockData';

const c = mypageContent.level;

interface ProfileLevelCardProps {
  readonly points: number;
  readonly level: number | null;
  readonly tier: Tier | null;
  /** 본인 프로필에서만 넘긴다. 다음 레벨까지 진행 막대를 그린다 (API_SPEC 2장) */
  readonly range?: {
    readonly currentLevelPoints: number | null;
    readonly nextLevelPoints: number | null;
  };
}

/** 프로필의 레벨·등급·포인트 (API_SPEC 11장). 관리자(tier 가 null)는 그리지 않는다 */
export const ProfileLevelCard: React.FC<ProfileLevelCardProps> = ({
  points,
  level,
  tier,
  range,
}) => {
  if (tier === null || level === null) return null;

  const current = range?.currentLevelPoints ?? null;
  const next = range?.nextLevelPoints ?? null;
  const percent = current === null ? null : levelProgressPercent(points, current, next);

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-label-md text-label-md text-ink-subtle">{c.label}</span>
        <span className="font-headline-sm text-headline-sm font-bold text-ink">
          {c.points(points.toLocaleString())}
        </span>
      </div>
      <TierBadge level={level} tier={tier} size="md" className="self-start" />
      {(tier === 'grandmaster' || tier === 'challenger') && (
        <p className="font-caption text-caption text-ink-tertiary">{c.ranked}</p>
      )}
      {percent !== null && (
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3"
          >
            <div
              className="h-full rounded-full bg-primary-container"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-label-code text-label-code text-ink-tertiary">
            {next === null ? c.maxLevel : c.toNext((next - points).toLocaleString())}
          </span>
        </div>
      )}
    </section>
  );
};
