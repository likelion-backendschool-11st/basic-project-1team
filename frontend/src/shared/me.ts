import { createContext, useContext } from 'react';
import { isLoggedIn } from './auth';
import type { MyLevel } from './points';
import type { MySanction } from './sanctions';

/** 헤더 프로필 메뉴에 보여 줄 내 정보 (GET /api/users/me 의 일부, API_SPEC 2장) */
export interface MeSummary {
  readonly id: number;
  readonly nickname: string;
  /** 아이디 (`@` 포함) */
  readonly handle: string;
  readonly avatarUrl: string | null;
  /** 게시물·댓글 관리 권한(content_manage)이 있거나 ADMIN 임 (API_SPEC 1.2) */
  readonly canManageContent: boolean;
  /** 지금 걸려 있는 내 제재 (API_SPEC 2장). 작성·댓글 버튼을 막는 데 쓴다 (shared/sanctions) */
  readonly sanctions: readonly MySanction[];
  /** 이번에 받은 하루 첫 접속 포인트. 있으면 보상 모달을 띄운다 (API_SPEC 2장 visitReward) */
  readonly visitReward: number | null;
  /** 포인트·레벨·등급 (API_SPEC 11장). 질문 작성 화면의 보상 카드에 쓴다 */
  readonly grade: MyLevel;
}

/** 로그인한 회원 정보. 회원 화면의 ProfileProvider 가 채운다 (마이페이지에서 고치면 헤더도 바뀐다) */
export const MeContext = createContext<MeSummary | null>(null);

export const useMe = (): MeSummary | null => useContext(MeContext);

/**
 * 내 정보를 서버에서 다시 받는 함수. 회원 화면의 ProfileProvider 가 채운다.
 * 화면을 연 뒤 관리자가 건 제재처럼, 처음 받은 값이 낡았을 수 있는 정보를 다시 맞출 때 쓴다
 */
export const MeRefreshContext = createContext<() => void>(() => undefined);

export const useRefreshMe = (): (() => void) => useContext(MeRefreshContext);

/**
 * 작성자가 아니어도 질문·답변·게시글을 수정·삭제하고 댓글을 삭제할 수 있는지 (API_SPEC 1.2, REQ-ADMIN-004).
 * 로그인했는데 내 정보를 아직 받지 못했으면 null 이다. 수정 화면은 이때 본인 글이 아니라고 돌려보내지 않고 기다린다.
 */
export const useCanManageContent = (): boolean | null => {
  const me = useMe();
  if (me) return me.canManageContent;
  return isLoggedIn() ? null : false;
};
