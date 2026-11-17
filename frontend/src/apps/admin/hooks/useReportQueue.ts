import { useCallback, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import {
  getReports,
  processReport,
  type ReportDecision,
  type ReportPageMeta,
} from '../api/reports';
import { toSanctionDays } from '../sanction';
import type {
  Report,
  ReportReason,
  ReportSanctionType,
  ReportStatus,
  ReportTarget,
  SanctionDays,
} from '../types';
import { usePagedList, type PagedListState } from './usePagedList';

const PAGE_SIZE = 20;

export interface ReportFilters {
  readonly status: ReportStatus;
  /** 'all' 또는 대상 종류 */
  readonly target: string;
  /** 'all' 또는 신고 사유 */
  readonly reason: string;
  /** 회원 상세에서 넘어오면 그 회원 id, 아니면 '' */
  readonly targetAuthorId: string;
}

const fetchReports = (f: ReportFilters, page: number, size: number) =>
  getReports({
    page,
    size,
    status: f.status,
    targetType: f.target === 'all' ? undefined : (f.target as ReportTarget),
    reason: f.reason === 'all' ? undefined : (f.reason as ReportReason),
    targetAuthorId: f.targetAuthorId ? Number(f.targetAuthorId) : undefined,
  });

export interface ReportQueueState {
  readonly list: PagedListState<Report, ReportFilters, ReportPageMeta>;
  readonly tab: ReportStatus;
  readonly setTab: (tab: ReportStatus) => void;
  /** 탭 배지. 아직 못 불러왔으면 undefined */
  readonly counts: Readonly<Record<ReportStatus, number>> | undefined;
  readonly selected: Report | null;
  readonly select: (id: number) => void;
  readonly hideTarget: boolean;
  readonly setHideTarget: (value: boolean) => void;
  readonly sanctionType: ReportSanctionType;
  readonly setSanctionType: (value: ReportSanctionType) => void;
  readonly sanctionDays: SanctionDays;
  readonly setSanctionDays: (value: SanctionDays) => void;
  /** 작성자가 탈퇴했으면 제재할 수 없다 (API_SPEC 10.6, 404 USER_NOT_FOUND) */
  readonly canSanction: boolean;
  readonly submitting: boolean;
  readonly errorMessage: string | null;
  readonly resolve: () => void;
  readonly reject: () => void;
}

/**
 * 신고 관리 (API_SPEC 10.6): 상태 탭, 선택, 처리(숨김·제재) / 반려.
 * 처리하면 목록을 다시 불러오고, 선택은 목록의 첫 신고로 넘어간다.
 */
export function useReportQueue(targetAuthorId: string): ReportQueueState {
  const list = usePagedList<Report, ReportFilters, ReportPageMeta>(
    { status: 'pending', target: 'all', reason: 'all', targetAuthorId },
    PAGE_SIZE,
    fetchReports,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hideTarget, setHideTarget] = useState(true);
  const [sanctionType, setSanctionType] = useState<ReportSanctionType>('suspend');
  const [sanctionDays, setSanctionDays] = useState<SanctionDays>('7');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 고른 신고가 목록에 없으면(처리해서 빠졌거나 탭을 바꿈) 첫 신고를 보여 준다
  const selected = list.items.find((r) => r.id === selectedId) ?? list.items[0] ?? null;
  // 대상이 삭제됐으면 targetAuthor 가 null, 탈퇴 회원이면 id 가 null
  const author = selected?.targetAuthor ?? null;
  const canSanction = author !== null && author.id !== null;

  const resetDecision = useCallback(() => {
    setHideTarget(true);
    setSanctionType('suspend');
    setSanctionDays('7');
    setErrorMessage(null);
  }, []);

  const select = useCallback(
    (id: number) => {
      setSelectedId(id);
      resetDecision();
    },
    [resetDecision],
  );

  const { applyNow, reload } = list;
  const setTab = useCallback(
    (next: ReportStatus) => {
      applyNow('status', next);
      setSelectedId(null);
      resetDecision();
    },
    [applyNow, resetDecision],
  );

  const send = useCallback(
    async (decision: ReportDecision) => {
      if (!selected || selected.status !== 'pending') return;
      setSubmitting(true);
      setErrorMessage(null);
      try {
        await processReport(selected.id, decision);
        setSelectedId(null);
        resetDecision();
        reload();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setSubmitting(false);
      }
    },
    [selected, resetDecision, reload],
  );

  const resolve = useCallback(
    () =>
      void send({
        status: 'resolved',
        hideTarget,
        sanction:
          sanctionType === 'none' || !canSanction
            ? null
            : { type: sanctionType, days: toSanctionDays(sanctionDays) },
      }),
    [send, hideTarget, sanctionType, sanctionDays, canSanction],
  );

  const reject = useCallback(() => void send({ status: 'rejected' }), [send]);

  return {
    list,
    tab: list.applied.status,
    setTab,
    counts: list.meta?.statusCounts,
    selected,
    select,
    hideTarget,
    setHideTarget,
    sanctionType,
    setSanctionType,
    sanctionDays,
    setSanctionDays,
    canSanction,
    submitting,
    errorMessage,
    resolve,
    reject,
  };
}
