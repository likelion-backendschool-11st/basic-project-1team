import { apiRequest } from '../../../shared/api';

/** GET /api/users/:userId 응답 중 Q&A 화면에서 쓰는 값 (API_SPEC 2장) */
export interface UserNickname {
  readonly nickname: string;
}

/** 회원 공개 프로필. 목록의 "○○ 님이 작성한 질문" 문구에 닉네임을 쓴다 */
export function getUserProfile(userId: number): Promise<UserNickname> {
  return apiRequest<UserNickname>(`/users/${userId}`);
}
