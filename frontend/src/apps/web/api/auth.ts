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
