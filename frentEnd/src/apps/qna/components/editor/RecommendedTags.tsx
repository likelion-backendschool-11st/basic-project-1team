import React from 'react';

interface RecommendedTagsProps {
  readonly label: string;
  readonly tags: readonly string[];
  readonly onAdd: (tag: string) => void;
  readonly variant?: 'plain' | 'hash';
}

export const RecommendedTags: React.FC<RecommendedTagsProps> = ({ label, tags, onAdd, variant = 'plain' }) => (
  <div className={`flex flex-wrap items-center ${variant === 'plain' ? 'gap-1.5 pt-1' : 'gap-space-xs pt-space-xxs'}`}>
    <span className="text-ink-tertiary font-caption text-caption mr-1">{label}</span>
    {tags.map((tag) => (
      <button
        key={tag}
        type="button"
        onClick={() => onAdd(tag)}
        className={`px-2 py-0.5 rounded bg-surface-2 hover:bg-surface-3 font-code-inline transition-colors ${
          variant === 'plain' ? 'text-ink-muted hover:text-ink text-[11px]' : 'text-ink-subtle hover:text-primary text-code-inline'
        }`}
      >
        + {variant === 'hash' ? '#' : ''}
        {tag}
      </button>
    ))}
  </div>
);

export default RecommendedTags;
