import React from 'react';
import { ActivityLogTable } from '../components/activity/ActivityLogTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { activityLogCopy, logActionOptions } from '../data/mockData';
import { useActivityLogs } from '../hooks/useActivityLogs';

export const ActivityLogPage: React.FC = () => {
  const c = activityLogCopy;
  const logs = useActivityLogs();

  return (
    <>
      <PageHeader title={c.title} description={c.description} />

      <FilterBar onSubmit={logs.submit} submitClassName="w-[102px]">
        <Select
          aria-label={c.actionLabel}
          className="w-[265px]"
          options={logActionOptions}
          value={logs.draft.action}
          onChange={(v) => logs.update('action', v)}
        />
        <TextInput
          type="date"
          aria-label={c.startLabel}
          className="w-[158px] [&>input]:[color-scheme:dark]"
          value={logs.draft.start}
          max={logs.draft.end || undefined}
          onChange={(event) => logs.update('start', event.target.value)}
        />
        <span className="text-ink-tertiary">~</span>
        <TextInput
          type="date"
          aria-label={c.endLabel}
          className="w-[158px] [&>input]:[color-scheme:dark]"
          value={logs.draft.end}
          min={logs.draft.start || undefined}
          onChange={(event) => logs.update('end', event.target.value)}
        />
      </FilterBar>

      <ActivityLogTable
        logs={logs.logs}
        message={logs.loading ? c.loading : (logs.errorMessage ?? undefined)}
      />
      <Pagination
        page={logs.page}
        totalPages={logs.totalPages}
        onChange={logs.goTo}
        className="mt-4"
      />
    </>
  );
};
