import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 관리자 사이트 진입점 (admin.html, vite.admin.config.ts). 사용자 사이트(src/main.tsx)와 따로 빌드·실행한다.
 * 관리자 화면 주소는 /admin 아래다. 그 밖의 주소는 /admin 을 붙여 넘긴다.
 *   예: 공통 API 함수가 토큰 만료 때 보내는 /login?redirect=… → /admin/login?redirect=…
 */
const ADMIN_PREFIX = '/admin';

const { pathname, search, hash } = window.location;
const isAdminPath = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

if (!isAdminPath) {
  const rest = pathname === '/' ? '' : pathname;
  window.location.replace(`${ADMIN_PREFIX}${rest}${search}${hash}`);
} else {
  const Root = lazy(() => import('./apps/admin/Root'));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback={null}>
        <Root />
      </Suspense>
    </StrictMode>,
  );
}
