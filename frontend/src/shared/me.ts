import { createContext, useContext } from 'react';
import { isLoggedIn } from './auth';

/** 헤더 프로필 메뉴에 보여 줄 내 정보 (GET /api/users/me 의 일부, API_SPEC 2장) */
export interface MeSummary {
  readonly id: number;
  readonly nickname: string;
  /** 아이디 (`@` 포함) */
  readonly handle: string;
  readonly avatarUrl: string | null;
  /** 관리자가 준 게시물·댓글 관리 권한(content_manage)이 있음 (API_SPEC 1.2) */
  readonly canManageContent: boolean;
}

/** 로그인한 회원 정보. 회원 화면의 ProfileProvider 가 채운다 (마이페이지에서 고치면 헤더도 바뀐다) */
export const MeContext = createContext<MeSummary | null>(null);

export const useMe = (): MeSummary | null => useContext(MeContext);

/**
 * 작성자가 아니어도 질문·답변·게시글을 수정·삭제하고 댓글을 삭제할 수 있는지 (API_SPEC 1.2, REQ-ADMIN-004).
 * 로그인했는데 내 정보를 아직 받지 못했으면 null 이다. 수정 화면은 이때 본인 글이 아니라고 돌려보내지 않고 기다린다.
 */
export const useCanManageContent = (): boolean | null => {
  const me = useMe();
  if (me) return me.canManageContent;
  return isLoggedIn() ? null : false;
};
