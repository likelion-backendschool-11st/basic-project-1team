import { apiRequest } from '../../../shared/api';
import type { Role } from '../types';

/**
 * 관리자 사이트 로그인. 사용자 사이트와 같은 로그인 API 를 쓴다 (POST /api/auth/login, API_SPEC 2장).
 * 관리자 앱은 다른 앱(apps/web)을 import 하지 않으므로 호출 함수만 따로 둔다 (CODE_CONVENTION 2.1)
 */
export interface LoginRequest {
  readonly loginId: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly user: {
    readonly id: number;
    readonly username: string;
    readonly nickname: string;
    readonly role: Role;
  };
}

export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body });
}
