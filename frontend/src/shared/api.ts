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

const NETWORK_ERROR = new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.');

/**
 * 모든 API 호출이 거치는 공통 함수 (CODE_CONVENTION 12.2).
 * 토큰 헤더를 붙이고, 성공이면 `data`만 돌려주고, 실패면 ApiError 를 던진다.
 * 토큰을 보냈는데 401 이면 만료·위조로 보고 토큰을 지운 뒤 로그인 화면으로 보낸다 (API_SPEC 1.2).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
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
  if (response.status === 204) return undefined as T;

  const json = await response.json().catch(() => null);
  if (response.ok && json?.success) return json.data as T;

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
