import { useEffect, useState } from 'react';
import { getUserProfile, type PublicProfile } from '../api/users';

/** 질문 작성자 카드의 공개 프로필. 탈퇴 회원(id null)이거나 불러오지 못하면 null */
export function useAuthorProfile(userId: number | null): PublicProfile | null {
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    if (userId === null) return undefined;
    let ignore = false;
    getUserProfile(userId)
      .then((next) => {
        if (!ignore) setProfile(next);
      })
      .catch(() => {
        if (!ignore) setProfile(null);
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  return userId !== null && profile?.id === userId ? profile : null;
}
