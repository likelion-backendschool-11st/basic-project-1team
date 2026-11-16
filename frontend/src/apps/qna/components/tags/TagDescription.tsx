import React from 'react';
import { isLoggedIn } from '../../../../shared/auth';
import { tagDetailPage as T } from '../../data/mockData';
import type { TagDetail } from '../../data/types';
import { TAG_DESCRIPTION_MAX, useTagDescriptionEdit } from '../../hooks/useTagDescriptionEdit';
import { Icon } from '../common/Icon';

interface TagDescriptionProps {
  readonly tag: TagDetail;
  readonly onSaved: (tag: TagDetail) => void;
}

/**
 * 태그 설명. 수정할 수 있는 회원(ADMIN, Diamond 이상)에게만 수정 버튼을 보여 준다 (REQ-TAG-003).
 * 로그인했지만 레벨이 모자라면 조건을 안내한다.
 */
export const TagDescription: React.FC<TagDescriptionProps> = ({ tag, onSaved }) => {
  const edit = useTagDescriptionEdit(tag, onSaved);

  if (edit.editing) {
    return (
      <div className="flex flex-col gap-space-xs">
        <label htmlFor="tag-description" className="sr-only">
          {T.editLabel}
        </label>
        <textarea
          id="tag-description"
          value={edit.draft}
          onChange={(e) => edit.setDraft(e.target.value)}
          rows={3}
          placeholder={T.editPlaceholder}
          className="w-full resize-none rounded-lg bg-surface-2 border border-hairline px-space-sm py-2 text-ink font-body-md text-body-md placeholder-ink-tertiary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        />
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <span className="font-code-inline text-[11px] text-ink-tertiary">
            {edit.length} / {TAG_DESCRIPTION_MAX}
          </span>
          <div className="flex gap-space-xs">
            <button
              type="button"
              onClick={edit.cancel}
              disabled={edit.saving}
              className="px-space-sm py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle font-label-md text-label-md transition-colors"
            >
              {T.editCancel}
            </button>
            <button
              type="button"
              onClick={() => void edit.save()}
              disabled={edit.saving}
              className="px-space-sm py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors disabled:opacity-60"
            >
              {edit.saving ? T.editSaving : T.editSave}
            </button>
          </div>
        </div>
        {edit.errorMessage && (
          <p role="alert" className="font-body-sm text-body-sm text-semantic-danger">
            {edit.errorMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-space-sm">
        <p
          className={`font-body-md text-body-md ${tag.description ? 'text-ink-muted' : 'text-ink-tertiary'}`}
        >
          {tag.description ?? T.noDescription}
        </p>
        {tag.canEdit && (
          <button
            type="button"
            onClick={edit.start}
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-ink font-label-sm text-label-sm transition-colors"
          >
            <Icon name="edit" className="text-[14px]" />
            {T.editButton}
          </button>
        )}
      </div>
      {!tag.canEdit && isLoggedIn() && (
        <p className="font-caption text-caption text-ink-tertiary">{T.editHint}</p>
      )}
    </div>
  );
};
