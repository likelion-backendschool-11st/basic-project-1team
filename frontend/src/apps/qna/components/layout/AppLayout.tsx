import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

interface AppLayoutProps {
  readonly className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ className = '' }) => {
  const { pathname, hash } = useLocation();
  // #answer-<id> 처럼 위치가 지정된 경우는 해당 화면이 직접 스크롤한다
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className={`min-h-screen flex flex-col bg-canvas ${className}`}>
      <AppHeader />
      {/* 헤더(h-14) + 공지 롤링(h-9) 높이만큼 띄운다 */}
      <main className="w-full pt-[92px] flex-1 bg-canvas max-w-[1280px] mx-auto px-margin">
        <Outlet />
      </main>
      {/* The list screen's footer has no version label in the Stitch design */}
      <AppFooter showVersion={pathname !== '/questions'} />
    </div>
  );
};
