import { membersCopy, sanctionDurations, sanctionTypeLabels } from './data/mockData';
import type { ActiveSanction, Member, MemberStatus, SanctionDays } from './types';

/** API 의 status 계산 규칙과 같다 (API_SPEC 10.2). 탈퇴했으면 제재와 관계없이 withdrawn */
export function memberStatus(
  sanctions: readonly ActiveSanction[],
  withdrawn = false,
): MemberStatus {
  if (withdrawn) return 'withdrawn';
  if (sanctions.some((s) => s.type === 'suspend')) return 'suspended';
  return sanctions.length > 0 ? 'restricted' : 'active';
}

export const isWithdrawn = (member: Member) => member.withdrawnAt !== undefined;

/** "글쓰기 제한 · 12/01까지" / "이용 정지 · 영구" */
export function activeSanctionLabel(sanction: ActiveSanction): string {
  return `${sanctionTypeLabels[sanction.type]} · ${sanction.until ?? membersCopy.permanent}`;
}

export function durationLabel(days: SanctionDays): string {
  return sanctionDurations.find((d) => d.value === days)?.label ?? days;
}
