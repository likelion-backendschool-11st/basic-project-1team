import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAccessTokenRole, goToLogin, HOME_PATH, isLoggedIn } from '../../../../shared/auth';

interface RequireAdminProps {
  readonly children: ReactNode;
}

type Access = 'guest' | 'forbidden' | 'admin';

function checkAccess(): Access {
  if (!isLoggedIn()) return 'guest';
  return getAccessTokenRole() === 'ADMIN' ? 'admin' : 'forbidden';
}

/**
 * 관리자 화면 진입 제어 (REQ-ADMIN-001).
 * 비로그인이면 로그인 후 돌아오도록 로그인 화면으로, 관리자가 아니면 사용자 화면으로 보낸다.
 * 화면만 막는 것이고, 관리자 API 는 서버가 DB 의 권한으로 다시 검사한다 (API_SPEC 1.2).
 */
export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const access = checkAccess();

  useEffect(() => {
    if (access === 'guest') goToLogin();
    // 관리자 화면은 라우터가 따로라 사용자 화면으로는 전체 페이지 이동을 한다 (CODE_CONVENTION 2.1)
    if (access === 'forbidden') window.location.assign(HOME_PATH);
  }, [access]);

  return access === 'admin' ? <>{children}</> : null;
};
