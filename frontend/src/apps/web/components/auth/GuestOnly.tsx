import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getSafeRedirectPath, HOME_PATH, isLoggedIn } from '../../../../shared/auth';
import { ROUTES } from '../../data/mockData';

/** 비회원만 쓰는 화면. redirect 가 이 화면들이면 다시 여기로 돌아와 이동이 끝나지 않으므로 홈으로 보낸다 */
const GUEST_ONLY_PATHS: readonly string[] = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.findId,
  ROUTES.findPassword,
];

function getLoggedInTarget(search: string): string {
  const redirect = getSafeRedirectPath(search);
  if (!redirect) return HOME_PATH;
  const { pathname } = new URL(redirect, window.location.origin);
  return GUEST_ONLY_PATHS.includes(pathname) ? HOME_PATH : redirect;
}

interface GuestOnlyProps {
  readonly children: ReactNode;
}

/**
 * 로그인·회원가입·아이디/비밀번호 찾기처럼 비회원만 쓰는 화면.
 * 이미 로그인했으면 redirect 로 넘어온 화면(없으면 질문 목록)으로 보낸다.
 * redirect 가 관리자 화면(/admin)일 수 있어 라우터 이동이 아니라 전체 페이지 이동을 한다.
 */
export const GuestOnly: React.FC<GuestOnlyProps> = ({ children }) => {
  const { search } = useLocation();
  const loggedIn = isLoggedIn();
  useEffect(() => {
    if (loggedIn) window.location.replace(getLoggedInTarget(search));
  }, [loggedIn, search]);
  return loggedIn ? null : <>{children}</>;
};
