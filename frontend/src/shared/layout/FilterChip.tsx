import React from 'react';
import { Icon } from './Icon';
import { SiteLink } from './SiteLink';

interface FilterChipProps {
  /** 예: "레전드게이머 님이 작성한 질문" */
  readonly label: string;
  /** 조건을 뺀 목록 주소 */
  readonly clearHref: string;
  readonly clearLabel: string;
  readonly className?: string;
}

/** 목록에 걸린 회원 검색 조건 표시. 회원 프로필의 "전체 보기"로 들어오면 보이고, ✕ 로 조건을 푼다. */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  clearHref,
  clearLabel,
  className = '',
}) => (
  <div className={`flex ${className}`}>
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-container/40 bg-primary-container/10 py-1 pl-3 pr-1 text-sm text-ink">
      <Icon name="person_search" className="text-[16px] text-primary" />
      {label}
      <SiteLink
        href={clearHref}
        className="flex items-center rounded-full p-0.5 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <span className="sr-only">{clearLabel}</span>
        <Icon name="close" className="text-[16px]" />
      </SiteLink>
    </span>
  </div>
);
