import React from 'react';
import {
  reportReasonLabels,
  reportSanctionTypeOptions,
  reportTargetLabels,
  reportsCopy,
  sanctionDurations,
  ui,
} from '../../data/mockData';
import { formatDateTime } from '../../sanction';
import type { Report, ReportSanctionType, SanctionDays } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Checkbox, FieldLabel, Select } from '../ui/FormControls';
import { Icon } from '../ui/Icon';

interface ReportDetailPanelProps {
  readonly report: Report | null;
  readonly hideTarget: boolean;
  readonly onHideTargetChange: (value: boolean) => void;
  readonly sanctionType: ReportSanctionType;
  readonly onSanctionTypeChange: (value: ReportSanctionType) => void;
  readonly sanctionDays: SanctionDays;
  readonly onSanctionDaysChange: (value: SanctionDays) => void;
  /** 작성자가 탈퇴했으면 제재를 고를 수 없다 */
  readonly canSanction: boolean;
  readonly submitting: boolean;
  /** 서버가 처리를 거절한 이유 (같은 제재 중, 관리자 계정 등) */
  readonly errorMessage: string | null;
  /** 원문 보기: 숨김·삭제된 글도 본문까지 보는 관리자 상세 창을 연다 */
  readonly onViewOriginal: () => void;
  readonly onResolve: () => void;
  readonly onReject: () => void;
}

export const ReportDetailPanel: React.FC<ReportDetailPanelProps> = ({
  report,
  hideTarget,
  onHideTargetChange,
  sanctionType,
  onSanctionTypeChange,
  sanctionDays,
  onSanctionDaysChange,
  canSanction,
  submitting,
  errorMessage,
  onViewOriginal,
  onResolve,
  onReject,
}) => {
  const c = reportsCopy;

  if (!report) {
    return (
      <Card
        as="aside"
        className="w-[400px] shrink-0 self-start text-center text-body-md text-ink-subtle"
      >
        {c.emptyPanel}
      </Card>
    );
  }

  const pending = report.status === 'pending';
  // 대상이 삭제된 신고는 숨김·제재 없이 상태만 바꾼다 (API_SPEC 10.6)
  const targetDeleted = report.targetStatus === 'deleted';

  return (
    <Card as="aside" className="w-[400px] shrink-0 self-start">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="whitespace-nowrap text-headline-md font-bold text-ink">
            {c.panelTitlePrefix} #{report.id} {c.panelTitleSuffix}
          </h2>
          <Badge shape="chip">{reportReasonLabels[report.reason]}</Badge>
        </div>
        <span className="whitespace-nowrap font-mono text-code-sm text-ink-subtle">
          {formatDateTime(report.createdAt)}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-label-md font-semibold text-ink">
          {reportTargetLabels[report.targetType]} #{report.targetId}
          {report.targetAuthor && ` · ${c.authorPrefix} ${report.targetAuthor.nickname}`}
        </p>
        {!targetDeleted && (
          <button
            type="button"
            onClick={onViewOriginal}
            className="flex items-center gap-0.5 text-label-md text-primary hover:text-ink"
          >
            {c.viewOriginal}
            <Icon name="open_in_new" className="!text-[16px]" />
          </button>
        )}
      </div>
      <blockquote
        className={`mt-3 rounded-lg border border-hairline bg-surface-2 p-4 text-body-md leading-relaxed ${targetDeleted ? 'text-ink-tertiary' : 'text-ink-muted'}`}
      >
        {report.fullText ?? c.deletedTarget}
      </blockquote>

      {report.targetStatus === 'hidden' && (
        <p className="mt-2 text-body-sm text-ink-subtle">{c.alreadyHidden}</p>
      )}

      <section className="mt-5">
        <h3 className="text-label-md font-semibold text-ink">{c.detailLabel}</h3>
        <p
          className={`mt-2 whitespace-pre-line text-body-md ${report.detail ? 'text-ink-muted' : 'italic text-ink-tertiary'}`}
        >
          {report.detail ?? c.noDetail}
        </p>
      </section>

      {report.attachments.length > 0 && (
        <section className="mt-5">
          <h3 className="text-label-md font-semibold text-ink">
            {c.evidenceLabel} ({report.attachments.length})
          </h3>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {report.attachments.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={c.evidenceOpen(file.name)}
                  className="block overflow-hidden rounded-lg border border-hairline transition-colors hover:border-primary-container"
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="aspect-square w-full object-cover"
                  />
                </a>
                <p className="mt-1 truncate font-mono text-code-xs text-ink-subtle">{file.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-hairline bg-surface-2/60 px-4 py-3 text-body-md text-ink-subtle">
        <Icon name="info" className="text-primary" />
        {c.duplicatePrefix}{' '}
        <strong className="font-semibold text-primary">
          {report.duplicateCount}
          {ui.countUnit}
        </strong>{' '}
        {c.duplicateSuffix}
      </div>

      {pending ? (
        <div className="mt-6 space-y-5 border-t border-hairline pt-6">
          {targetDeleted ? (
            <p className="text-body-md text-ink-subtle">{c.deletedTargetNote}</p>
          ) : (
            <>
              <Checkbox
                label={c.hideTarget}
                checked={hideTarget}
                onChange={onHideTargetChange}
                className="!text-body-lg !font-semibold"
              />
              <div>
                <FieldLabel htmlFor="report-sanction">{c.sanctionLabel}</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    id="report-sanction"
                    options={reportSanctionTypeOptions}
                    value={canSanction ? sanctionType : 'none'}
                    onChange={onSanctionTypeChange}
                    disabled={!canSanction}
                  />
                  <Select
                    aria-label={c.sanctionDurationLabel}
                    options={sanctionDurations}
                    value={sanctionDays}
                    onChange={onSanctionDaysChange}
                    disabled={!canSanction || sanctionType === 'none'}
                  />
                </div>
                {!canSanction && (
                  <p className="mt-2 text-body-sm text-ink-subtle">{c.withdrawnAuthor}</p>
                )}
              </div>
            </>
          )}
          {errorMessage && (
            <p role="alert" className="text-body-md text-error">
              {errorMessage}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button onClick={onReject} disabled={submitting} className="!h-11">
              {c.reject}
            </Button>
            <Button variant="primary" onClick={onResolve} disabled={submitting} className="!h-11">
              {c.resolve}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-6 border-t border-hairline pt-6 text-center text-body-md text-ink-subtle">
          {c.closedPanel}
          {report.processedAt && (
            <span className="mt-1 block font-mono text-code-sm">
              {formatDateTime(report.processedAt)}
            </span>
          )}
        </p>
      )}
    </Card>
  );
};
