import React, { useEffect } from 'react';
import { editHistoryLabels as L } from '../../data/mockData';
import type { EditHistory } from '../../data/types';
import { Icon } from '../common/Icon';

interface EditHistoryModalProps {
  /** 모달 제목에 붙는 대상. 예: "질문", "답변" */
  readonly target: string;
  readonly histories: readonly EditHistory[];
  readonly onClose: () => void;
}

/** 수정일시를 누르면 뜨는 수정 이력 목록 (API_SPEC GET .../edit-histories). 최신순. */
export const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ target, histories, onClose }) => {
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
        aria-labelledby="edit-history-title"
        className="relative w-full max-w-[480px] max-h-[80vh] flex flex-col bg-surface-1 border border-hairline rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-hairline">
          <h2 id="edit-history-title" className="flex items-center gap-2 text-headline-sm font-headline-sm text-ink font-semibold">
            <Icon name="history" className="text-[20px] text-primary" />
            {target} {L.title}
            <span className="font-code-inline text-caption text-ink-tertiary">{histories.length}</span>
          </h2>
          <button
            type="button"
            aria-label={L.close}
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors flex items-center justify-center"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        <ol className="overflow-y-auto divide-y divide-hairline">
          {histories.map((h) => (
            <li key={h.id} className="px-space-lg py-space-sm flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-code-inline text-code-inline text-ink">{h.editedAt}</span>
                <span className="font-body-sm text-body-sm text-ink-subtle">{h.editor}</span>
              </div>
              <p className={`font-body-sm text-body-sm ${h.editReason ? 'text-ink-muted' : 'text-ink-tertiary italic'}`}>
                {h.editReason ?? L.noReason}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
