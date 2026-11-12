import React from 'react';
import { editAnswerPage as P, editorTemplates } from '../../data/mockData';
import type { useMarkdownEditor } from '../../hooks/useMarkdownEditor';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { EditorModeTabs, type EditorMode } from '../editor/EditorModeTabs';
import { FormatToolbar } from '../editor/FormatToolbar';
import { MarkdownPreview } from '../editor/MarkdownPreview';
import { answerEditTools } from '../editor/toolbarTools';

interface AnswerEditorCardProps {
  readonly editor: ReturnType<typeof useMarkdownEditor>;
  readonly mode: EditorMode;
  readonly onModeChange: (mode: EditorMode) => void;
}

const templateButton =
  'inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline font-label-sm text-label-sm text-ink-subtle hover:text-ink transition-colors';

export const AnswerEditorCard: React.FC<AnswerEditorCardProps> = ({
  editor,
  mode,
  onModeChange,
}) => (
  <Card as="section" className="overflow-hidden flex flex-col">
    <div className="h-11 px-space-md bg-surface-2 border-b border-hairline flex items-center justify-between gap-space-sm">
      <div className="flex items-center gap-1">
        <Icon name="edit_note" className="text-primary text-[18px] mr-1" />
        <span className="font-headline-sm text-headline-sm text-ink font-semibold">
          {P.editorTitle}
        </span>
      </div>
      <EditorModeTabs
        variant="bordered"
        mode={mode}
        onChange={onModeChange}
        writeLabel={P.writeTab}
        previewLabel={P.previewTab}
      />
    </div>

    <div className="px-space-md py-2 bg-surface-1/90 border-b border-hairline flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center flex-wrap gap-1">
        <FormatToolbar
          tools={answerEditTools}
          onCommand={editor.applyFormat}
          size="sm"
          dividerClassName="bg-hairline"
          trailing={
            <button
              type="button"
              title="이미지 첨부"
              className="p-1.5 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <Icon name="image" className="text-[18px]" />
            </button>
          }
        />
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={templateButton}
          onClick={() => editor.appendTemplate(editorTemplates.steps, '')}
        >
          <Icon name="playlist_add_check" className="text-[14px] text-primary" />
          {P.stepsTemplate}
        </button>
        <button
          type="button"
          className={templateButton}
          onClick={() => editor.appendTemplate(editorTemplates.console, '')}
        >
          <Icon name="terminal" className="text-[14px] text-tertiary" />
          {P.consoleTemplate}
        </button>
      </div>
    </div>

    <div className="relative bg-surface-1 p-space-md min-h-[360px] flex flex-col">
      {mode === 'write' ? (
        <textarea
          ref={editor.ref}
          value={editor.value}
          maxLength={P.maxLength}
          onChange={(e) => editor.setValue(e.target.value)}
          placeholder={P.bodyPlaceholder}
          rows={15}
          className="w-full h-full bg-transparent text-ink font-body-md text-body-md leading-relaxed placeholder:text-ink-tertiary resize-y focus:outline-none font-sans min-h-[300px]"
        />
      ) : (
        <MarkdownPreview source={editor.value} />
      )}
    </div>

    <div className="px-space-md py-2 bg-surface-2/70 border-t border-hairline flex flex-wrap items-center justify-between gap-space-sm font-caption text-caption text-ink-tertiary">
      <div className="flex items-center gap-space-md">
        <span className="inline-flex items-center gap-1">
          <Icon name="markdown" className="text-[14px]" />
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
