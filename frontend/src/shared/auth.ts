/**
 * Access Token 보관/삭제 (API_SPEC §1.2).
 * rememberMe 면 localStorage, 아니면 sessionStorage 에 보관하므로 두 곳을 모두 확인한다.
 * 로그인·로그아웃 전후로는 화면 전체가 로그인 상태를 다시 읽도록 전체 페이지 이동을 한다.
 */
const ACCESS_TOKEN_KEY = 'accessToken';
const REDIRECT_PARAM = 'redirect';

export const LOGIN_PATH = '/login';
/** 비회원도 볼 수 있는 기본 화면 */
export const HOME_PATH = '/qna';

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

function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

/** 로그인 후 지금 보던 화면으로 돌아오도록 현재 경로를 넘긴다. */
export function goToLogin(): void {
  const current = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`${LOGIN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(current)}`);
}

/** 로그인 성공 후 이동할 경로. 외부 주소로 튀지 않도록 같은 사이트 경로만 허용한다. */
export function getRedirectPath(search: string): string {
  const redirect = new URLSearchParams(search).get(REDIRECT_PARAM);
  return redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : HOME_PATH;
}

/** 서버 API 없이 토큰만 지우고 로그인 화면으로 이동한다. */
export function logout(): void {
  clearAccessToken();
  window.location.assign(LOGIN_PATH);
}
