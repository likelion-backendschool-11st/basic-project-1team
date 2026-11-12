import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 하나의 SPA 안에 4개 모듈을 URL prefix 로 분리해 탑재한다.
 * 모듈마다 Tailwind 디자인 토큰이 서로 달라(canvas, ink 등 이름 충돌) 한 번에 하나의
 * 모듈 CSS 만 로드되도록, 모듈 간 이동은 전체 페이지 이동(<a href>)으로 처리한다.
 *
 *   /admin/*  → 관리자     (src/apps/admin)
 *   /board/*  → 자유게시판 (src/apps/board)
 *   /qna/*    → 질문/답변  (src/apps/qna)
 *   /*        → 회원/계정  (src/apps/web)  — 로그인, 회원가입, 마이페이지 등
 */
const MODULES = [
  { prefix: '/admin', title: 'GAMERS 관리자', load: () => import('./apps/admin/Root') },
  { prefix: '/board', title: '자유게시판 - GAMERS', load: () => import('./apps/board/Root') },
  { prefix: '/qna', title: 'Gamers - Gaming Q&A', load: () => import('./apps/qna/Root') },
] as const;
const FALLBACK = { prefix: '/', title: 'Gamers', load: () => import('./apps/web/Root') };

const path = window.location.pathname;
const mod = MODULES.find((m) => path === m.prefix || path.startsWith(`${m.prefix}/`)) ?? FALLBACK;

document.title = mod.title;
if (mod.prefix !== '/board') {
  // board 만 라이트/다크 토글을 지원하고 나머지는 항상 다크
  document.documentElement.classList.add('dark');
}

const Module = lazy(mod.load);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Module />
    </Suspense>
  </StrictMode>,
);
