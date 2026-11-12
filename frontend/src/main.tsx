import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * URL prefix 로 모듈을 골라 불러온다. 모듈마다 BrowserRouter 와 CSS(index.css)가 따로다.
 * 사용자 화면(Q&A·자유게시판·회원)은 site 모듈 하나로 묶여 있어 서로 오갈 때 페이지를 새로 읽지 않는다.
 * site ↔ 관리자 사이만 전체 페이지 이동(<a href>)이다. 화면은 다크 테마만 쓴다.
 *
 *   /admin/*  → 관리자     (src/apps/admin)
 *   /*        → 사용자 화면 (src/apps/site → apps/qna, apps/board, apps/web)
 */
const MODULES = [
  { prefix: '/admin', title: 'GAMERS 관리자', load: () => import('./apps/admin/Root') },
] as const;
// 화면 제목은 site 의 SiteLayout 이 경로에 맞춰 바꾼다
const FALLBACK = { prefix: '/', title: 'Gamers', load: () => import('./apps/site/Root') };

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
