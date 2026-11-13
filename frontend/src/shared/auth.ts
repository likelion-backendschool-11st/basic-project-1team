/**
 * Access Token 보관/삭제 (API_SPEC §1.2).
 * rememberMe 면 localStorage, 아니면 sessionStorage 에 보관하므로 두 곳을 모두 확인한다.
 * 로그인·로그아웃 전후로는 화면 전체가 로그인 상태를 다시 읽도록 전체 페이지 이동(또는 새로고침)을 한다.
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const REDIRECT_PARAM = 'redirect';

export const LOGIN_PATH = '/login';
/** 비회원도 볼 수 있는 기본 화면 */
export const HOME_PATH = '/qna';
/** 관리자가 보던 화면 없이 로그인했을 때 가는 화면 (REQ-LOGIN-001) */
export const ADMIN_HOME_PATH = '/admin';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

export function saveAccessToken(token: string, rememberMe: boolean): void {
  clearAccessToken();
  (rememberMe ? localStorage : sessionStorage).setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/** 로그인 후 지금 보던 화면으로 돌아오도록 현재 경로를 넘긴다. */
export function goToLogin(): void {
  const current = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`${LOGIN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(current)}`);
}

/**
 * 로그인 성공 후 이동할 경로. 외부 주소로 튀지 않도록 같은 사이트 경로만 허용한다.
 * 보던 화면이 없으면 관리자는 관리자 화면, 그 외는 질문 목록으로 보낸다. (REQ-LOGIN-001)
 */
export function getRedirectPath(search: string, role: 'USER' | 'ADMIN'): string {
  const redirect = new URLSearchParams(search).get(REDIRECT_PARAM);
  if (redirect?.startsWith('/') && !redirect.startsWith('//')) return redirect;
  return role === 'ADMIN' ? ADMIN_HOME_PATH : HOME_PATH;
}

/**
 * 서버 API 없이 토큰만 지우고 지금 보던 화면을 다시 읽어 로그아웃 상태로 보여 준다. (REQ-LOGIN-007)
 * 로그인이 필요한 화면이었다면 RequireLogin 이 로그인 화면으로 보낸다.
 */
export function logout(): void {
  clearAccessToken();
  window.location.reload();
}

/** 토큰을 지우고 로그인 화면으로 이동한다. (비밀번호 변경 후, 관리자 화면 로그아웃) */
export function logoutToLogin(): void {
  clearAccessToken();
  window.location.assign(LOGIN_PATH);
}
