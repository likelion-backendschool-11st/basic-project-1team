import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ADMIN_HOME_PATH } from '../../../../shared/auth';
import { ErrorBoundary } from '../../../../shared/ErrorBoundary';
import { navItems } from '../../data/mockData';
import { DashboardStatsContext, useDashboardStatsLoader } from '../../hooks/useDashboardStats';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppLayoutProps {
  readonly onLogout?: () => void;
}

const REPORTS_PATH = '/reports';

export const AppLayout: React.FC<AppLayoutProps> = ({ onLogout }) => {
  // 대시보드와 사이드바 신고 배지가 같은 현황을 쓴다 (API_SPEC 10.1)
  const stats = useDashboardStatsLoader();
  const { pathname } = useLocation();
  const pendingReports = stats.stats?.kpis.pendingReports;

  const items = useMemo(
    () =>
      navItems.map((item) =>
        item.to === REPORTS_PATH && pendingReports ? { ...item, badge: pendingReports } : item,
      ),
    [pendingReports],
  );

  return (
    <DashboardStatsContext.Provider value={stats}>
      <div className="min-h-screen bg-canvas text-ink selection:bg-primary-container selection:text-on-primary-container">
        <TopBar onLogout={onLogout} />
        <div className="flex min-h-[calc(100vh-3.5rem)]">
          <Sidebar items={items} />
          <main className="ml-60 min-w-0 max-w-[1440px] flex-1 bg-canvas p-6 lg:px-8">
            {/* 본문에서 난 오류는 사이드바를 남기고 본문만 안내로 바꾼다. 다른 화면으로 가면 다시 그린다 */}
            <ErrorBoundary homeHref={ADMIN_HOME_PATH} resetKey={pathname}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </DashboardStatsContext.Provider>
  );
};
