import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { isLoggedIn } from '../../../shared/auth';
import { MeContext, type MeSummary } from '../../../shared/me';
import { getMyProfile } from '../api/users';
import type { MyProfile } from '../data/mockData';

interface ProfileContextValue {
  /** 내 프로필. 비로그인이거나 아직 받지 못했으면 null */
  readonly profile: MyProfile | null;
  readonly loading: boolean;
  readonly errorMessage: string | null;
  /** 수정·사진 업로드 결과를 화면 전체(마이페이지·헤더)에 반영한다 */
  readonly setProfile: (profile: MyProfile) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export interface ProfileProviderProps {
  readonly children: ReactNode;
}

/**
 * 내 정보 (GET /api/users/me). 마이페이지·마이페이지 수정·헤더 프로필 메뉴가 함께 쓴다.
 * 로그인·로그아웃은 전체 페이지를 다시 읽으므로 처음 한 번만 부른다.
 */
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfileState] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(isLoggedIn);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) return undefined;
    let ignore = false;
    getMyProfile()
      .then((result) => {
        if (!ignore) setProfileState(result);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const setProfile = useCallback((next: MyProfile) => setProfileState(next), []);
  const value = useMemo(
    () => ({ profile, loading, errorMessage, setProfile }),
    [profile, loading, errorMessage, setProfile],
  );
  const me = useMemo<MeSummary | null>(
    () =>
      profile && {
        id: profile.id,
        nickname: profile.nickname,
        handle: `@${profile.username}`,
        avatarUrl: profile.profileImageUrl,
      },
    [profile],
  );
  return (
    <ProfileContext.Provider value={value}>
      <MeContext.Provider value={me}>{children}</MeContext.Provider>
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
