import React, { useMemo } from 'react';
import { ReportDetailPanel } from '../components/reports/ReportDetailPanel';
import { ReportTable } from '../components/reports/ReportTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { pageCounts, reportReasonOptions, reportTargetOptions, reports, reportsCopy } from '../data/mockData';
import { usePagination } from '../hooks/usePagination';
import { useReportQueue, type ReportFilters } from '../hooks/useReportQueue';
import { useSearchFilter } from '../hooks/useSearchFilter';
import type { Report, ReportStatus } from '../types';

const matchReport = (r: Report, f: ReportFilters) =>
  (f.target === 'all' || r.target === f.target) && (f.reason === 'all' || r.reason === f.reason);

export const ReportsPage: React.FC = () => {
  const queue = useReportQueue(reports);
  const filter = useSearchFilter(queue.rowsForTab, { target: 'all', reason: 'all' }, matchReport);
  const pagination = usePagination(pageCounts.reports);

  const tabs = useMemo<readonly TabItem<ReportStatus>[]>(
    () => [
      { key: 'pending', label: reportsCopy.tabs.pending, count: queue.counts.pending, countTone: 'danger' },
      { key: 'resolved', label: reportsCopy.tabs.resolved },
      { key: 'rejected', label: reportsCopy.tabs.rejected },
    ],
    [queue.counts.pending],
  );

  return (
    <>
      <PageHeader title={reportsCopy.title} description={reportsCopy.description} />
      <TabBar tabs={tabs} active={queue.tab} onChange={queue.setTab} />

      <FilterBar onSubmit={filter.submit} submitClassName="w-[186px]">
        <Select className="min-w-[200px] flex-1" options={reportTargetOptions} value={filter.draft.target} onChange={(v) => filter.update('target', v)} />
        <Select className="min-w-[200px] flex-1" options={reportReasonOptions} value={filter.draft.reason} onChange={(v) => filter.update('reason', v)} />
      </FilterBar>

      <div className="flex items-start gap-8">
        <ReportTable rows={filter.results} selectedId={queue.selected?.id ?? null} onSelect={queue.select} pagination={pagination} />
        <ReportDetailPanel
          report={queue.selected}
          hideTarget={queue.hideTarget}
          onHideTargetChange={queue.setHideTarget}
          sanctionType={queue.sanctionType}
          onSanctionTypeChange={queue.setSanctionType}
          sanctionDays={queue.sanctionDays}
          onSanctionDaysChange={queue.setSanctionDays}
          onResolve={queue.resolve}
          onReject={queue.reject}
        />
      </div>
    </>
  );
};
