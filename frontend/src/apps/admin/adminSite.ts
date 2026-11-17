import { clearAccessToken } from '../../shared/auth';

/**
 * 관리자 사이트 주소 규칙. 관리자 사이트는 사용자 사이트와 따로 실행되고(admin.html) 로그인도 따로 한다.
 * 화면 주소는 모두 /admin 아래다 (라우터 basename).
 */
const ADMIN_PREFIX = '/admin';
const REDIRECT_PARAM = 'redirect';

/** 관리자 로그인 화면 (전체 경로) */
export const ADMIN_LOGIN_PATH = `${ADMIN_PREFIX}/login`;

/** 사용자 사이트 주소. 배포 때는 VITE_SITE_URL 로 정한다 (개발 기본값: npm run dev) */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173';

/** 로그인 후 지금 보던 관리자 화면으로 돌아오도록 현재 경로를 넘긴다 */
export function goToAdminLogin(): void {
  const current = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`${ADMIN_LOGIN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(current)}`);
}

/** 관리자 상단바 로그아웃: 토큰을 지우고 관리자 로그인 화면으로 이동한다 (REQ-LOGIN-007) */
export function logoutToAdminLogin(): void {
  clearAccessToken();
  window.location.assign(ADMIN_LOGIN_PATH);
}

/**
 * 로그인 성공 후 이동할 경로. 다른 사이트로 튀지 않도록 관리자 화면 경로(/admin...)만 허용하고,
 * 없으면 대시보드로 보낸다.
 */
export function getAdminRedirectPath(search: string): string {
  const redirect = new URLSearchParams(search).get(REDIRECT_PARAM);
  const isAdminPath =
    redirect !== null &&
    (redirect === ADMIN_PREFIX || redirect.startsWith(`${ADMIN_PREFIX}/`)) &&
    !redirect.startsWith(ADMIN_LOGIN_PATH);
  return isAdminPath ? redirect : ADMIN_PREFIX;
}

/** 사용자 사이트의 같은 경로 전체 주소 (예: /qna/questions/3 → http://localhost:5173/qna/questions/3) */
export const toSiteUrl = (path: string): string => `${SITE_URL}${path}`;
