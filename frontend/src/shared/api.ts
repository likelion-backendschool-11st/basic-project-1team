import { clearAccessToken, getAccessToken, goToLogin } from './auth';

/** 실패 응답 `{ success: false, error: { code, message } }` (API_SPEC 1.3) */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface ApiRequestOptions {
  readonly method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
}

/** 목록 응답의 `meta` (API_SPEC 1.5) */
export interface PageMeta {
  readonly page: number;
  readonly size: number;
  readonly totalCount: number;
}

/** M: 신고 목록의 statusCounts 처럼 meta 에 값이 더 있는 API 는 PageMeta 를 넓힌 타입을 넘긴다 */
export interface PageResult<T, M extends PageMeta = PageMeta> {
  readonly items: readonly T[];
  readonly meta: M;
}

const NETWORK_ERROR = new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.');

/** 화면에 보여 줄 오류 문구. 서버가 준 message를 그대로 쓰고, ApiError가 아니면 공통 문구 */
export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '서버 오류가 발생했습니다.';
}

/** undefined·빈 문자열은 빼고 `?a=1&b=2`를 만든다. 넣을 값이 없으면 빈 문자열 */
export function toQueryString(
  params: Readonly<Record<string, string | number | undefined>>,
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * 모든 API 호출이 거치는 공통 함수 (CODE_CONVENTION 12.2).
 * 토큰 헤더를 붙이고, 성공이면 `data`만 돌려주고, 실패면 ApiError 를 던진다.
 * 토큰을 보냈는데 401 이면 만료·위조로 보고 토큰을 지운 뒤 로그인 화면으로 보낸다 (API_SPEC 1.2).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const json = await send(path, options);
  return json?.data as T;
}

/** 페이지네이션 목록 조회. `data`와 `meta`를 함께 돌려준다 (API_SPEC 1.5) */
export async function apiPageRequest<T, M extends PageMeta = PageMeta>(
  path: string,
): Promise<PageResult<T, M>> {
  const json = await send(path, {});
  return { items: json.data as T[], meta: json.meta as M };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 응답 JSON 은 호출하는 쪽에서 타입을 정한다
async function send(path: string, options: ApiRequestOptions): Promise<any> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw NETWORK_ERROR;
  }

  // 삭제 성공은 204 (body 없음)
  if (response.status === 204) return undefined;

  const json = await response.json().catch(() => null);
  if (response.ok && json?.success) return json;

  const error = new ApiError(
    response.status,
    json?.error?.code ?? 'INTERNAL_SERVER_ERROR',
    json?.error?.message ?? '서버 오류가 발생했습니다.',
  );
  if (error.status === 401 && token) {
    clearAccessToken();
    goToLogin();
  }
  throw error;
}
