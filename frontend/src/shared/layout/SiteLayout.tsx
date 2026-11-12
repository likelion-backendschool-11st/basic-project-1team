import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ModuleBaseContext } from './moduleBase';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

interface SiteLayoutProps {
  /** 이 화면이 속한 모듈의 URL prefix (`/qna`, `/board`) */
  readonly base: string;
  readonly children: React.ReactNode;
}

/** Q&A·자유게시판 공통 화면 틀. 헤더 + 본문(최대 1280px) + 푸터. */
export const SiteLayout: React.FC<SiteLayoutProps> = ({ base, children }) => {
  const { pathname, hash } = useLocation();
  // #answer-<id> 처럼 위치가 지정된 경우는 해당 화면이 직접 스크롤한다
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <ModuleBaseContext.Provider value={base}>
      <div className="min-h-screen flex flex-col bg-canvas">
        <SiteHeader />
        {/* 헤더(h-14) + 공지 롤링(h-9) 높이만큼 띄운다 */}
        <main className="w-full pt-[92px] flex-1 bg-canvas max-w-[1280px] mx-auto px-margin">
          {children}
        </main>
        <SiteFooter />
      </div>
    </ModuleBaseContext.Provider>
  );
};
