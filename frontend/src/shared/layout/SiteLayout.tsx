import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

const TITLES: readonly [prefix: string, title: string][] = [
  ['/board', '자유게시판 - GAMERS'],
  ['/qna', 'Gamers - Gaming Q&A'],
  ['/mypage', '마이페이지 - GAMERS'],
  ['/users', '회원 프로필 - GAMERS'],
  ['/', 'Gamers'],
];

/**
 * 사용자 화면(Q&A·자유게시판·회원) 공통 화면 틀. 헤더 + 본문(최대 1280px) + 푸터.
 * site 라우터의 레이아웃 경로에 한 번만 두므로 탭을 옮겨도 헤더는 그대로 있고 본문만 바뀐다.
 */
export const SiteLayout: React.FC = () => {
  const { pathname, hash } = useLocation();
  // #answer-<id> 처럼 위치가 지정된 경우는 해당 화면이 직접 스크롤한다
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  useEffect(() => {
    const found = TITLES.find(([prefix]) => pathname.startsWith(prefix));
    if (found) document.title = found[1];
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <SiteHeader />
      {/* 헤더(h-14) + 공지 롤링(h-9) 높이만큼 띄운다 */}
      <main className="w-full pt-[92px] flex-1 bg-canvas max-w-[1280px] mx-auto px-margin">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
};
