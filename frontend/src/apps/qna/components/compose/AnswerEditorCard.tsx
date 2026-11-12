import React from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import type { useRichText } from '../../../../shared/editor/useRichText';
import { editAnswerPage as P, editorTemplates } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface AnswerEditorCardProps {
  readonly editor: ReturnType<typeof useRichText>;
}

const templateButton =
  'inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline font-label-sm text-label-sm text-ink-subtle hover:text-ink transition-colors';

export const AnswerEditorCard: React.FC<AnswerEditorCardProps> = ({ editor }) => (
  <Card as="section" className="overflow-hidden flex flex-col">
    <div className="h-11 px-space-md bg-surface-2 border-b border-hairline flex items-center justify-between gap-space-sm">
      <div className="flex items-center gap-1">
        <Icon name="edit_note" className="text-primary text-[18px] mr-1" />
        <span className="font-headline-sm text-headline-sm text-ink font-semibold">
          {P.editorTitle}
        </span>
      </div>
    </div>

    <div className="px-space-md py-2 bg-surface-1/90 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          className={templateButton}
          onClick={() => editor.appendHtml(editorTemplates.steps)}
        >
          <Icon name="playlist_add_check" className="text-[14px] text-primary" />
          {P.stepsTemplate}
        </button>
        <button
          type="button"
          className={templateButton}
          onClick={() => editor.appendHtml(editorTemplates.console)}
        >
          <Icon name="terminal" className="text-[14px] text-tertiary" />
          {P.consoleTemplate}
        </button>
      </div>
    </div>

    <div className="bg-surface-1 p-space-md">
      <RichTextEditor
        value={editor.value}
        onChange={editor.setValue}
        placeholder={P.bodyPlaceholder}
        minHeight={300}
        maxLength={P.maxLength}
      />
    </div>

    <div className="px-space-md py-2 bg-surface-2/70 border-t border-hairline flex flex-wrap items-center justify-between gap-space-sm font-caption text-caption text-ink-tertiary">
      <div className="flex items-center gap-space-md">
        <span className="inline-flex items-center gap-1">
          <Icon name="edit_note" className="text-[14px]" />
          {P.markdownSupport}
        </span>
        <span className="hidden sm:inline text-ink-tertiary">•</span>
        <span className="hidden sm:inline">{P.shortcuts}</span>
      </div>
      <div className="flex items-center gap-2 font-code-inline text-code-inline">
        <span className="text-ink-muted">{editor.length}</span>
        <span className="text-ink-tertiary">/ {P.maxLength.toLocaleString()}자</span>
      </div>
    </div>
  </Card>
);
