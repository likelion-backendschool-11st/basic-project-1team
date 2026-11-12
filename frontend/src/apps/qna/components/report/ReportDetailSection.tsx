import React from 'react';
import { reportPage as R } from '../../data/mockData';
import type { FormatCommand } from '../../hooks/useMarkdownEditor';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { FormatToolbar } from '../editor/FormatToolbar';
import { reportTools } from '../editor/toolbarTools';

interface ReportDetailSectionProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly textareaRef: React.RefObject<HTMLTextAreaElement>;
  readonly onCommand: (cmd: FormatCommand) => void;
  readonly onPickFiles: () => void;
}

export const ReportDetailSection: React.FC<ReportDetailSectionProps> = ({ value, onChange, textareaRef, onCommand, onPickFiles }) => (
  <Card className="p-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <label className="font-headline-sm text-headline-sm text-ink flex items-center gap-2" htmlFor="report-detail">
        <span>{R.detailTitle}</span>
        <span className="font-label-sm text-label-sm text-ink-tertiary font-normal">{R.detailOptional}</span>
      </label>
      <span className="font-code-inline text-code-inline text-ink-tertiary">
        {value.length} / {R.detailMax.toLocaleString()}자
      </span>
    </div>
    <div className="rounded-lg border border-hairline bg-surface-2 overflow-hidden focus-within:border-primary-focus transition-colors">
      <div className="h-9 px-3 bg-surface-1 border-b border-hairline flex items-center justify-between text-ink-tertiary">
        <div className="flex items-center gap-1">
          <FormatToolbar tools={reportTools} onCommand={onCommand} size="sm" />
        </div>
        <span className="font-caption text-caption text-ink-tertiary">{R.markdownSupport}</span>
      </div>
      <textarea
        id="report-detail"
        ref={textareaRef}
        value={value}
        maxLength={R.detailMax}
        onChange={(e) => onChange(e.target.value)}
        placeholder={R.detailPlaceholder}
        rows={6}
        className="w-full bg-transparent p-3.5 text-ink font-body-md text-body-md placeholder:text-ink-tertiary focus:outline-none resize-y min-h-[140px]"
      />
    </div>
    <div className="flex flex-col gap-2 pt-2">
      <span className="font-label-md text-label-md text-ink flex items-center gap-1.5">
        <Icon name="attach_file" className="text-[16px] text-ink-subtle" />
        {R.evidenceTitle}
      </span>
      <button
        type="button"
        onClick={onPickFiles}
        className="border border-dashed border-hairline-strong hover:border-outline hover:bg-surface-2/40 transition-colors rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-center bg-surface-2/20"
      >
        <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-ink-subtle">
          <Icon name="add_photo_alternate" className="text-[20px]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="font-body-sm text-body-sm text-ink-muted">
            <span className="text-primary-hover font-medium">{R.evidenceLink}</span>
            {R.evidenceText}
          </p>
          <p className="font-caption text-caption text-ink-tertiary">{R.evidenceHint}</p>
        </div>
      </button>
    </div>
    <div className="p-3.5 rounded-lg bg-surface-2 border border-hairline flex items-start gap-3 mt-1">
      <Icon name="info" className="text-tertiary text-[18px] shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <span className="font-label-md text-label-md text-ink">{R.noticeTitle}</span>
        <p className="font-caption text-caption text-ink-subtle leading-relaxed">
          {R.noticePrefix}
          <strong>{R.noticeStrong1}</strong>
          {R.noticeMiddle}
          <strong>{R.noticeStrong2}</strong>
          {R.noticeSuffix}
        </p>
      </div>
    </div>
  </Card>
);
