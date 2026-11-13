import React, { useMemo } from 'react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { PendingReportsCard } from '../components/dashboard/PendingReportsCard';
import { TopTagsCard } from '../components/dashboard/TopTagsCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PageHeader } from '../components/ui/PageHeader';
import { toKpis, toPendingSummaries, toTrendPoints, trendTicks } from '../dashboard';
import { dashboardCopy, ui } from '../data/mockData';
import { useDashboardStats } from '../hooks/useDashboardStats';

/** 대시보드 (API_SPEC 10.1, REQ-ADMIN-006). 현황은 관리자 레이아웃이 불러 둔 값을 쓴다 */
export const DashboardPage: React.FC = () => {
  const { stats, loading, errorMessage } = useDashboardStats();

  const view = useMemo(
    () =>
      stats && {
        kpis: toKpis(stats.kpis),
        trend: toTrendPoints(stats.trend),
        yTicks: trendTicks(stats.trend),
        reports: toPendingSummaries(stats.recentPendingReports),
      },
    [stats],
  );

  return (
    <>
      <PageHeader title={dashboardCopy.title} description={dashboardCopy.description} divider />

      {!view ? (
        <p
          role={errorMessage ? 'alert' : undefined}
          className={`py-20 text-center text-body-md ${errorMessage ? 'text-error' : 'text-ink-subtle'}`}
        >
          {loading ? ui.loading : (errorMessage ?? ui.loadError)}
        </p>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-5 gap-4">
            {view.kpis.map((kpi) => (
              <KpiCard key={kpi.key} kpi={kpi} />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-12 gap-6">
            <TopTagsCard tags={stats?.topTags ?? []} className="col-span-5" />
            <TrendChart data={view.trend} yTicks={view.yTicks} className="col-span-7" />
          </section>

          <PendingReportsCard
            reports={view.reports}
            pendingCount={stats?.kpis.pendingReports ?? 0}
          />
        </>
      )}
    </>
  );
};
