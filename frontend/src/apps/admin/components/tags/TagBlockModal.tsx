import React from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import { useTagPicker } from '../../hooks/useTagPicker';
import type { Tag, TagBlockImpact } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { TagChip } from '../ui/TagChip';
import { TagPickerField } from './TagPickerField';

interface TagBlockModalProps {
  readonly tag: Tag;
  /** 불러오는 중이면 null */
  readonly impact: TagBlockImpact | null;
  readonly impactError: string | null;
  readonly submitting: boolean;
  /** 서버가 삭제를 거절한 이유 (대체 태그 누락·차단된 대체 태그 등) */
  readonly errorMessage: string | null;
  readonly onClose: () => void;
  readonly onConfirm: (replacementId: number | undefined) => void;
}

/**
 * 태그 삭제(차단) 확인 창 (API_SPEC 10.5 DELETE, REQ-ADMIN-010). 빠지는 질문 수를 알리고,
 * 태그가 0개가 되는 질문이 있으면 대체 태그를 골라야 삭제 버튼이 눌린다.
 * Render with `key={tag.id}` so the picker resets for each tag.
 */
export const TagBlockModal: React.FC<TagBlockModalProps> = ({
  tag,
  impact,
  impactError,
  submitting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const b = tagsCopy.block;
  const picker = useTagPicker(tag.id);
  const needsReplacement = (impact?.untaggedQuestionCount ?? 0) > 0;
  const canSubmit =
    impact !== null && !submitting && (!needsReplacement || picker.selected !== null);

  return (
    <Modal
      open
      onClose={onClose}
      titleId="block-modal-title"
      title={b.title}
      subtitle={
        <p className="flex flex-wrap items-center gap-1.5">
          <TagChip name={tag.name} tone="danger" />
          {b.subtitleSuffix}
        </p>
      }
      footer={
        <>
          <Button onClick={onClose}>{ui.cancel}</Button>
          <Button
            variant="danger"
            icon="delete_forever"
            disabled={!canSubmit}
            onClick={() => onConfirm(needsReplacement ? picker.selected?.id : undefined)}
          >
            {b.submit}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-error/30 bg-error-container/20 p-4 text-body-md text-ink">
        <Icon name="warning" className="mt-0.5 shrink-0 text-error" />
        <div className="space-y-1.5">
          {impactError ? (
            <p role="alert" className="text-error">
              {impactError}
            </p>
          ) : impact === null ? (
            <p className="text-ink-muted">{b.loadingImpact}</p>
          ) : (
            <>
              <p className="font-semibold">
                {impact.questionCount > 0 ? b.inUse(impact.questionCount) : b.notUsed}
              </p>
              {needsReplacement && (
                <p className="font-semibold text-error">
                  {b.untagged(impact.untaggedQuestionCount)}
                </p>
              )}
            </>
          )}
          <p className="text-ink-muted">{b.blockedNote}</p>
        </div>
      </div>

      {needsReplacement && (
        <div className="mt-5">
          <TagPickerField
            picker={picker}
            inputId="replacement-tag-search"
            label={b.searchLabel}
            placeholder={b.searchPlaceholder}
            hint={b.searchHint}
            clearLabel={b.clearSelection}
          />
          <p className="mt-3 flex items-start gap-1.5 text-body-sm text-ink-subtle">
            <Icon name="notifications" className="mt-0.5 !text-[16px]" />
            {b.notifyNote}
          </p>
        </div>
      )}

      {errorMessage && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
};
