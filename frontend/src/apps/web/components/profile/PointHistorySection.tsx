import React from 'react';
import { Pagination } from '../../../../shared/layout/Pagination';
import { POINT_REASON_LABELS } from '../../../../shared/points';
import { mypageContent } from '../../data/mockData';
import { getMyPointHistories } from '../../api/users';
import { usePagedList } from '../../hooks/usePagedList';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusMessage } from '../ui/StatusMessage';

const c = mypageContent.pointHistory;
const PAGE_SIZE = 10;

const pad = (n: number) => String(n).padStart(2, '0');

/** 지급·차감 시각 (예: 2026.11.16 14:32) */
const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 마이페이지의 내 포인트 내역 (API_SPEC 11장). 차감은 신고 상세를 볼 수 없어 링크 없이 내용만 보여 준다 */
export const PointHistorySection: React.FC = () => {
  const history = usePagedList(getMyPointHistories, PAGE_SIZE);

  return (
    <section className="space-y-2">
      <SectionHeader icon={c.icon} label={c.label} meta={history.totalCount} metaTone="accent" />
      {history.errorMessage && (
        <StatusMessage tone="danger" text={`${c.loadError} ${history.errorMessage}`} />
      )}
      <div className="rounded-xl bg-surface-2 p-2">
        {!history.loading && history.items.length === 0 ? (
          <p className="px-3 py-4 font-body-sm text-body-sm text-ink-tertiary">{c.empty}</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {history.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body-md text-body-md text-ink">
                    {POINT_REASON_LABELS[item.reason]}
                  </p>
                  {item.detail && (
                    <p className="truncate font-body-sm text-body-sm text-ink-tertiary">
                      {item.detail}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 font-label-code text-label-code font-semibold ${
                    item.amount > 0 ? 'text-secondary' : 'text-semantic-danger'
                  }`}
                >
                  {c.amount(item.amount)}
                </span>
                <span className="hidden shrink-0 font-label-code text-label-code text-ink-tertiary sm:inline">
                  {formatDateTime(item.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {history.totalPages > 1 && (
        <Pagination
          page={history.page}
          totalPages={history.totalPages}
          onChange={history.goTo}
          className="pt-2"
        />
      )}
    </section>
  );
};
