import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { goToLogin, isLoggedIn } from './auth';

export interface RequireLoginProps {
  readonly children: ReactNode;
}

/** 작성·수정·신고처럼 회원만 쓰는 화면. 주소로 바로 들어온 비회원은 로그인 화면으로 보낸다. */
export function RequireLogin({ children }: RequireLoginProps) {
  const loggedIn = isLoggedIn();
  useEffect(() => {
    if (!loggedIn) goToLogin();
  }, [loggedIn]);
  return loggedIn ? <>{children}</> : null;
}
