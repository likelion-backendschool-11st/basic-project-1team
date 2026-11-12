import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 하나의 SPA 안에 4개 모듈을 URL prefix 로 분리해 탑재한다.
 * 모듈마다 BrowserRouter 와 CSS(index.css)가 따로라 한 번에 하나의 모듈 CSS 만 로드되도록,
 * 모듈 간 이동은 전체 페이지 이동(<a href>)으로 처리한다. 화면은 다크 테마만 쓴다.
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

const Module = lazy(mod.load);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Module />
    </Suspense>
  </StrictMode>,
);
