import { memberDetailCopy, membersCopy, sanctionTypeLabels } from './data/mockData';
import type { ActiveSanction, SanctionDays, SanctionRecord } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-14" (보는 사람의 현지 날짜) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-11-14 11:00" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "12/01" */
export function formatMonthDay(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

/** "글쓰기 제한 · 12/01까지" / "이용 정지 · 영구" */
export function activeSanctionLabel(sanction: ActiveSanction): string {
  const until = sanction.until
    ? `${formatMonthDay(sanction.until)}${memberDetailCopy.untilSuffix}`
    : membersCopy.permanent;
  return `${sanctionTypeLabels[sanction.type]} · ${until}`;
}

/** "글쓰기 제한 7일" / "이용 정지 영구" / "댓글 제한 해제" */
export function sanctionRecordLabel(record: SanctionRecord): string {
  const label = sanctionTypeLabels[record.type];
  if (record.action === 'release') return `${label} ${memberDetailCopy.releasedSuffix}`;
  return `${label} ${record.days === null ? membersCopy.permanent : `${record.days}일`}`;
}

/** 화면의 기간 선택값을 API 의 days 로 바꾼다 ('permanent' → null) */
export const toSanctionDays = (days: SanctionDays): number | null =>
  days === 'permanent' ? null : Number(days);
