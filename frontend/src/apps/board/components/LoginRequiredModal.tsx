import React, { useEffect } from 'react';
import type { LoginPromptProps } from '../../../shared/LoginGate';
import { labels } from '../data/mockData';
import { Icon } from './Icon';

/** 로그인 안내 팝업 (LoginGateProvider 가 띄운다). */
export const LoginRequiredModal: React.FC<LoginPromptProps> = ({ onClose, onConfirm }) => {
  const c = labels.loginRequired;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border p-6 text-center shadow-xl border-hairline bg-surface-1"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/15 text-primary-container text-primary">
          <Icon name="lock" className="text-[26px]" />
        </span>
        <div className="space-y-1.5">
          <h2 id="login-required-title" className="text-lg font-bold text-ink">
            {c.title}
          </h2>
          <p className="text-sm text-ink-muted">{c.description}</p>
        </div>
        <div className="flex w-full gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors border-hairline-strong bg-surface-3 text-ink-muted hover:bg-surface-2"
          >
            {c.cancel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-container"
          >
            {c.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
