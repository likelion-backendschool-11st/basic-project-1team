import React from 'react';
import { Icon } from '../ui/Icon';
import { mypageContent, type ActivityBadge } from '../../data/mockData';

const c = mypageContent.badges;

// 단계가 오를수록 진해진다 (Ⅰ 회색, Ⅱ 보라, Ⅲ 금색)
const LEVEL_STYLES: Readonly<Record<1 | 2 | 3, string>> = {
  1: 'bg-surface-3 text-ink-muted',
  2: 'bg-primary/15 text-primary',
  3: 'bg-semantic-warning/15 text-semantic-warning',
};

interface ActivityBadgesCardProps {
  readonly badges: readonly ActivityBadge[];
  /** 본인 프로필이면 못 딴 배지도 흐리게 보여 주고 다음 단계까지의 진행을 표시한다 */
  readonly isOwner: boolean;
}

/**
 * 활동 배지 (API_SPEC 2장 badges, REQ-MYPAGE-008). 관리자(배지 없음)는 그리지 않고,
 * 공개 프로필은 딴 배지가 없으면 그리지 않는다
 */
export const ActivityBadgesCard: React.FC<ActivityBadgesCardProps> = ({ badges, isOwner }) => {
  const earned = badges.filter((badge) => badge.level !== null);
  const shown = isOwner ? badges : earned;
  if (shown.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-label-md text-label-md text-ink-subtle">
          <Icon name={c.icon} className="text-[18px] text-primary" />
          {c.label}
        </span>
        <span className="font-label-code text-label-code text-ink-tertiary">
          {isOwner ? c.ownerCount(earned.length, badges.length) : c.publicCount(earned.length)}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {shown.map((badge) => {
          const item = c.items[badge.code];
          const goal = badge.level === null ? item.goals[0] : item.goals[badge.level - 1];
          const title =
            badge.level === null
              ? `${item.name} · ${item.condition(goal)}`
              : `${item.name} ${c.levels[badge.level - 1]} · ${item.condition(goal)}`;
          return (
            <li
              key={badge.code}
              title={title}
              aria-label={title}
              className={`flex items-center gap-2 rounded-lg bg-surface-3/60 p-2 ${
                badge.level === null ? 'opacity-45 grayscale' : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  badge.level === null
                    ? 'bg-surface-3 text-ink-tertiary'
                    : LEVEL_STYLES[badge.level]
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-label-md text-label-md text-ink">
                  {item.name}
                  {badge.level !== null && (
                    <span className="ml-1 font-semibold">{c.levels[badge.level - 1]}</span>
                  )}
                </span>
                {isOwner && badge.count !== undefined && (
                  <span className="truncate font-caption text-caption text-ink-tertiary">
                    {badge.nextGoal === null || badge.nextGoal === undefined
                      ? c.maxLevel
                      : c.progress(badge.count, badge.nextGoal, item.unit)}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
