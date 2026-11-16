import React from 'react';
import { TierBadge } from '../../../../shared/layout/TierBadge';
import { useMe } from '../../../../shared/me';
import {
  formatLevel,
  levelProgressPercent,
  POINT_REWARDS,
  TIER_LABELS,
} from '../../../../shared/points';
import { rewardCard as R } from '../../data/mockData';
import { formatCount } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface RewardCardProps {
  readonly className?: string;
}

const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

/** 질문 작성 화면의 포인트 보상 안내와 내 등급 (API_SPEC 11장). 관리자는 등급이 없어 보상 안내만 보인다 */
export const RewardCard: React.FC<RewardCardProps> = ({ className = '' }) => {
  const grade = useMe()?.grade;
  const hasLevel =
    grade !== undefined &&
    grade.level !== null &&
    grade.tier !== null &&
    grade.currentLevelPoints !== null;

  return (
    <Card bordered={false} className={`p-space-lg ${className}`}>
      <div className="flex items-center gap-space-xs mb-space-sm">
        <Icon name="military_tech" className="text-tertiary text-[20px]" />
        <h3 className="font-headline-sm text-headline-sm text-ink font-semibold">{R.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-space-xs mb-space-xs">
        {R.tiles.map((t) => (
          <div key={t.label} className="bg-surface-2 rounded-lg p-space-sm flex flex-col">
            <span className="text-caption text-ink-tertiary">{t.label}</span>
            <span
              className={`font-headline-md text-headline-md mt-1 font-semibold ${t.tone === 'secondary' ? 'text-secondary' : 'text-primary'}`}
            >
              {R.points(POINT_REWARDS[t.reward])}
            </span>
            <span className="text-[11px] text-ink-tertiary">{t.note}</span>
          </div>
        ))}
      </div>
      <p className="mb-space-sm text-[11px] text-ink-tertiary">
        {R.questionCreate(POINT_REWARDS.questionCreate, POINT_REWARDS.questionCreateDailyLimit)}
      </p>
      {hasLevel && (
        <div className="p-space-sm bg-surface-2 rounded-lg flex items-center gap-space-xs">
          <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" aria-hidden="true">
            <path
              className="text-surface-container-highest"
              d={RING_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-primary-container"
              d={RING_PATH}
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${levelProgressPercent(grade.points, grade.currentLevelPoints ?? 0, grade.nextLevelPoints)}, 100`}
              strokeLinecap="round"
              strokeWidth="3.5"
            />
            <text
              className="fill-ink text-[8px] font-code-inline"
              textAnchor="middle"
              x="18"
              y="20.5"
            >
              {formatLevel(grade.level ?? 0)}
            </text>
          </svg>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5 font-label-md text-label-md text-ink">
              {R.levelTitle(TIER_LABELS[grade.tier ?? 'unranked'])}
              <TierBadge level={grade.level} tier={grade.tier} />
            </span>
            <span className="font-code-inline text-[11px] text-ink-tertiary">
              {R.levelProgress(
                formatCount(grade.points),
                grade.nextLevelPoints === null ? null : formatCount(grade.nextLevelPoints),
              )}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
