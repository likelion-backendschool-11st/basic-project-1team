import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteLayout } from '../../../../shared/layout/SiteLayout';

export const AppLayout: React.FC = () => (
  <SiteLayout base="/qna">
    <Outlet />
  </SiteLayout>
);
