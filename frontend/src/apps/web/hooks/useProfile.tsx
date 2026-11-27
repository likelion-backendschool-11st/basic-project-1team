import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { getErrorMessage, onSanctionError } from '../../../shared/api';
import { isLoggedIn } from '../../../shared/auth';
import { MeContext, MeRefreshContext, type MeSummary } from '../../../shared/me';
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

// 탭 전환·화면 이동이 몰려도 내 정보를 이 간격 안에 다시 부르지 않는다
const REFRESH_MIN_INTERVAL_MS = 10_000;

export interface ProfileProviderProps {
  readonly children: ReactNode;
}

/**
 * 내 정보 (GET /api/users/me). 마이페이지·마이페이지 수정·헤더 프로필 메뉴가 함께 쓴다.
 * 로그인·로그아웃은 전체 페이지를 다시 읽는다. 그 사이 관리자가 건 제재를 놓치지 않도록
 * 작성 화면에 들어올 때(useSanctionGuard), 탭으로 돌아올 때, 제재 에러를 받을 때 다시 받는다.
 */
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfileState] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(isLoggedIn);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastRequestedAt = useRef(0);
  // 늦게 온 이전 응답이 최신 값(다음 응답, 수정 결과)을 덮어쓰지 않게 요청마다 번호를 붙인다
  const latestRequest = useRef(0);

  const loadProfile = useCallback(() => {
    if (!isLoggedIn()) return;
    lastRequestedAt.current = Date.now();
    const request = ++latestRequest.current;
    getMyProfile()
      .then((next) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(null);
        // 하루 첫 접속 보상은 그날 처음 받은 응답에만 온다. 다시 받은 응답이 보상 모달을 닫지 않게 한다
        setProfileState((prev) =>
          prev && next.visitReward === null ? { ...next, visitReward: prev.visitReward } : next,
        );
      })
      // 다시 받다가 실패하면 갖고 있던 정보를 그대로 쓴다. 등록은 서버가 403 으로 한 번 더 막는다
      .catch((error: unknown) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const refreshProfile = useCallback(() => {
    if (Date.now() - lastRequestedAt.current < REFRESH_MIN_INTERVAL_MS) return;
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    refreshProfile();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refreshProfile();
    };
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('focus', refreshIfVisible);
    // 서버가 제재로 거절했으면 방금 받은 정보도 낡은 것이라 간격과 상관없이 다시 받는다
    const unsubscribe = onSanctionError(loadProfile);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('focus', refreshIfVisible);
      unsubscribe();
    };
  }, [loadProfile, refreshProfile]);

  const setProfile = useCallback((next: MyProfile) => {
    latestRequest.current += 1;
    setProfileState(next);
  }, []);
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
        // ADMIN 은 권한을 따로 받지 않아도 같은 범위로 수정·삭제할 수 있다 (API_SPEC 1.2)
        canManageContent:
          profile.role === 'ADMIN' || profile.permissions.includes('content_manage'),
        sanctions: profile.sanctions,
        visitReward: profile.visitReward,
        grade: {
          points: profile.points,
          level: profile.level,
          tier: profile.tier,
          currentLevelPoints: profile.currentLevelPoints,
          nextLevelPoints: profile.nextLevelPoints,
        },
      },
    [profile],
  );
  return (
    <ProfileContext.Provider value={value}>
      <MeContext.Provider value={me}>
        <MeRefreshContext.Provider value={refreshProfile}>{children}</MeRefreshContext.Provider>
      </MeContext.Provider>
    </ProfileContext.Provider>
  );
};

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
