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

/** 페이지 번호 목록. 글이 없어도 1페이지는 보여 준다 */
export function pageNumbers(totalCount: number, size: number): number[] {
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}
