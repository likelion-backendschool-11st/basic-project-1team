import React from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import { useTagPicker } from '../../hooks/useTagPicker';
import type { Tag } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { TagChip } from '../ui/TagChip';
import { TagPickerField } from './TagPickerField';

interface TagMergeModalProps {
  readonly source: Tag;
  readonly submitting: boolean;
  /** 서버가 병합을 거절한 이유 (차단·병합된 대상 등) */
  readonly errorMessage: string | null;
  readonly onClose: () => void;
  readonly onMerge: (targetId: number) => void;
}

/** Render with `key={source.id}` so the picker resets for each source tag. */
export const TagMergeModal: React.FC<TagMergeModalProps> = ({
  source,
  submitting,
  errorMessage,
  onClose,
  onMerge,
}) => {
  const m = tagsCopy.merge;
  const picker = useTagPicker(source.id);

  return (
    <Modal
      open
      onClose={onClose}
      titleId="merge-modal-title"
      title={m.title}
      subtitle={
        <p className="flex flex-wrap items-center gap-1.5">
          <TagChip name={source.name} className="!text-ink-muted" />
          {m.subtitleSuffix}
        </p>
      }
      footer={
        <>
          <Button onClick={onClose}>{ui.cancel}</Button>
          <Button
            variant="primary"
            icon="call_merge"
            disabled={!picker.selected || submitting}
            onClick={() => picker.selected && onMerge(picker.selected.id)}
          >
            {m.submit}
          </Button>
        </>
      }
    >
      <TagPickerField
        picker={picker}
        inputId="target-tag-search"
        label={m.searchLabel}
        placeholder={m.searchPlaceholder}
        hint={m.searchHint}
        clearLabel={m.clearSelection}
      />
      {errorMessage && (
        <p role="alert" className="mt-2 text-body-sm text-error">
          {errorMessage}
        </p>
      )}

      {picker.selected && (
        <div className="mt-5 flex gap-3 rounded-lg border border-hairline bg-surface-1 p-4">
          <Icon name="info" className="mt-0.5 text-primary" />
          <p className="text-body-md font-semibold leading-relaxed text-ink">
            {m.summaryPrefix} {source.questionCount.toLocaleString()}
            {ui.countUnit}
            {m.summaryMoved} <TagChip name={picker.selected.name} className="!py-0" />{' '}
            {m.summaryMovedSuffix} <TagChip name={source.name} tone="danger" className="!py-0" />{' '}
            {m.summaryDeleted}
          </p>
        </div>
      )}
      {/* 병합 취소는 병합 때 옮긴 질문만 되돌린다 (API_SPEC 10.5) */}
      <p className="mt-3 flex items-start gap-1.5 text-body-sm text-ink-subtle">
        <Icon name="info" className="mt-0.5 !text-[16px]" />
        {m.undoNote}
      </p>
    </Modal>
  );
};
