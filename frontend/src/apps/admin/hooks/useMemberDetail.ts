import { useEffect, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { getUser } from '../api/users';
import { ui } from '../data/mockData';
import type { MemberDetail } from '../types';

export interface MemberDetailState {
  readonly member: MemberDetail | null;
  readonly loading: boolean;
  /** 없는 회원(404 USER_NOT_FOUND)이거나 주소의 id 가 숫자가 아님 */
  readonly notFound: boolean;
  readonly errorMessage: string | null;
  /** 제재·해제 응답(바뀐 회원 상세)으로 화면을 바로 갱신한다 */
  readonly replace: (member: MemberDetail) => void;
}

/** 회원 상세 (API_SPEC 10.2 GET /api/admin/users/:userId) */
export function useMemberDetail(userId: number | null): MemberDetailState {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(userId !== null);
  const [notFound, setNotFound] = useState(userId === null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userId === null) return undefined;
    let ignore = false;
    setLoading(true);
    getUser(userId)
      .then((result) => {
        if (ignore) return;
        setMember(result);
        setNotFound(false);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setMember(null);
        if (error instanceof ApiError && error.code === 'USER_NOT_FOUND') {
          setNotFound(true);
        } else {
          setErrorMessage(error instanceof ApiError ? error.message : ui.loadError);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  return { member, loading, notFound, errorMessage, replace: setMember };
}
