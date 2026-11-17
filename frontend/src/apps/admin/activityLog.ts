import type { LogTargetType } from './types';

/**
 * 로그 대상으로 가는 관리자 화면 경로. 서버는 targetType·targetId 만 주고 링크는 화면에서 만든다 (API_SPEC 10.8).
 * 회원만 상세 화면이 있고, 나머지는 각 관리 목록으로 보낸다.
 */
export function logTargetPath(targetType: LogTargetType, targetId: number): string {
  switch (targetType) {
    case 'user':
      return `/members/${targetId}`;
    case 'question':
    case 'answer':
      return '/qna';
    case 'post':
    case 'comment':
      return '/board';
    case 'tag':
      return '/tags';
    case 'report':
      return '/reports';
    case 'notice':
      return '/notices';
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "11-16 15:20" (보는 사람의 현지 시간) */
export function formatLogTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
