import React from 'react';
import { Icon } from './Icon';

interface ToastProps {
  readonly message: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/** 화면 위쪽 가운데에 잠시 떠 있는 성공 안내. 사라지는 시간은 useFlashToast 가 정한다 */
export const Toast: React.FC<ToastProps> = ({ message, closeLabel, onClose }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed left-1/2 top-24 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-space-sm rounded-xl bg-surface-2/95 p-space-sm shadow-2xl ring-1 ring-white/5 backdrop-blur-md"
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-semantic-success-surface text-semantic-success">
      <Icon name="check_circle" className="text-[16px]" />
    </span>
    <p className="min-w-0 flex-1 font-body-sm text-body-sm text-ink">{message}</p>
    <button
      type="button"
      aria-label={closeLabel}
      onClick={onClose}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-tertiary transition-colors hover:bg-surface-3 hover:text-ink"
    >
      <Icon name="close" className="text-[16px]" />
    </button>
  </div>
);
