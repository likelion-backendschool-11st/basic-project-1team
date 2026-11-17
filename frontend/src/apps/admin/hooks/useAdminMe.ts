import { createContext, useContext } from 'react';
import type { AdminMe } from '../api/me';

/**
 * 로그인한 관리자 정보. RequireAdmin 이 권한을 확인하며 받은 GET /api/users/me 응답을 채운다.
 * RequireAdmin 안쪽 화면(상단바 등)에서만 값이 있다.
 */
export const AdminMeContext = createContext<AdminMe | null>(null);

export const useAdminMe = (): AdminMe | null => useContext(AdminMeContext);
