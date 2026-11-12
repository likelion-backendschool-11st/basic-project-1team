import React from 'react';
import type { FormatCommand } from '../../hooks/useMarkdownEditor';
import { Icon } from '../common/Icon';
import type { ToolbarTool } from './toolbarTools';

interface FormatToolbarProps {
  readonly tools: readonly ToolbarTool[];
  readonly onCommand: (cmd: FormatCommand) => void;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly dividerClassName?: string;
  readonly trailing?: React.ReactNode;
}

const buttonSize = { sm: 'p-1', md: 'w-7 h-7', lg: 'w-8 h-8' } as const;
const iconSize = { sm: 'text-[16px]', md: 'text-[18px]', lg: 'text-[18px]' } as const;

export const FormatToolbar: React.FC<FormatToolbarProps> = ({ tools, onCommand, size = 'lg', dividerClassName = 'bg-surface-3', trailing }) => (
  <>
    {tools.map((t) => (
      <React.Fragment key={t.cmd}>
        {t.dividerBefore && <span className={`w-px h-4 mx-1 ${dividerClassName}`} />}
        <button
          type="button"
          title={t.title}
          aria-label={t.title}
          onClick={() => onCommand(t.cmd)}
          className={`${t.label ? 'px-2 h-8 gap-1 text-[12px] font-code-inline' : buttonSize[size]} rounded hover:bg-surface-2 text-ink-subtle hover:text-ink flex items-center justify-center transition-colors`}
        >
          <Icon name={t.icon} className={iconSize[size]} />
          {t.label && <span>{t.label}</span>}
        </button>
      </React.Fragment>
    ))}
    {trailing}
  </>
);
