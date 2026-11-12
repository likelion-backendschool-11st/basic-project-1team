import React from 'react';
import { reportComplete as C } from '../../data/mockData';
import type { ReportTarget } from '../../data/types';
import { useClipboard } from '../../hooks/useClipboard';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';

interface ReportCompleteModalProps {
  readonly reasonLabel: string;
  readonly target: ReportTarget;
  /** 확인 버튼 문구 (예: 질문 목록으로 이동) */
  readonly confirmLabel: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export const ReportCompleteModal: React.FC<ReportCompleteModalProps> = ({
  reasonLabel,
  target,
  confirmLabel,
  onClose,
  onConfirm,
}) => {
  const clipboard = useClipboard();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-margin overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-complete-title"
        className="relative w-full max-w-[540px] bg-surface-1 rounded-2xl p-space-xl shadow-2xl flex flex-col gap-space-lg overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary-container/10 blur-3xl pointer-events-none rounded-full" />
        <button
          type="button"
          aria-label={C.close}
          onClick={onClose}
          className="absolute top-space-md right-space-md w-8 h-8 rounded-lg bg-surface-2/60 text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors flex items-center justify-center"
        >
          <Icon name="close" className="text-[18px]" />
        </button>

        <div className="flex flex-col items-center text-center pt-space-xs">
          <div className="relative mb-space-md">
            <div className="w-14 h-14 rounded-2xl bg-semantic-success-surface flex items-center justify-center text-secondary shadow-lg shadow-secondary/10">
              <Icon name="shield_with_heart" filled className="text-[30px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-1 flex items-center justify-center">
              <Icon name="check_circle" className="text-[14px] text-secondary" />
            </div>
          </div>
          <h2
            id="report-complete-title"
            className="text-headline-md font-headline-md text-ink font-semibold tracking-tight mb-1.5"
          >
            {C.title}
          </h2>
          <p className="text-body-sm font-body-sm text-ink-subtle max-w-[420px] leading-relaxed">
            {C.description}
          </p>
        </div>

        <div className="bg-surface-2 rounded-xl p-space-md flex flex-col gap-space-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="text-caption font-caption text-ink-tertiary">{C.receiptLabel}</span>
              <span className="text-code-inline font-code-inline text-ink font-medium tracking-tight">
                {C.receipt}
              </span>
            </div>
            <button
              type="button"
              title="접수번호 복사"
              onClick={() => clipboard.copy(C.receiptCopyValue)}
              className="group flex items-center gap-1 text-caption font-label-sm text-primary hover:text-primary-hover transition-colors px-1.5 py-0.5 rounded bg-surface-3 hover:bg-surface-container-high"
            >
              <Icon
                name="content_copy"
                className="text-[12px] group-hover:scale-110 transition-transform"
              />
              <span>{clipboard.copied ? C.copied : C.copy}</span>
            </button>
          </div>
          <div className="flex flex-col gap-1 pt-space-xs">
            <span className="text-caption font-caption text-ink-tertiary">{C.targetLabel}</span>
            <div className="text-body-sm font-body-sm text-ink font-medium line-clamp-1 flex items-center gap-1.5">
              <span className="text-primary-container text-caption font-label-sm">
                [{target.kindLabel}]
              </span>
              {target.title}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {target.tags.map((tag) => (
                <TagChip key={tag} label={tag} variant="muted" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-caption font-caption text-ink-tertiary">{C.reasonLabel}</span>
              <span className="text-body-sm font-body-sm text-ink font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-danger inline-block" />
                {reasonLabel}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-caption font-caption text-ink-tertiary">{C.statusLabel}</span>
              <span className="text-body-sm font-body-sm text-secondary font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
                {C.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-space-xs px-1">
          {C.notices.map((n) => (
            <div
              key={n.icon}
              className="flex items-start gap-space-xs text-body-sm font-body-sm text-ink-subtle"
            >
              <Icon name={n.icon} className="text-ink-tertiary text-[17px] shrink-0 mt-0.5" />
              <span>
                <strong className="text-ink font-medium">{n.strong}</strong> {n.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary-focus text-on-primary-container text-label-md font-label-md transition-all shadow-md flex items-center justify-center gap-1 font-semibold"
          >
            <span>{confirmLabel}</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
