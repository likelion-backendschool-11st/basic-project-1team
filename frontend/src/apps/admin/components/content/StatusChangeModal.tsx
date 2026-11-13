import React, { useId, useState } from 'react';
import { statusChangeCopy as c, ui } from '../../data/mockData';
import type { StatusChangeRequest } from '../../hooks/useContentModeration';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/FormControls';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';

interface StatusChangeModalProps {
  readonly request: StatusChangeRequest | null;
  readonly onConfirm: (reason: string) => void;
  readonly onClose: () => void;
}

interface ReasonFormProps {
  readonly request: StatusChangeRequest;
  readonly onConfirm: (reason: string) => void;
  readonly onClose: () => void;
}

const ReasonForm: React.FC<ReasonFormProps> = ({ request, onConfirm, onClose }) => {
  const titleId = useId();
  const [reason, setReason] = useState('');
  const hiding = request.nextStatus === 'hidden';

  return (
    <Modal
      open
      onClose={onClose}
      titleId={titleId}
      title={`${request.target} ${hiding ? ui.hide : ui.restore}`}
      subtitle={hiding ? c.hideDescription : c.restoreDescription}
      footer={
        <>
          <Button onClick={onClose}>{ui.cancel}</Button>
          <Button
            variant="primary"
            icon={hiding ? 'visibility_off' : 'visibility'}
            onClick={() => onConfirm(reason)}
          >
            {hiding ? ui.hide : ui.restore}
          </Button>
        </>
      }
    >
      {request.notes.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary-container/40 bg-primary-container/10 p-4 text-body-md text-ink">
          <Icon name="info" className="mt-0.5 shrink-0 text-primary" />
          <div className="space-y-1.5">
            {request.notes.map((note, index) => (
              <p key={note} className={index === 0 ? 'font-semibold' : 'text-ink-muted'}>
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
      <label htmlFor={`${titleId}-reason`} className="mb-2 block text-body-lg text-ink-muted">
        {c.reasonLabel}
      </label>
      <TextArea
        id={`${titleId}-reason`}
        rows={3}
        maxLength={c.reasonMax}
        placeholder={c.reasonPlaceholder}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        autoFocus
      />
      <p className="mt-2 text-right font-mono text-code-sm text-ink-tertiary">
        {reason.length} / {c.reasonMax}
        {ui.charUnit}
      </p>
    </Modal>
  );
};

/**
 * 숨김·복구 확인 창. 사유는 선택이고 활동 로그에 남는다 (API_SPEC 10.3).
 * 채택된 답변처럼 함께 바뀌는 것이 있으면 notes 로 먼저 알린다.
 */
export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  request,
  onConfirm,
  onClose,
}) => {
  if (!request) return null;
  // 대상이 바뀌면 입력한 사유를 비운다
  return (
    <ReasonForm
      key={`${request.target}-${request.nextStatus}`}
      request={request}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
