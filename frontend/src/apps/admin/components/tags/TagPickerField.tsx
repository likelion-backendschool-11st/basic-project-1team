import React from 'react';
import { ui } from '../../data/mockData';
import type { TagPickerState } from '../../hooks/useTagPicker';
import { Icon } from '../ui/Icon';

interface TagPickerFieldProps {
  readonly picker: TagPickerState;
  readonly inputId: string;
  readonly label: string;
  readonly placeholder: string;
  readonly hint: string;
  readonly clearLabel: string;
}

/** 사용 중인 태그를 검색해서 하나 고르는 칸. 병합 대상·차단 대체 태그 선택에 쓴다 (API_SPEC 10.5) */
export const TagPickerField: React.FC<TagPickerFieldProps> = ({
  picker,
  inputId,
  label,
  placeholder,
  hint,
  clearLabel,
}) => (
  <>
    <label htmlFor={inputId} className="mb-2 block text-label-md font-semibold text-ink">
      {label}
    </label>
    <div className="relative">
      <div className="flex h-12 items-center gap-2 rounded-lg border-2 border-primary-container bg-canvas px-3">
        {picker.selected ? (
          <button
            type="button"
            onClick={picker.clear}
            aria-label={clearLabel}
            className="flex items-center gap-2 rounded border border-hairline-strong bg-surface-2 px-2 py-0.5 font-mono text-code-sm text-primary"
          >
            {picker.selected.name}
            <Icon name="check_circle" className="!text-[16px] text-secondary" />
          </button>
        ) : (
          <input
            id={inputId}
            autoFocus
            autoComplete="off"
            placeholder={placeholder}
            value={picker.query}
            onChange={(event) => picker.setQuery(event.target.value)}
            className="h-full flex-1 border-0 bg-transparent p-0 font-mono text-body-md text-ink placeholder:font-sans placeholder:text-ink-tertiary focus:ring-0"
          />
        )}
        <Icon name="search" className="ml-auto !text-[20px] text-ink-subtle" />
      </div>

      {picker.suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-hairline-strong bg-surface-3 py-1"
        >
          {picker.suggestions.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => picker.select(tag)}
                className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-surface-4"
              >
                <span className="font-mono text-code-sm text-primary">{tag.name}</span>
                <span className="text-body-sm text-ink-subtle">
                  {tag.questionCount.toLocaleString()}
                  {ui.countUnit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    <p className="mt-2 text-body-sm text-ink-subtle">{hint}</p>
  </>
);
