import { useId } from 'react';
import { confirmDeleteCopy as c, ui } from '../../data/mockData';
import type { ConfirmDeleteState } from '../../hooks/useConfirmDelete';
import { Button } from './Button';
import { Icon } from './Icon';
import { Modal } from './Modal';

interface ConfirmDeleteModalProps {
  readonly state: ConfirmDeleteState;
}

/** 영구 삭제 확인 모달. 숨김과 달리 되돌릴 수 없다는 점을 알리고, 한 번 더 눌러야 삭제한다. */
export function ConfirmDeleteModal({ state }: ConfirmDeleteModalProps) {
  const titleId = useId();
  const { request } = state;

  return (
    <Modal
      open={request !== null}
      onClose={state.close}
      titleId={titleId}
      title={request ? `${request.target} ${c.titleSuffix}` : ''}
      footer={
        <>
          <Button onClick={state.close}>{ui.cancel}</Button>
          <Button variant="danger" icon="delete_forever" onClick={state.confirm} autoFocus>
            {c.confirm}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-error/30 bg-error-container/20 p-4 text-body-md text-ink">
        <Icon name="warning" className="mt-0.5 shrink-0 text-error" />
        <div className="space-y-1.5">
          <p className="font-semibold">{c.irreversible}</p>
          {request?.notes?.map((note) => (
            <p key={note} className="text-ink-muted">
              {note}
            </p>
          ))}
          <p className="text-ink-subtle">{c.hideInstead}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;
