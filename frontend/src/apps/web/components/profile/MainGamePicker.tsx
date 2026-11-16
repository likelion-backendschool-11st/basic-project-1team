import React, { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { stripInvalidTagChars } from '../../../../shared/tag';
import { useTagSearch } from '../../hooks/useTagSearch';
import { Icon } from '../ui/Icon';
import { StatusMessage } from '../ui/StatusMessage';
import { mypageEditContent, type MainGameTag } from '../../data/mockData';

const c = mypageEditContent.mainGames;

interface MainGamePickerProps {
  readonly value: readonly MainGameTag[];
  readonly onChange: (next: readonly MainGameTag[]) => void;
  /** 저장할 때 서버가 거절한 이유 (MAIN_GAME_TAG_INVALID 등) */
  readonly error: string | null;
}

/**
 * 이미 있는 태그 중에서 주력 게임을 최대 5개까지 고른다 (REQ-MYPAGE-UPDATE-005).
 * 새 태그는 만들지 않으므로 자동완성 목록에서 고른 것만 들어간다
 */
export const MainGamePicker: React.FC<MainGamePickerProps> = ({ value, onChange, error }) => {
  const inputId = useId();
  const listId = useId();
  const [keyword, setKeyword] = useState('');
  const { suggestions, loading, errorMessage, hasKeyword } = useTagSearch(keyword);
  const isFull = value.length >= c.max;
  const options = suggestions.filter((tag) => !value.some((picked) => picked.tagId === tag.id));

  const add = (tag: MainGameTag) => {
    if (isFull || value.some((picked) => picked.tagId === tag.tagId)) return;
    onChange([...value, tag]);
    setKeyword('');
  };

  const remove = (tagId: number) => onChange(value.filter((picked) => picked.tagId !== tagId));

  // Enter 는 목록의 첫 태그를 고른다. 폼 제출로 이어지지 않게 막는다
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const [first] = options;
    if (first) add({ tagId: first.id, name: first.name });
  };

  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="font-label-md text-label-md text-ink-muted">
          {c.label}
        </label>
        <span className="font-label-code text-label-code text-ink-tertiary">
          <span className="text-primary">{value.length}</span> / {c.max}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag.tagId}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-2 py-1 pl-3 pr-1 font-label-code text-label-code text-ink"
            >
              #{tag.name}
              <button
                type="button"
                onClick={() => remove(tag.tagId)}
                aria-label={c.removeLabel(tag.name)}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-ink-tertiary transition-colors hover:bg-surface-3 hover:text-semantic-danger"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 focus-within:ring-2 focus-within:ring-primary/60">
          <Icon name="search" className="text-[18px] text-ink-tertiary" />
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={hasKeyword && !isFull}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            disabled={isFull}
            value={keyword}
            onChange={(e) => setKeyword(stripInvalidTagChars(e.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={isFull ? c.full : c.placeholder}
            className="h-10 w-full bg-transparent font-body-md text-body-md text-ink placeholder:text-ink-tertiary focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        {hasKeyword && !isFull && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-hairline bg-surface-1 py-1 shadow-xl"
          >
            {options.map((tag) => (
              <li key={tag.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => add({ tagId: tag.id, name: tag.name })}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="font-label-code text-label-code text-ink">#{tag.name}</span>
                  <span className="font-caption text-caption text-ink-tertiary">
                    {c.questionCount(tag.questionCount)}
                  </span>
                </button>
              </li>
            ))}
            {!loading && options.length === 0 && (
              <li className="px-3 py-2 font-body-sm text-body-sm text-ink-tertiary">
                {errorMessage ?? c.noResult}
              </li>
            )}
          </ul>
        )}
      </div>

      <p className="flex items-center gap-1 font-body-sm text-body-sm text-ink-tertiary">
        <Icon name="info" className="text-[14px]" />
        {c.help}
      </p>
      {error && <StatusMessage tone="danger" text={error} />}
    </div>
  );
};
