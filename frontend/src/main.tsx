import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * URL prefix 로 모듈을 골라 불러온다. 모듈마다 BrowserRouter 와 CSS(index.css)가 따로다.
 * 사용자 화면인 Q&A·자유게시판은 site 모듈 하나로 묶여 있어 서로 오갈 때 페이지를 새로 읽지 않는다.
 * site ↔ 회원 ↔ 관리자 사이는 전체 페이지 이동(<a href>)이다. 화면은 다크 테마만 쓴다.
 *
 *   /admin/*          → 관리자          (src/apps/admin)
 *   /qna/*, /board/*  → 질문/답변·자유게시판 (src/apps/site → apps/qna, apps/board)
 *   /*                → 회원/계정        (src/apps/web)  — 로그인, 회원가입, 마이페이지 등
 */
const loadSite = () => import('./apps/site/Root');
const MODULES = [
  { prefix: '/admin', title: 'GAMERS 관리자', load: () => import('./apps/admin/Root') },
  // 화면 제목은 site 의 SiteLayout 이 경로에 맞춰 바꾼다
  { prefix: '/board', title: '자유게시판 - GAMERS', load: loadSite },
  { prefix: '/qna', title: 'Gamers - Gaming Q&A', load: loadSite },
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
