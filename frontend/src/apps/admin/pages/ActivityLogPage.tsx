import React from 'react';
import { ActivityLogTable } from '../components/activity/ActivityLogTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import {
  activityLogCopy,
  activityLogs,
  logActionOptions,
  logAdminOptions,
  pageCounts,
} from '../data/mockData';
import { usePagination } from '../hooks/usePagination';
import { useSearchFilter } from '../hooks/useSearchFilter';
import type { ActivityLog } from '../types';

interface LogFilters extends Record<string, string> {
  admin: string;
  action: string;
  start: string;
  end: string;
}

/** Action filter values like "HIDE" match every HIDE_* action. */
const matchLog = (log: ActivityLog, f: LogFilters) =>
  (f.admin === 'all' || log.admin === f.admin) &&
  (f.action === 'all' || log.action === f.action || log.action.startsWith(`${f.action}_`)) &&
  (!f.start || log.date >= f.start) &&
  (!f.end || log.date <= f.end);

export const ActivityLogPage: React.FC = () => {
  const c = activityLogCopy;
  const filter = useSearchFilter(
    activityLogs,
    { admin: 'all', action: 'all', start: c.defaultStart, end: c.defaultEnd },
    matchLog,
  );
  const pagination = usePagination(pageCounts.logs);

  return (
    <>
      <PageHeader title={c.title} description={c.description} />

      <FilterBar onSubmit={filter.submit} submitClassName="w-[102px]">
        <Select
          aria-label={c.adminLabel}
          className="w-[175px]"
          options={logAdminOptions}
          value={filter.draft.admin}
          onChange={(v) => filter.update('admin', v)}
        />
        <Select
          aria-label={c.actionLabel}
          className="w-[265px]"
          options={logActionOptions}
          value={filter.draft.action}
          onChange={(v) => filter.update('action', v)}
        />
        <TextInput
          type="date"
          aria-label={c.startLabel}
          className="w-[158px] [&>input]:[color-scheme:dark]"
          value={filter.draft.start}
          max={filter.draft.end || undefined}
          onChange={(event) => filter.update('start', event.target.value)}
        />
        <span className="text-ink-tertiary">~</span>
        <TextInput
          type="date"
          aria-label={c.endLabel}
          className="w-[158px] [&>input]:[color-scheme:dark]"
          value={filter.draft.end}
          min={filter.draft.start || undefined}
          onChange={(event) => filter.update('end', event.target.value)}
        />
      </FilterBar>

      <ActivityLogTable logs={filter.results} />
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onChange={pagination.goTo}
        className="mt-4"
      />
    </>
  );
};
