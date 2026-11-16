import React from 'react';
import { formatLevel, TIER_LABELS, TIER_STYLES, type UserLevel } from '../points';
import { Icon } from './Icon';

interface TierBadgeProps extends UserLevel {
  /** sm: 작성자 이름 옆 (아이콘 + Lv), md: 프로필 (아이콘 + 등급 이름 + Lv) */
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

/** 레벨·등급 배지 (API_SPEC 11.2). 관리자·탈퇴 회원(tier 가 null)은 그리지 않는다 */
export const TierBadge: React.FC<TierBadgeProps> = ({
  level,
  tier,
  size = 'sm',
  className = '',
}) => {
  if (tier === null || level === null) return null;

  const style = TIER_STYLES[tier];
  const label = `${TIER_LABELS[tier]} ${formatLevel(level)}`;

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-code-inline font-semibold ${style.chip} ${style.text} ${
        size === 'sm' ? 'px-1.5 py-px text-[10px]' : 'px-2.5 py-0.5 text-[12px]'
      } ${className}`}
    >
      <Icon name={style.icon} className={size === 'sm' ? 'text-[12px]' : 'text-[15px]'} />
      {size === 'md' && <span>{TIER_LABELS[tier]}</span>}
      <span>{formatLevel(level)}</span>
    </span>
  );
};
