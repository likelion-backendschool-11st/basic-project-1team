import { useEffect, useState } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { getUserProfile } from '../api/users';
import { mypageContent, type PublicProfile } from '../data/mockData';

/** 회원 공개 프로필 (GET /api/users/:userId). 탈퇴했거나 없는 회원이면 404 */
export function useUserProfile(userId: number) {
  const isValidId = Number.isInteger(userId) && userId > 0;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(isValidId);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isValidId ? null : mypageContent.notFound,
  );

  useEffect(() => {
    if (!isValidId) return undefined;
    // 다른 회원으로 옮기면, 늦게 온 이전 회원의 응답이 새 화면을 덮어쓰지 않게 한다
    let ignore = false;
    setProfile(null);
    setLoading(true);
    setErrorMessage(null);
    getUserProfile(userId)
      .then((result) => {
        if (!ignore) setProfile(result);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        setErrorMessage(
          error instanceof ApiError && error.code === 'USER_NOT_FOUND'
            ? mypageContent.notFound
            : getErrorMessage(error),
        );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [userId, isValidId]);

  return { profile, loading, errorMessage };
}
