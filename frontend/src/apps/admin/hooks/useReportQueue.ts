import { useCallback, useMemo, useState } from 'react';
import type { Report, ReportSanctionType, ReportStatus, SanctionDays } from '../types';

export interface ReportFilters extends Record<string, string> {
  readonly target: string;
  readonly reason: string;
}

export interface ReportQueueState {
  readonly tab: ReportStatus;
  readonly setTab: (tab: ReportStatus) => void;
  readonly counts: Readonly<Record<ReportStatus, number>>;
  readonly rowsForTab: readonly Report[];
  readonly selected: Report | null;
  readonly select: (id: number) => void;
  readonly hideTarget: boolean;
  readonly setHideTarget: (value: boolean) => void;
  readonly sanctionType: ReportSanctionType;
  readonly setSanctionType: (value: ReportSanctionType) => void;
  readonly sanctionDays: SanctionDays;
  readonly setSanctionDays: (value: SanctionDays) => void;
  readonly resolve: () => void;
  readonly reject: () => void;
}

/** Review queue for the reports screen: tabs, selection and resolve / reject decisions. */
export function useReportQueue(initial: readonly Report[]): ReportQueueState {
  const [reports, setReports] = useState<readonly Report[]>(initial);
  const [tab, setTabRaw] = useState<ReportStatus>('pending');
  const [selectedId, setSelectedId] = useState<number | null>(initial.find((r) => r.status === 'pending')?.id ?? null);
  const [hideTarget, setHideTarget] = useState(true);
  const [sanctionType, setSanctionType] = useState<ReportSanctionType>('suspend');
  const [sanctionDays, setSanctionDays] = useState<SanctionDays>('7');

  const rowsForTab = useMemo(() => reports.filter((r) => r.status === tab), [reports, tab]);

  const counts = useMemo(
    () => ({
      pending: reports.filter((r) => r.status === 'pending').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
    }),
    [reports],
  );

  const selected = useMemo(() => reports.find((r) => r.id === selectedId) ?? null, [reports, selectedId]);

  const resetDecision = useCallback(() => {
    setHideTarget(true);
    setSanctionType('suspend');
    setSanctionDays('7');
  }, []);

  const select = useCallback(
    (id: number) => {
      setSelectedId(id);
      resetDecision();
    },
    [resetDecision],
  );

  const setTab = useCallback(
    (next: ReportStatus) => {
      setTabRaw(next);
      setSelectedId(reports.find((r) => r.status === next)?.id ?? null);
      resetDecision();
    },
    [reports, resetDecision],
  );

  const close = useCallback(
    (status: ReportStatus) => {
      if (!selected || selected.status !== 'pending') return;
      const remaining = reports.filter((r) => r.status === 'pending' && r.id !== selected.id);
      setReports((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status } : r)));
      setSelectedId(remaining[0]?.id ?? null);
      resetDecision();
    },
    [reports, selected, resetDecision],
  );

  const resolve = useCallback(() => close('resolved'), [close]);
  const reject = useCallback(() => close('rejected'), [close]);

  return {
    tab,
    setTab,
    counts,
    rowsForTab,
    selected,
    select,
    hideTarget,
    setHideTarget,
    sanctionType,
    setSanctionType,
    sanctionDays,
    setSanctionDays,
    resolve,
    reject,
  };
}
