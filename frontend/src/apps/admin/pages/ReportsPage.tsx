import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthorFilterNotice } from '../components/content/AuthorFilterNotice';
import { ContentDetailModal } from '../components/content/ContentDetailModal';
import { ReportDetailPanel } from '../components/reports/ReportDetailPanel';
import { ReportTable } from '../components/reports/ReportTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { reportReasonOptions, reportTargetOptions, reportsCopy, ui } from '../data/mockData';
import { useReportQueue } from '../hooks/useReportQueue';
import type { ReportStatus } from '../types';

const AUTHOR_PARAM = 'targetAuthorId';

interface ReportQueueViewProps {
  readonly targetAuthorId: string;
  readonly onClearAuthor: () => void;
}

const ReportQueueView: React.FC<ReportQueueViewProps> = ({ targetAuthorId, onClearAuthor }) => {
  const queue = useReportQueue(targetAuthorId);
  const { list, counts } = queue;
  // 원문 보기: 숨김·삭제된 대상도 본문을 보는 관리자 상세 창 (API_SPEC 10.3·10.4)
  const [viewing, setViewing] = useState(false);

  const tabs: readonly TabItem<ReportStatus>[] = [
    {
      key: 'pending',
      label: reportsCopy.tabs.pending,
      count: counts?.pending,
      countTone: 'danger',
    },
    { key: 'resolved', label: reportsCopy.tabs.resolved, count: counts?.resolved },
    { key: 'rejected', label: reportsCopy.tabs.rejected, count: counts?.rejected },
  ];

  return (
    <>
      {targetAuthorId && (
        <AuthorFilterNotice
          authorId={targetAuthorId}
          message={reportsCopy.authorFilter(targetAuthorId)}
          onClear={onClearAuthor}
        />
      )}
      <TabBar tabs={tabs} active={queue.tab} onChange={queue.setTab} />

      <FilterBar onSubmit={list.submit} submitClassName="w-[186px]">
        <Select
          className="min-w-[200px] flex-1"
          options={reportTargetOptions}
          value={list.draft.target}
          onChange={(v) => list.update('target', v)}
        />
        <Select
          className="min-w-[200px] flex-1"
          options={reportReasonOptions}
          value={list.draft.reason}
          onChange={(v) => list.update('reason', v)}
        />
      </FilterBar>

      <div className="flex items-start gap-8">
        <ReportTable
          rows={list.items}
          selectedId={queue.selected?.id ?? null}
          onSelect={queue.select}
          pagination={list}
          message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        />
        <ReportDetailPanel
          report={queue.selected}
          hideTarget={queue.hideTarget}
          onHideTargetChange={queue.setHideTarget}
          sanctionType={queue.sanctionType}
          onSanctionTypeChange={queue.setSanctionType}
          sanctionDays={queue.sanctionDays}
          onSanctionDaysChange={queue.setSanctionDays}
          canSanction={queue.canSanction}
          submitting={queue.submitting}
          errorMessage={queue.errorMessage}
          onViewOriginal={() => setViewing(true)}
          onResolve={queue.resolve}
          onReject={queue.reject}
        />
      </div>

      {queue.selected && (
        <ContentDetailModal
          type={queue.selected.targetType}
          id={viewing ? queue.selected.targetId : null}
          onClose={() => setViewing(false)}
        />
      )}
    </>
  );
};

/** 회원 필터(?targetAuthorId=)는 주소에 둬서 회원 상세의 받은 신고 수에서 바로 열 수 있게 한다 */
export const ReportsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const targetAuthorId = params.get(AUTHOR_PARAM) ?? '';

  const clearAuthor = () =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(AUTHOR_PARAM);
      return next;
    });

  return (
    <>
      <PageHeader title={reportsCopy.title} description={reportsCopy.description} />
      {/* 회원 필터를 풀면 필터 없는 목록으로 새로 그린다 */}
      <ReportQueueView
        key={targetAuthorId}
        targetAuthorId={targetAuthorId}
        onClearAuthor={clearAuthor}
      />
    </>
  );
};
