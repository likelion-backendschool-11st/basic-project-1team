import React from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import type { useRichText } from '../../../../shared/editor/useRichText';
import { editorMessages, editorTemplates, newQuestionPage as P } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { NumberBadge } from '../common/NumberBadge';

interface NewBodyCardProps {
  readonly editor: ReturnType<typeof useRichText>;
}

const templateButton =
  'px-2.5 py-1 rounded bg-surface-3 hover:bg-surface-container-highest text-ink-muted hover:text-ink font-caption text-caption transition-colors flex items-center gap-1';

export const NewBodyCard: React.FC<NewBodyCardProps> = ({ editor }) => (
  <Card as="section" bordered={false} className="flex flex-col overflow-hidden">
    <div className="p-space-md bg-surface-2 flex flex-wrap items-center justify-between gap-space-xs">
      <div className="flex items-center gap-space-xs">
        <NumberBadge index={2} />
        <span className="font-label-md text-label-md text-ink">{P.bodyLabel}</span>
        <span className="px-2 py-0.5 rounded bg-surface-3 font-code-inline text-[11px] text-ink-subtle">
          {P.bodyModeBadge}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-ink-tertiary font-caption text-caption mr-1 hidden sm:inline">
          {P.templateLabel}
        </span>
        <button
          type="button"
          className={templateButton}
          onClick={() =>
            editor.appendHtml(editorTemplates.bug, editorMessages.templateAppendConfirm)
          }
        >
          <Icon name="bug_report" className="text-[13px] text-semantic-danger" />
          {P.bugTemplate}
        </button>
        <button
          type="button"
          className={templateButton}
          onClick={() => editor.appendHtml(editorTemplates.spec)}
        >
          <Icon name="memory" className="text-[13px] text-tertiary" />
          {P.specTemplate}
        </button>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-space-md">
      <RichTextEditor
        value={editor.value}
        onChange={editor.setValue}
        placeholder={P.bodyPlaceholder}
        minHeight={280}
      />
    </div>
  </Card>
);
