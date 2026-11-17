import React from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import type { Tag } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { TagChip } from '../ui/TagChip';

interface TagUnmergeModalProps {
  readonly tag: Tag;
  readonly submitting: boolean;
  /** 서버가 병합 취소를 거절한 이유 (기록 없는 병합, 대상이 다시 병합·차단됨 등) */
  readonly errorMessage: string | null;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

/** 병합 취소 확인 창 (API_SPEC 10.5). 무엇이 돌아오고 무엇이 그대로인지 알리고 한 번 더 눌러야 실행한다. */
export const TagUnmergeModal: React.FC<TagUnmergeModalProps> = ({
  tag,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const u = tagsCopy.unmergeModal;

  return (
    <Modal
      open
      onClose={onClose}
      titleId="unmerge-modal-title"
      title={u.title}
      subtitle={
        <p className="flex flex-wrap items-center gap-1.5">
          <TagChip name={tag.name} className="!text-ink-muted" />
          {tag.mergedInto && (
            <>
              <Icon name="arrow_forward" className="!text-[16px]" />
              <TagChip name={tag.mergedInto.name} />
            </>
          )}
          {u.subtitleSuffix}
        </p>
      }
      footer={
        <>
          <Button onClick={onClose}>{ui.cancel}</Button>
          <Button variant="primary" icon="undo" disabled={submitting} onClick={onConfirm} autoFocus>
            {u.submit}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 rounded-lg border border-hairline bg-surface-1 p-4 text-body-md">
        <Icon name="info" className="mt-0.5 shrink-0 text-primary" />
        <div className="space-y-1.5">
          <p className="font-semibold text-ink">{u.restored}</p>
          <p className="text-ink-muted">{u.targetKept}</p>
          <p className="text-ink-subtle">{u.notRestored}</p>
        </div>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
};
