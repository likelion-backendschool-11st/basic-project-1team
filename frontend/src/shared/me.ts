import { createContext, useContext } from 'react';

/** 헤더 프로필 메뉴에 보여 줄 내 정보 (GET /api/users/me 의 일부, API_SPEC 2장) */
export interface MeSummary {
  readonly id: number;
  readonly nickname: string;
  /** 아이디 (`@` 포함) */
  readonly handle: string;
  readonly avatarUrl: string | null;
}

/** 로그인한 회원 정보. 회원 화면의 ProfileProvider 가 채운다 (마이페이지에서 고치면 헤더도 바뀐다) */
export const MeContext = createContext<MeSummary | null>(null);

export const useMe = (): MeSummary | null => useContext(MeContext);
