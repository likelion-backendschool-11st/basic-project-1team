import React, { type ReactNode } from 'react';
import { ui } from '../../data/mockData';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Icon } from './Icon';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly titleId: string;
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, titleId, title, subtitle, footer, children }) => {
  useEscapeKey(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className="specular-card w-full max-w-[560px] rounded-xl border border-hairline-strong bg-surface-2 p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-headline-md font-bold text-ink">
              {title}
            </h2>
            {subtitle && <div className="mt-1.5 text-body-md text-ink-muted">{subtitle}</div>}
          </div>
          <button
            type="button"
            aria-label={ui.close}
            onClick={onClose}
            className="rounded-lg p-1 text-ink-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <Icon name="close" className="!text-[20px]" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2 border-t border-hairline pt-6">{footer}</div>}
      </div>
    </div>
  );
};
