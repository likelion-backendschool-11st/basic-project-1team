import React, { useId } from 'react';
import { confirmDeleteCopy, confirmHideAcceptedCopy as c, ui } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

interface HideAcceptedModalProps {
  /** 숨기려는 채택 답변 id. null 이면 닫힘 */
  readonly answerId: number | null;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

/** 채택된 답변 숨김 확인. 숨김은 되돌릴 수 있지만 풀린 채택은 돌아오지 않아 한 번 더 묻는다 (API_SPEC 10.3) */
export const HideAcceptedModal: React.FC<HideAcceptedModalProps> = ({
  answerId,
  onConfirm,
  onClose,
}) => {
  const titleId = useId();

  return (
    <Modal
      open={answerId !== null}
      onClose={onClose}
      titleId={titleId}
      title={`${confirmDeleteCopy.targets.answer} #${answerId} ${c.titleSuffix}`}
      footer={
        <>
          <Button onClick={onClose}>{ui.cancel}</Button>
          <Button variant="primary" icon="visibility_off" onClick={onConfirm} autoFocus>
            {ui.hide}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-primary-container/40 bg-primary-container/10 p-4 text-body-md text-ink">
        <Icon name="info" className="mt-0.5 shrink-0 text-primary" />
        <div className="space-y-1.5">
          <p className="font-semibold">{c.released}</p>
          <p className="text-ink-muted">{c.notRestored}</p>
        </div>
      </div>
    </Modal>
  );
};
