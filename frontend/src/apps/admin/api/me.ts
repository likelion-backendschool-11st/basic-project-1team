import { apiRequest } from '../../../shared/api';
import type { Role } from '../types';

/** 관리자 화면 진입 판단과 상단바 표시에 쓰는 내 정보 (GET /api/users/me 응답의 일부, API_SPEC 2장) */
export interface AdminMe {
  readonly id: number;
  readonly role: Role;
  readonly username: string;
  readonly nickname: string;
}

/**
 * GET /api/users/me. 서버가 DB 의 권한으로 알려 준다.
 * 토큰이 만료·위조됐으면(401) 공통 함수가 토큰을 지우고 로그인 화면으로 보낸다.
 */
export function getMe(): Promise<AdminMe> {
  return apiRequest<AdminMe>('/users/me');
}
