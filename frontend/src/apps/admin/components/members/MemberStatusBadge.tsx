import React from 'react';
import { membersCopy } from '../../data/mockData';
import { formatMonthDay } from '../../sanction';
import type { ActiveSanction, MemberStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface MemberStatusBadgeProps {
  /** 서버가 계산한 상태 (API_SPEC 10.2) */
  readonly status: MemberStatus;
  /** 정지 해제일을 보여 주려고 받는다 */
  readonly sanctions: readonly ActiveSanction[];
}

/** 탈퇴했으면 탈퇴, 정지가 있으면 정지(해제일 또는 영구), 글쓰기·댓글 제한만 있으면 제한, 없으면 활성. */
export const MemberStatusBadge: React.FC<MemberStatusBadgeProps> = ({ status, sanctions }) => {
  if (status === 'withdrawn') {
    return (
      <Badge tone="muted" dot>
        {membersCopy.statusLabels.withdrawn}
      </Badge>
    );
  }
  if (status === 'suspended') {
    const until = sanctions.find((s) => s.type === 'suspend')?.until;
    return (
      <Badge tone="danger" dot>
        {membersCopy.statusLabels.suspended}
        <span className="font-mono text-code-xs opacity-80">
          {until ? `~${formatMonthDay(until)}` : membersCopy.permanent}
        </span>
      </Badge>
    );
  }
  if (status === 'restricted') {
    return (
      <Badge tone="warning" dot>
        {membersCopy.statusLabels.restricted}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" dot className="[&>span:first-child]:text-secondary">
      {membersCopy.statusLabels.active}
    </Badge>
  );
};
