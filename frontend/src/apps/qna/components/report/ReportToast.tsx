import React from 'react';
import { reportComplete as C } from '../../data/mockData';
import { useTimedToast } from '../../hooks/useTimedToast';
import { Icon } from '../common/Icon';

interface ReportToastProps {
  readonly onUndo: () => void;
}

export const ReportToast: React.FC<ReportToastProps> = ({ onUndo }) => {
  const toast = useTimedToast(C.toastDurationMs);
  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed top-28 right-6 z-[60] w-full max-w-sm bg-surface-2/95 backdrop-blur-md rounded-xl p-space-sm shadow-2xl transition-all duration-300 flex items-start gap-space-sm ring-1 ring-white/5 overflow-hidden ${
        toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className="w-7 h-7 rounded-lg bg-semantic-success-surface flex items-center justify-center shrink-0 mt-0.5 text-secondary">
        <Icon name="verified_user" className="text-[16px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="text-label-md font-label-md text-ink font-medium tracking-tight">
            {C.toastTitle}
          </span>
          <span className="text-caption font-code-inline text-ink-tertiary">{C.toastTime}</span>
        </div>
        <p className="text-caption font-caption text-ink-subtle truncate mt-0.5">
          <span className="text-secondary font-code-inline">{C.toastCode}</span>
          {C.toastBody}
        </p>
        <div className="flex items-center gap-space-md mt-2">
          <button
            type="button"
            onClick={() => {
              toast.dismiss();
              onUndo();
            }}
            className="text-caption font-label-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            <Icon name="undo" className="text-[13px]" />
            {C.toastUndo}
          </button>
          <span className="text-ink-tertiary text-caption">•</span>
          <button
            type="button"
            onClick={toast.dismiss}
            className="text-caption font-caption text-ink-tertiary hover:text-ink-subtle transition-colors"
          >
            {C.toastClose}
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-container-highest overflow-hidden">
        <div
          className="h-full bg-primary-container ease-linear"
          style={{
            width: toast.running ? '0%' : '100%',
            transition: `width ${C.toastDurationMs}ms linear`,
          }}
        />
      </div>
    </aside>
  );
};
