import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

interface AppLayoutProps {
  readonly className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ className = '' }) => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <div className={`min-h-screen flex flex-col bg-canvas ${className}`}>
      <AppHeader />
      <main className="w-full pt-14 flex-1 bg-canvas max-w-[1280px] mx-auto px-margin">
        <Outlet />
      </main>
      {/* The list screen's footer has no version label in the Stitch design */}
      <AppFooter showVersion={pathname !== '/questions'} />
    </div>
  );
};

export default AppLayout;
