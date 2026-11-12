import React, { useEffect } from 'react';
import type { LoginPromptProps } from '../../../../shared/LoginGate';
import { loginRequired as C } from '../../data/mockData';
import { Icon } from './Icon';

/** 로그인 안내 팝업 (LoginGateProvider 가 띄운다). */
export const LoginRequiredModal: React.FC<LoginPromptProps> = ({ onClose, onConfirm }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-margin">
      <div className="absolute inset-0 bg-canvas/75 backdrop-blur-[6px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        className="relative w-full max-w-[400px] bg-surface-1 border border-hairline rounded-2xl p-space-lg shadow-2xl flex flex-col items-center text-center gap-space-md"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
          <Icon name="lock" className="text-[26px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2
            id="login-required-title"
            className="text-headline-sm font-headline-sm text-ink font-semibold"
          >
            {C.title}
          </h2>
          <p className="text-body-sm font-body-sm text-ink-subtle">{C.description}</p>
        </div>
        <div className="w-full flex gap-space-xs pt-space-xs">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-space-md py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink font-label-md text-label-md transition-colors"
          >
            {C.cancel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="flex-1 px-space-md py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors"
          >
            {C.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
