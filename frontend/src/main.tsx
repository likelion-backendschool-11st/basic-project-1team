import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 사용자 사이트 진입점 (index.html). 사용자 화면(Q&A·자유게시판·회원)은 site 모듈 하나로 묶여 있어
 * 서로 오갈 때 페이지를 새로 읽지 않는다. 화면은 다크 테마만 쓴다.
 *
 *   /*        → 사용자 화면 (src/apps/site → apps/qna, apps/board, apps/web)
 *   /admin/*  → 관리자 사이트로 넘김 (따로 빌드·실행: admin.html, src/admin-main.tsx)
 *
 * 관리자 사이트는 주소(포트·도메인)가 달라 로그인 토큰을 공유하지 않는다. 관리자는 관리자 사이트에서 따로 로그인한다.
 */
const ADMIN_PREFIX = '/admin';
/** 관리자 사이트 주소. 배포 때는 VITE_ADMIN_SITE_URL 로 정한다 (개발 기본값: npm run dev:admin) */
const ADMIN_SITE_URL = import.meta.env.VITE_ADMIN_SITE_URL ?? 'http://localhost:5174';

const { pathname, search, hash } = window.location;

if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
  // 예전 주소(/admin/...)나 로그인 후 관리자 이동(REQ-LOGIN-001)은 같은 경로의 관리자 사이트로 보낸다
  window.location.replace(`${ADMIN_SITE_URL}${pathname}${search}${hash}`);
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
