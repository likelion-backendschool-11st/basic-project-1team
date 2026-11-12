import { Link } from 'react-router-dom';
import { AUTO_HIDE_THRESHOLD, reportReasonLabels, reportSanctionTypeOptions, reportTargetLabels, reportsCopy, sanctionDurations, ui } from '../../data/mockData';
import type { Report, ReportSanctionType, ReportTarget, SanctionDays } from '../../types';
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
  readonly onResolve: () => void;
  readonly onReject: () => void;
}

const targetRoutes: Record<ReportTarget, string> = {
  question: '/qna',
  answer: '/qna',
  post: '/board',
  comment: '/board',
};

export function ReportDetailPanel({
  report,
  hideTarget,
  onHideTargetChange,
  sanctionType,
  onSanctionTypeChange,
  sanctionDays,
  onSanctionDaysChange,
  onResolve,
  onReject,
}: ReportDetailPanelProps) {
  const c = reportsCopy;

  if (!report) {
    return (
      <Card as="aside" className="w-[400px] shrink-0 self-start text-center text-body-md text-ink-subtle">
        {c.emptyPanel}
      </Card>
    );
  }

  const pending = report.status === 'pending';
  // 대상이 삭제된 신고는 숨김·제재 없이 상태만 바꾼다 (API_SPEC 10.6)
  const targetDeleted = report.fullText === null;

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
          {report.reportedAt} {report.reportedTime}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-label-md font-semibold text-ink">
          {reportTargetLabels[report.target]} #{report.targetId}
          {report.author && ` · ${c.authorPrefix} ${report.author}`}
        </p>
        {!targetDeleted && (
          <Link to={targetRoutes[report.target]} className="flex items-center gap-0.5 text-label-md text-primary hover:text-ink">
            {c.viewOriginal}
            <Icon name="arrow_outward" className="!text-[16px]" />
          </Link>
        )}
      </div>
      <blockquote
        className={`mt-3 rounded-lg border border-hairline bg-surface-2 p-4 text-body-md leading-relaxed ${targetDeleted ? 'text-ink-tertiary' : 'text-ink-muted'}`}
      >
        {report.fullText ?? c.deletedTarget}
      </blockquote>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-hairline bg-surface-2/60 px-4 py-3 text-body-md text-ink-subtle">
        <Icon name="info" className="text-primary" />
        {c.duplicatePrefix} <strong className="font-semibold text-primary">{report.duplicateCount}
          {ui.countUnit}
        </strong> {c.duplicateSuffix}
      </div>
      {pending && !targetDeleted && report.duplicateCount >= AUTO_HIDE_THRESHOLD && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-body-md text-ink">
          <Icon name="visibility_off" className="mt-0.5 shrink-0 text-error" />
          {c.autoHidden}
        </div>
      )}

      {pending ? (
        <div className="mt-6 space-y-5 border-t border-hairline pt-6">
          {targetDeleted ? (
            <p className="text-body-md text-ink-subtle">{c.deletedTargetNote}</p>
          ) : (
            <>
              <Checkbox label={c.hideTarget} checked={hideTarget} onChange={onHideTargetChange} className="!text-body-lg !font-semibold" />
              <div>
                <FieldLabel htmlFor="report-sanction">{c.sanctionLabel}</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Select id="report-sanction" options={reportSanctionTypeOptions} value={sanctionType} onChange={onSanctionTypeChange} />
                  <Select
                    aria-label={c.sanctionDurationLabel}
                    options={sanctionDurations}
                    value={sanctionDays}
                    onChange={onSanctionDaysChange}
                    disabled={sanctionType === 'none'}
                  />
                </div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button onClick={onReject} className="!h-11">
              {c.reject}
            </Button>
            <Button variant="primary" onClick={onResolve} className="!h-11">
              {c.resolve}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-6 border-t border-hairline pt-6 text-center text-body-md text-ink-subtle">{c.closedPanel}</p>
      )}
    </Card>
  );
}

export default ReportDetailPanel;
