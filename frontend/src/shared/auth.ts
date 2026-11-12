/**
 * Access Token 보관/삭제 (API_SPEC §1.2).
 * rememberMe 면 localStorage, 아니면 sessionStorage 에 보관하므로 두 곳을 모두 확인한다.
 * 모듈 간 이동은 전체 페이지 이동이라 로그인 화면도 <a href> 와 같은 방식으로 이동한다.
 */
const ACCESS_TOKEN_KEY = 'accessToken';

export const LOGIN_PATH = '/login';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

/** 서버 API 없이 토큰만 지우고 로그인 화면으로 이동한다. */
export function logout(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.location.assign(LOGIN_PATH);
}
