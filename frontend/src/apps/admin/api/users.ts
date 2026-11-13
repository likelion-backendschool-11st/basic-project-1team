import { apiPageRequest, apiRequest, toQueryString, type PageResult } from '../../../shared/api';
import type { Member, MemberDetail, MemberStatus, Role, SanctionType } from '../types';

export interface UserListQuery {
  readonly page: number;
  readonly size: number;
  /** 아이디 또는 닉네임 부분 일치 */
  readonly keyword?: string;
  /** 생략하면 탈퇴 회원을 뺀 전체 */
  readonly status?: MemberStatus;
  readonly role?: Role;
  readonly sort?: 'newest' | 'oldest';
}

/** GET /api/admin/users (API_SPEC 10.2) */
export function getUsers(query: UserListQuery): Promise<PageResult<Member>> {
  return apiPageRequest<Member>(`/admin/users${toQueryString({ ...query })}`);
}

/** GET /api/admin/users/:userId */
export function getUser(userId: number): Promise<MemberDetail> {
  return apiRequest<MemberDetail>(`/admin/users/${userId}`);
}

/** 요청 본문의 제재 키는 camelCase (API_SPEC 10.2 PATCH) */
const SANCTION_KEYS: Readonly<Record<SanctionType, string>> = {
  suspend: 'suspend',
  write_ban: 'writeBan',
  comment_ban: 'commentBan',
};

/**
 * PATCH /api/admin/users/:userId. 제재 1종류를 걸거나(days, null 이면 영구) 해제한다(release).
 * 응답은 바뀐 회원 상세다.
 */
export function updateUserSanction(
  userId: number,
  type: SanctionType,
  change: { readonly days: number | null } | 'release',
  reason: string,
): Promise<MemberDetail> {
  return apiRequest<MemberDetail>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: {
      sanctions: { [SANCTION_KEYS[type]]: change === 'release' ? null : { days: change.days } },
      reason,
    },
  });
}
