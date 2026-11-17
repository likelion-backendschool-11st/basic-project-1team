import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Pagination } from '../../../../shared/layout/Pagination';
import { getMyReports } from '../../api/users';
import { mypageContent, type MyReport } from '../../data/mockData';
import { usePagedList } from '../../hooks/usePagedList';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusMessage } from '../ui/StatusMessage';

const c = mypageContent.reportHistory;
const PAGE_SIZE = 10;

const STATUS_TONES: Readonly<Record<MyReport['status'], string>> = {
  pending: 'bg-tertiary/10 text-tertiary',
  resolved: 'bg-semantic-success/15 text-semantic-success',
  rejected: 'bg-surface-3 text-ink-subtle',
};

const pad = (n: number) => String(n).padStart(2, '0');

/** 접수일 (예: 2026.11.16) */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

/**
 * 마이페이지의 내 신고 내역 (API_SPEC 8장 GET /api/reports/me). 접수번호·대상·사유·처리 상태를 보여 준다.
 * 신고 완료 화면의 "내 신고 내역 보기"(#my-reports)로 들어오면 이 영역으로 스크롤한다.
 */
export const MyReportSection: React.FC = () => {
  const reports = usePagedList(getMyReports, PAGE_SIZE);
  const sectionRef = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  const hasLoaded = !reports.loading;

  useEffect(() => {
    if (hasLoaded && hash === `#${c.anchor}`) {
      sectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [hasLoaded, hash]);

  return (
    <section id={c.anchor} ref={sectionRef} className="scroll-mt-[108px] space-y-2">
      <SectionHeader icon={c.icon} label={c.label} meta={reports.totalCount} metaTone="accent" />
      {reports.errorMessage && (
        <StatusMessage tone="danger" text={`${c.loadError} ${reports.errorMessage}`} />
      )}
      <div className="rounded-xl bg-surface-2 p-2">
        {!reports.loading && reports.items.length === 0 ? (
          <p className="px-3 py-4 font-body-sm text-body-sm text-ink-tertiary">{c.empty}</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {reports.items.map((report) => (
              <li key={report.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-md text-body-md text-ink">
                    {c.reasons[report.reason]}
                  </p>
                  <p className="truncate font-label-code text-label-code text-ink-tertiary">
                    {c.target(report.targetType, report.targetId)} · {report.receiptNumber}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 font-label-code text-[11px] font-semibold ${STATUS_TONES[report.status]}`}
                >
                  {c.statuses[report.status]}
                </span>
                <span className="hidden shrink-0 font-label-code text-label-code text-ink-tertiary sm:inline">
                  {formatDate(report.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {reports.totalPages > 1 && (
        <Pagination
          page={reports.page}
          totalPages={reports.totalPages}
          onChange={reports.goTo}
          className="pt-2"
        />
      )}
    </section>
  );
};
