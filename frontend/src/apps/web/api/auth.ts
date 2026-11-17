import { apiRequest } from '../../../shared/api';

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
    readonly role: 'USER' | 'ADMIN';
  };
}

/** POST /api/auth/login (API_SPEC 2장) */
export function login(body: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body });
}

export interface SignupRequest {
  readonly name: string;
  readonly username: string;
  readonly nickname: string;
  readonly password: string;
  readonly email: string;
}

export interface SignupResponse {
  readonly id: number;
  readonly username: string;
  readonly nickname: string;
}

/** POST /api/auth/signup (API_SPEC 2장) */
export function signup(body: SignupRequest): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/auth/signup', { method: 'POST', body });
}

/** POST /api/auth/find-username (API_SPEC 2장). 아이디는 일부를 가려서 온다 */
export function findUsername(body: {
  readonly name: string;
  readonly email: string;
}): Promise<{ readonly maskedUsername: string }> {
  return apiRequest('/auth/find-username', { method: 'POST', body });
}

export interface PasswordResetToken {
  readonly resetToken: string;
  /** 초 단위 (600) */
  readonly expiresIn: number;
}

/** POST /api/auth/password-reset/verify (API_SPEC 2장). 본인 확인 후 재설정 토큰을 받는다 */
export function verifyPasswordReset(body: {
  readonly username: string;
  readonly email: string;
}): Promise<PasswordResetToken> {
  return apiRequest<PasswordResetToken>('/auth/password-reset/verify', { method: 'POST', body });
}

/** POST /api/auth/password-reset (API_SPEC 2장). 성공은 204 */
export function resetPassword(body: {
  readonly resetToken: string;
  readonly newPassword: string;
}): Promise<void> {
  return apiRequest<void>('/auth/password-reset', { method: 'POST', body });
}
