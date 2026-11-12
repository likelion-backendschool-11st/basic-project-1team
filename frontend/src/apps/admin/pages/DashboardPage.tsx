import React from 'react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { PendingReportsCard } from '../components/dashboard/PendingReportsCard';
import { TopTagsCard } from '../components/dashboard/TopTagsCard';
import { TrendChart } from '../components/dashboard/TrendChart';
import { PageHeader } from '../components/ui/PageHeader';
import { dashboardCopy, kpis, recentPendingReports, topTags, trend, trendYAxis } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  return (
    <>
      <PageHeader title={dashboardCopy.title} description={dashboardCopy.description} divider />

      <section className="mt-6 grid grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-12 gap-6">
        <TopTagsCard tags={topTags} className="col-span-5" />
        <TrendChart data={trend} yTicks={trendYAxis} className="col-span-7" />
      </section>

      <PendingReportsCard reports={recentPendingReports} />
    </>
  );
};
