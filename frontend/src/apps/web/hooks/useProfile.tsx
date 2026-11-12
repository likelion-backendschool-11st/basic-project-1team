import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MeContext, type MeSummary } from '../../../shared/me';
import { initialProfile } from '../data/mockData';
import type { UserProfile } from '../data/mockData';

interface ProfileContextValue {
  readonly profile: UserProfile;
  readonly updateProfile: (patch: Partial<UserProfile>) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export interface ProfileProviderProps {
  readonly children: ReactNode;
}

/** Mock session store so edits on /mypage/edit show up on /mypage and in the header profile menu. */
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);
  const value = useMemo(() => ({ profile, updateProfile }), [profile, updateProfile]);
  // TODO: GET /api/users/me 로 바꾼다
  const me = useMemo<MeSummary>(
    () => ({
      id: profile.id,
      nickname: profile.nickname,
      handle: profile.handle,
      avatarUrl: profile.avatarUrl,
    }),
    [profile.id, profile.nickname, profile.handle, profile.avatarUrl],
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
