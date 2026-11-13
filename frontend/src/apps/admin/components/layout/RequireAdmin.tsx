import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, getErrorMessage } from '../../../../shared/api';
import { isLoggedIn } from '../../../../shared/auth';
import { goToAdminLogin, logoutToAdminLogin } from '../../adminSite';
import { getMe, type AdminMe } from '../../api/me';
import { adminLoginCopy } from '../../data/mockData';
import { AdminMeContext } from '../../hooks/useAdminMe';
import { Button } from '../ui/Button';

interface RequireAdminProps {
  readonly children: ReactNode;
}

type Access =
  | { readonly kind: 'checking' }
  | { readonly kind: 'admin'; readonly me: AdminMe }
  | { readonly kind: 'forbidden' }
  | { readonly kind: 'error'; readonly message: string };

/**
 * 관리자 화면 진입 제어 (REQ-ADMIN-001).
 * 관리자 사이트는 따로 로그인하므로 비로그인이면 관리자 로그인 화면으로 보낸다.
 * 권한은 GET /api/users/me 의 role(서버 DB 값)로 판단하고, 관리자가 아니면 계정을 바꾸도록 안내한다.
 * 받은 내 정보는 AdminMeContext 로 안쪽 화면(상단바 운영자 이름)에 넘긴다.
 * 화면만 막는 것이고, 관리자 API 는 서버가 요청마다 다시 검사한다 (API_SPEC 1.2).
 */
export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const [access, setAccess] = useState<Access>({ kind: 'checking' });

  useEffect(() => {
    if (!isLoggedIn()) {
      goToAdminLogin();
      return undefined;
    }
    let ignore = false;
    getMe()
      .then((me) => {
        if (!ignore) setAccess(me.role === 'ADMIN' ? { kind: 'admin', me } : { kind: 'forbidden' });
      })
      .catch((error: unknown) => {
        // 401 은 공통 함수가 로그인 화면(/login → 관리자 사이트 /admin/login)으로 보냈다
        if (ignore || (error instanceof ApiError && error.status === 401)) return;
        setAccess({ kind: 'error', message: getErrorMessage(error) });
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (access.kind === 'admin') {
    return <AdminMeContext.Provider value={access.me}>{children}</AdminMeContext.Provider>;
  }
  if (access.kind === 'checking') return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <p role="alert" className="text-body-lg text-error">
        {access.kind === 'forbidden' ? adminLoginCopy.forbidden : access.message}
      </p>
      {access.kind === 'forbidden' && (
        <Button variant="secondary" onClick={logoutToAdminLogin}>
          {adminLoginCopy.switchAccount}
        </Button>
      )}
    </div>
  );
};
