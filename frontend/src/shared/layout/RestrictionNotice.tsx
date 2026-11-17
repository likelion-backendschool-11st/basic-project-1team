import React from 'react';
import { Icon } from './Icon';

interface RestrictionNoticeProps {
  /** restrictionFor() 가 준 안내. null 이면 그리지 않는다 */
  readonly message: string | null;
  readonly className?: string;
}

/** 제재 중인 회원에게 작성이 막혔다는 것과 해제일을 알린다 (API_SPEC 1.2) */
export const RestrictionNotice: React.FC<RestrictionNoticeProps> = ({ message, className = '' }) =>
  message ? (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg border border-semantic-danger-border bg-semantic-danger-surface px-4 py-3 text-sm text-semantic-danger ${className}`}
    >
      <Icon name="block" className="text-[18px]" />
      <span>{message} 작성·수정할 수 없습니다.</span>
    </div>
  ) : null;
