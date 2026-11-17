import React, { useEffect, useId } from 'react';
import { Icon } from './Icon';
import { buttonClasses } from './buttonStyles';

interface ConfirmDialogProps {
  readonly title: string;
  readonly description: string;
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly icon?: string;
  /** 취소 버튼, 바깥 클릭, Esc */
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** 되돌리기 어려운 동작 전에 한 번 더 묻는 확인 창. 실수로 누르지 않도록 취소 버튼에 먼저 초점을 둔다 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  cancelLabel,
  confirmLabel,
  icon = 'warning',
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-margin">
      <div className="absolute inset-0 bg-canvas/75 backdrop-blur-[6px]" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex w-full max-w-[400px] flex-col items-center gap-space-md rounded-2xl border border-hairline bg-surface-1 p-space-lg text-center shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-semantic-danger/15 text-semantic-danger">
          <Icon name={icon} className="text-[26px]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 id={titleId} className="font-headline-sm text-headline-sm font-semibold text-ink">
            {title}
          </h2>
          <p id={descriptionId} className="font-body-sm text-body-sm text-ink-subtle">
            {description}
          </p>
        </div>
        <div className="flex w-full gap-space-xs pt-space-xs">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className={buttonClasses('secondary', 'md', true, 'flex-1')}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={buttonClasses('danger', 'md', true, 'flex-1 font-semibold')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
