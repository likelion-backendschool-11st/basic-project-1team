import { useEffect, useState } from 'react';
import { authorFilterCopy } from '../../../shared/site';
import { getUserProfile } from '../api/users';

/**
 * "○○ 님이 작성한 질문" 문구에 쓰는 회원 닉네임 (GET /api/users/:userId).
 * 불러오기 전에는 null, 실패하면(탈퇴 등) '회원 #id' 로 보여 준다.
 */
export function useAuthorFilterName(userId: number | null): string | null {
  const [name, setName] = useState<{ readonly userId: number; readonly value: string } | null>(
    null,
  );

  useEffect(() => {
    if (userId === null) return undefined;
    let ignore = false;
    getUserProfile(userId)
      .then((profile) => {
        if (!ignore) setName({ userId, value: profile.nickname });
      })
      .catch(() => {
        if (!ignore) setName({ userId, value: authorFilterCopy.unknownUser(userId) });
      });
    return () => {
      ignore = true;
    };
  }, [userId]);

  return userId !== null && name?.userId === userId ? name.value : null;
}
