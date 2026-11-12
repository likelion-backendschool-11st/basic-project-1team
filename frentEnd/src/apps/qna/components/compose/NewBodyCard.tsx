import React from 'react';
import { editorMessages, editorTemplates, newQuestionPage as P } from '../../data/mockData';
import type { useAttachments } from '../../hooks/useAttachments';
import type { useMarkdownEditor } from '../../hooks/useMarkdownEditor';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { NumberBadge } from '../common/NumberBadge';
import { AttachmentPill } from '../editor/AttachmentPill';
import { FormatToolbar } from '../editor/FormatToolbar';
import { HiddenFileInput } from '../editor/HiddenFileInput';
import { newQuestionTools } from '../editor/toolbarTools';

interface NewBodyCardProps {
  readonly editor: ReturnType<typeof useMarkdownEditor>;
  readonly files: ReturnType<typeof useAttachments>;
}

const templateButton =
  'px-2.5 py-1 rounded bg-surface-3 hover:bg-surface-container-highest text-ink-muted hover:text-ink font-caption text-caption transition-colors flex items-center gap-1';

export const NewBodyCard: React.FC<NewBodyCardProps> = ({ editor, files }) => (
  <Card as="section" bordered={false} className="flex flex-col overflow-hidden">
    <div className="p-space-md bg-surface-2 flex flex-wrap items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-xs">
        <NumberBadge index={2} />
        <span className="font-label-md text-label-md text-ink">{P.bodyLabel}</span>
        <span className="px-2 py-0.5 rounded bg-surface-3 font-code-inline text-[11px] text-ink-subtle">{P.bodyModeBadge}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-ink-tertiary font-caption text-caption mr-1 hidden sm:inline">{P.templateLabel}</span>
        <button type="button" className={templateButton} onClick={() => editor.appendTemplate(editorTemplates.bug, '\n\n', editorMessages.templateAppendConfirm)}>
          <Icon name="bug_report" className="text-[13px] text-semantic-danger" />
          {P.bugTemplate}
        </button>
        <button type="button" className={templateButton} onClick={() => editor.appendTemplate(editorTemplates.spec)}>
          <Icon name="memory" className="text-[13px] text-tertiary" />
          {P.specTemplate}
        </button>
      </div>
    </div>

    <div className="px-space-md py-2 bg-surface-1 flex flex-wrap items-center gap-1 select-none">
      <FormatToolbar
        tools={newQuestionTools}
        onCommand={editor.applyFormat}
        trailing={
          <>
            <button
              type="button"
              title="스크린샷 / 로그 이미지 첨부"
              onClick={files.openPicker}
              className="px-2 h-8 rounded hover:bg-surface-2 text-ink-subtle hover:text-ink flex items-center gap-1 text-[12px] transition-colors"
            >
              <Icon name="add_photo_alternate" className="text-[18px]" />
              <span>이미지 첨부</span>
            </button>
            <div className="ml-auto text-ink-tertiary font-code-inline text-[11px]">{editor.length}자</div>
          </>
        }
      />
    </div>

    <div className="relative bg-surface-container-lowest p-space-md">
      <textarea
        ref={editor.ref}
        value={editor.value}
        onChange={(e) => editor.setValue(e.target.value)}
        placeholder={P.bodyPlaceholder}
        rows={12}
        className="w-full bg-transparent text-ink placeholder:text-ink-tertiary font-body-md text-body-md leading-relaxed resize-y focus:outline-none min-h-[280px]"
      />
    </div>

    <div className="p-space-md bg-surface-1">
      <div
        role="button"
        tabIndex={0}
        onClick={files.openPicker}
        onKeyDown={(e) => e.key === 'Enter' && files.openPicker()}
        className="rounded-xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-2 hover:bg-surface-3 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-space-sm text-center sm:text-left">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-fixed-dim">
            <Icon name="cloud_upload" className="text-[24px]" />
          </div>
          <div>
            <p className="font-label-md text-label-md text-ink">{P.dropTitle}</p>
            <p className="font-caption text-caption text-ink-tertiary">{P.dropHint}</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-container-highest text-ink font-caption text-caption font-medium transition-colors shrink-0">
          {P.dropButton}
        </span>
      </div>
      <HiddenFileInput inputRef={files.inputRef} onChange={files.onFilesSelected} />
      <div className="mt-space-xs flex flex-wrap gap-2">
        {files.items.map((a) => (
          <AttachmentPill key={a.id} attachment={a} onRemove={files.remove} />
        ))}
      </div>
    </div>
  </Card>
);

export default NewBodyCard;
