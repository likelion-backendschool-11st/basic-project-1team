const pad = (n: number) => String(n).padStart(2, '0');

/** 목록 작성일. 서버는 UTC로 주고 화면은 브라우저 시간으로 보여 준다 (API_SPEC 1.4). 예: 2026.11.13 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 상세·댓글 작성 시각. 예: 2026.11.13 14:32 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 오래된 글 기준. 마지막 수정 후 6개월 (REQ-BOARD-014) */
const OUTDATED_MONTHS = 6;

/** 마지막으로 고친 지 6개월이 지났는지. 기준은 프론트엔드가 정한다 (API_SPEC 7장) */
export function isOutdated(updatedAt: string, now: Date = new Date()): boolean {
  const limit = new Date(now);
  limit.setMonth(limit.getMonth() - OUTDATED_MONTHS);
  return new Date(updatedAt) < limit;
}

/** 전체 페이지 수. 글이 없어도 1페이지는 보여 준다 */
export function countPages(totalCount: number, size: number): number {
  return Math.max(1, Math.ceil(totalCount / size));
}
