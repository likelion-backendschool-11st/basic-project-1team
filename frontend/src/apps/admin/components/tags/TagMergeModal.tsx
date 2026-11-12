import React from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import { useTagPicker } from '../../hooks/useTagPicker';
import type { Tag } from '../../types';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { TagChip } from '../ui/TagChip';

interface TagMergeModalProps {
  readonly source: Tag;
  readonly tags: readonly Tag[];
  readonly onClose: () => void;
  readonly onMerge: (targetName: string) => void;
}

/** Render with `key={source.name}` so the picker resets for each source tag. */
export const TagMergeModal: React.FC<TagMergeModalProps> = ({ source, tags, onClose, onMerge }) => {
  const m = tagsCopy.merge;
  const picker = useTagPicker(tags, source.name);

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
          <Button variant="primary" icon="call_merge" disabled={!picker.selected} onClick={() => picker.selected && onMerge(picker.selected.name)}>
            {m.submit}
          </Button>
        </>
      }
    >
      <label htmlFor="target-tag-search" className="mb-2 block text-label-md font-semibold text-ink">
        {m.searchLabel}
      </label>
      <div className="relative">
        <div className="flex h-12 items-center gap-2 rounded-lg border-2 border-primary-container bg-canvas px-3">
          {picker.selected ? (
            <button
              type="button"
              onClick={picker.clear}
              aria-label={m.clearSelection}
              className="flex items-center gap-2 rounded border border-hairline-strong bg-surface-2 px-2 py-0.5 font-mono text-code-sm text-primary"
            >
              {picker.selected.name}
              <Icon name="check_circle" className="!text-[16px] text-tertiary" />
            </button>
          ) : (
            <input
              id="target-tag-search"
              autoFocus
              autoComplete="off"
              placeholder={m.searchPlaceholder}
              value={picker.query}
              onChange={(event) => picker.setQuery(event.target.value)}
              className="h-full flex-1 border-0 bg-transparent p-0 font-mono text-body-md text-ink placeholder:font-sans placeholder:text-ink-tertiary focus:ring-0"
            />
          )}
          <Icon name="search" className="ml-auto !text-[20px] text-ink-subtle" />
        </div>

        {picker.suggestions.length > 0 && (
          <ul role="listbox" className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-hairline-strong bg-surface-3 py-1">
            {picker.suggestions.map((tag) => (
              <li key={tag.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => picker.select(tag)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-surface-4"
                >
                  <span className="font-mono text-code-sm text-primary">{tag.name}</span>
                  <span className="text-body-sm text-ink-subtle">
                    {tag.usage.toLocaleString()}
                    {ui.countUnit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-2 text-body-sm text-ink-subtle">{m.searchHint}</p>

      {picker.selected && (
        <div className="mt-5 flex gap-3 rounded-lg border border-hairline bg-surface-1 p-4">
          <Icon name="info" className="mt-0.5 text-primary" />
          <p className="text-body-md font-semibold leading-relaxed text-ink">
            {m.summaryPrefix} {source.usage.toLocaleString()}
            {ui.countUnit}
            {m.summaryMoved} <TagChip name={picker.selected.name} className="!py-0" /> {m.summaryMovedSuffix}{' '}
            <TagChip name={source.name} tone="danger" className="!py-0" /> {m.summaryDeleted}
          </p>
        </div>
      )}
    </Modal>
  );
};
