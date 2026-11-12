import React, { type KeyboardEvent } from 'react';
import { Icon } from '../common/Icon';

interface TagInputBoxProps {
  readonly tags: readonly string[];
  readonly input: string;
  readonly onInputChange: (v: string) => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  readonly onRemove: (tag: string) => void;
  readonly placeholder: string;
  readonly variant?: 'primary' | 'neutral';
}

export const TagInputBox: React.FC<TagInputBoxProps> = ({ tags, input, onInputChange, onKeyDown, onRemove, placeholder, variant = 'primary' }) => {
  const primary = variant === 'primary';
  return (
    <div
      className={`flex flex-wrap items-center rounded-lg bg-surface-2 transition-colors ${
        primary ? 'min-h-12 p-2 gap-1.5 focus-within:bg-surface-3' : 'p-space-xs gap-space-xs min-h-[46px]'
      }`}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-code-inline ${
            primary ? 'bg-primary-container/20 text-primary-fixed-dim text-[12px]' : 'bg-surface-3 text-code-inline text-ink hover:bg-surface-4 transition-colors'
          }`}
        >
          #{tag}
          <button
            type="button"
            aria-label={`${tag} 태그 삭제`}
            onClick={() => onRemove(tag)}
            className={`flex items-center transition-colors ${primary ? 'hover:text-ink' : 'text-ink-tertiary hover:text-semantic-danger ml-0.5'}`}
          >
            <Icon name="close" className={primary ? 'text-[13px]' : 'text-[14px]'} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`flex-1 bg-transparent px-2 text-ink placeholder:text-ink-tertiary focus:outline-none ${
          primary ? 'min-w-[200px] h-8 font-body-sm text-body-sm' : 'min-w-[160px] py-1 font-code-inline text-code-inline'
        }`}
      />
    </div>
  );
};

export default TagInputBox;
