import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteLayout } from '../../../../shared/layout/SiteLayout';

export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  return (
    // The list screen's footer has no version label in the Stitch design
    <SiteLayout base="/qna" showVersion={pathname !== '/questions'}>
      <Outlet />
    </SiteLayout>
  );
};
