import React from 'react';

export type EditorMode = 'write' | 'preview';

interface EditorModeTabsProps {
  readonly mode: EditorMode;
  readonly onChange: (mode: EditorMode) => void;
  readonly writeLabel: string;
  readonly previewLabel: string;
  readonly variant?: 'compact' | 'bordered';
}

export const EditorModeTabs: React.FC<EditorModeTabsProps> = ({
  mode,
  onChange,
  writeLabel,
  previewLabel,
  variant = 'compact',
}) => {
  const tabs: readonly [EditorMode, string][] = [
    ['write', writeLabel],
    ['preview', previewLabel],
  ];
  const compact = variant === 'compact';
  return (
    <div
      role="tablist"
      className={
        compact
          ? 'inline-flex p-0.5 rounded bg-surface-1 mr-space-xs'
          : 'flex items-center p-0.5 rounded bg-surface-1 border border-hairline'
      }
    >
      {tabs.map(([value, label]) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            className={`${compact ? 'px-2.5 font-label-sm text-label-sm' : 'px-3 font-label-md text-label-md'} py-1 rounded transition-colors ${
              active
                ? `text-ink ${compact ? 'bg-surface-3 font-semibold' : 'bg-surface-2 font-medium'} shadow-sm`
                : 'text-ink-subtle hover:text-ink'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
