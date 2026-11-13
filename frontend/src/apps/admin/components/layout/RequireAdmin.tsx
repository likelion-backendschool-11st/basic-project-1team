import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, getErrorMessage } from '../../../../shared/api';
import { goToLogin, HOME_PATH, isLoggedIn } from '../../../../shared/auth';
import { getMyRole } from '../../api/me';

interface RequireAdminProps {
  readonly children: ReactNode;
}

type Access =
  | { readonly kind: 'checking' }
  | { readonly kind: 'admin' }
  | { readonly kind: 'error'; readonly message: string };

/**
 * 관리자 화면 진입 제어 (REQ-ADMIN-001).
 * 비로그인이면 로그인 후 돌아오도록 로그인 화면으로, 관리자가 아니면 사용자 화면으로 보낸다.
 * 권한은 토큰 내용이 아니라 GET /api/users/me 의 role(서버 DB 값)로 판단한다.
 * 화면만 막는 것이고, 관리자 API 는 서버가 요청마다 다시 검사한다 (API_SPEC 1.2).
 */
export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const [access, setAccess] = useState<Access>({ kind: 'checking' });

  useEffect(() => {
    if (!isLoggedIn()) {
      goToLogin();
      return undefined;
    }
    let ignore = false;
    getMyRole()
      .then((me) => {
        if (ignore) return;
        if (me.role === 'ADMIN') {
          setAccess({ kind: 'admin' });
          return;
        }
        // 관리자 화면은 라우터가 따로라 사용자 화면으로는 전체 페이지 이동을 한다 (CODE_CONVENTION 2.1)
        window.location.assign(HOME_PATH);
      })
      .catch((error: unknown) => {
        // 401 은 공통 함수가 이미 로그인 화면으로 보냈다
        if (ignore || (error instanceof ApiError && error.status === 401)) return;
        setAccess({ kind: 'error', message: getErrorMessage(error) });
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (access.kind === 'admin') return <>{children}</>;
  if (access.kind === 'error') {
    return (
      <p role="alert" className="p-10 text-center text-body-md text-error">
        {access.message}
      </p>
    );
  }
  return null;
};
