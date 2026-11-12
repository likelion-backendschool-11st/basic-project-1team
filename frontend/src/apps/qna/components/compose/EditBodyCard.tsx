import React, { useState } from 'react';
import { editQuestionPage as P, editorMessages, editorTemplates } from '../../data/mockData';
import type { useAttachments } from '../../hooks/useAttachments';
import type { useMarkdownEditor } from '../../hooks/useMarkdownEditor';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { AttachmentTile } from '../editor/AttachmentTile';
import { EditorModeTabs, type EditorMode } from '../editor/EditorModeTabs';
import { FormatToolbar } from '../editor/FormatToolbar';
import { HiddenFileInput } from '../editor/HiddenFileInput';
import { MarkdownPreview } from '../editor/MarkdownPreview';
import { editQuestionTools } from '../editor/toolbarTools';

interface EditBodyCardProps {
  readonly editor: ReturnType<typeof useMarkdownEditor>;
  readonly files: ReturnType<typeof useAttachments>;
}

const templateButton =
  'px-2 py-1 rounded bg-surface-1 hover:bg-surface-3 font-code-inline text-code-inline text-ink-subtle hover:text-ink transition-colors flex items-center gap-1';

export const EditBodyCard: React.FC<EditBodyCardProps> = ({ editor, files }) => {
  const [mode, setMode] = useState<EditorMode>('write');
  return (
    <Card as="section" bordered={false} className="overflow-hidden flex flex-col">
      <div className="p-space-sm bg-surface-2 flex flex-wrap items-center justify-between gap-space-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <EditorModeTabs
            mode={mode}
            onChange={setMode}
            writeLabel={P.writeTab}
            previewLabel={P.previewTab}
          />
          <FormatToolbar
            tools={editQuestionTools}
            onCommand={editor.applyFormat}
            size="md"
            trailing={
              <button
                type="button"
                title="Image Upload"
                onClick={files.openPicker}
                className="w-7 h-7 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 flex items-center justify-center transition-colors"
              >
                <Icon name="image" className="text-[18px]" />
              </button>
            }
          />
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="font-caption text-caption text-ink-tertiary hidden sm:inline">
            {P.templateLabel}
          </span>
          <button
            type="button"
            className={templateButton}
            onClick={() =>
              editor.appendTemplate(
                editorTemplates.bug,
                '\n\n',
                editorMessages.templateAppendConfirm,
              )
            }
          >
            <Icon name="bug_report" className="text-[14px]" />
            {P.bugTemplate}
          </button>
          <button
            type="button"
            className={templateButton}
            onClick={() => editor.appendTemplate(editorTemplates.spec)}
          >
            <Icon name="memory" className="text-[14px]" />
            {P.specTemplate}
          </button>
        </div>
      </div>

      <div className="relative p-space-md">
        {mode === 'write' ? (
          <textarea
            id="editor-body"
            ref={editor.ref}
            value={editor.value}
            onChange={(e) => editor.setValue(e.target.value)}
            placeholder={P.bodyPlaceholder}
            rows={15}
            className="w-full bg-transparent font-body-md text-body-md text-ink placeholder:text-ink-tertiary focus:outline-none resize-y leading-relaxed min-h-[300px]"
          />
        ) : (
          <MarkdownPreview source={editor.value} />
        )}
      </div>

      <div className="p-space-md bg-surface-2/60 flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
            <Icon name="attach_file" className="text-[18px] text-ink-subtle" />
            {P.attachmentsTitle.replace('2', String(files.items.length))}
          </span>
          <span className="font-caption text-caption text-ink-tertiary">{P.attachmentsLimit}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
          {files.items.map((a) => (
            <AttachmentTile key={a.id} attachment={a} onRemove={files.remove} />
          ))}
        </div>
        <button
          type="button"
          onClick={files.openPicker}
          className="p-space-sm rounded-lg bg-surface-1 flex items-center justify-center gap-space-sm hover:bg-surface-2 transition-colors text-ink-subtle hover:text-ink"
        >
          <Icon name="cloud_upload" className="text-[20px]" />
          <span className="font-body-sm text-body-sm">{P.dropHint}</span>
        </button>
        <HiddenFileInput inputRef={files.inputRef} onChange={files.onFilesSelected} />
      </div>
    </Card>
  );
};
