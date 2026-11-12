import { membersCopy, sanctionDurations, sanctionTypeLabels } from './data/mockData';
import type { ActiveSanction, MemberStatus, SanctionDays } from './types';

/** API 의 status 계산 규칙과 같다 (API_SPEC 10.2). */
export function memberStatus(sanctions: readonly ActiveSanction[]): MemberStatus {
  if (sanctions.some((s) => s.type === 'suspend')) return 'suspended';
  return sanctions.length > 0 ? 'restricted' : 'active';
}

/** "글쓰기 제한 · 12/01까지" / "이용 정지 · 영구" */
export function activeSanctionLabel(sanction: ActiveSanction): string {
  return `${sanctionTypeLabels[sanction.type]} · ${sanction.until ?? membersCopy.permanent}`;
}

export function durationLabel(days: SanctionDays): string {
  return sanctionDurations.find((d) => d.value === days)?.label ?? days;
}
