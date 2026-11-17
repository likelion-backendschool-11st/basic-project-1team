import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 사용자 사이트 진입점 (index.html). 사용자 화면(Q&A·자유게시판·회원)은 site 모듈 하나로 묶여 있어
 * 서로 오갈 때 페이지를 새로 읽지 않는다. 화면은 다크 테마만 쓴다.
 *
 *   /*        → 사용자 화면 (src/apps/site → apps/qna, apps/board, apps/web)
 *   /admin/*  → 관리자 사이트로 넘김 (따로 빌드·실행: admin.html, src/admin-main.tsx)
 *
 * 관리자 사이트는 로그인 토큰을 공유하지 않는다(shared/auth 의 저장 키가 다름). 관리자는 관리자 사이트에서 따로 로그인한다.
 */
const ADMIN_PREFIX = '/admin';

/**
 * 관리자 사이트 주소(origin). 배포(npm run build:vercel)는 관리자 사이트를 같은 도메인의 /admin 에 함께 올리므로 비워 둔다.
 * 다른 도메인에 따로 올렸을 때만 VITE_ADMIN_SITE_URL 로 정한다 (개발 기본값: npm run dev:admin)
 */
const ADMIN_SITE_ORIGIN = import.meta.env.VITE_ADMIN_SITE_URL
  ? new URL(import.meta.env.VITE_ADMIN_SITE_URL).origin
  : import.meta.env.DEV
    ? 'http://localhost:5174'
    : window.location.origin;

const { pathname, search, hash } = window.location;
const isAdminPath = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

// 관리자 사이트가 같은 도메인이면 서버가 /admin 에 admin.html 을 주므로 여기로 오지 않는다.
// 같은 도메인으로 다시 보내면 끝없이 새로 읽으므로 다른 도메인일 때만 넘긴다
if (isAdminPath && ADMIN_SITE_ORIGIN !== window.location.origin) {
  // 예전 주소(/admin/...)나 로그인 후 관리자 이동(REQ-LOGIN-001)은 같은 경로의 관리자 사이트로 보낸다
  window.location.replace(`${ADMIN_SITE_ORIGIN}${pathname}${search}${hash}`);
} else {
  // 화면 제목은 site 의 SiteLayout 이 경로에 맞춰 바꾼다
  document.title = 'Gamers';
  const Site = lazy(() => import('./apps/site/Root'));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback={null}>
        <Site />
      </Suspense>
    </StrictMode>,
  );
}
