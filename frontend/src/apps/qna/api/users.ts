import { apiRequest } from '../../../shared/api';
import type { Tier } from '../../../shared/points';

/** GET /api/users/:userId 응답 중 Q&A 화면에서 쓰는 공개 항목 (API_SPEC 2장) */
export interface PublicProfile {
  readonly id: number;
  readonly nickname: string;
  readonly profileImageUrl: string | null;
  /** 소개글 HTML. 없으면 null */
  readonly bio: string | null;
  readonly questionCount: number;
  readonly answerCount: number;
  /** 포인트·레벨·등급 (API_SPEC 11장). 관리자는 points 0, level·tier null */
  readonly points: number;
  readonly level: number | null;
  readonly tier: Tier | null;
  readonly createdAt: string;
}

/** 회원 공개 프로필. 목록의 회원 조건 문구, 질문 상세의 작성자 카드에 쓴다 */
export function getUserProfile(userId: number): Promise<PublicProfile> {
  return apiRequest<PublicProfile>(`/users/${userId}`);
}
