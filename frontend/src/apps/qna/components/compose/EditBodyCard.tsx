import React from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import type { useRichText } from '../../../../shared/editor/useRichText';
import { editQuestionPage as P, editorMessages, editorTemplates } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface EditBodyCardProps {
  readonly editor: ReturnType<typeof useRichText>;
}

const templateButton =
  'px-2 py-1 rounded bg-surface-1 hover:bg-surface-3 font-code-inline text-code-inline text-ink-subtle hover:text-ink transition-colors flex items-center gap-1';

export const EditBodyCard: React.FC<EditBodyCardProps> = ({ editor }) => {
  return (
    <Card as="section" bordered={false} className="overflow-hidden flex flex-col">
      <div className="p-space-sm bg-surface-2 flex flex-wrap items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs ml-auto">
          <span className="font-caption text-caption text-ink-tertiary hidden sm:inline">
            {P.templateLabel}
          </span>
          <button
            type="button"
            className={templateButton}
            onClick={() =>
              editor.appendHtml(editorTemplates.bug, editorMessages.templateAppendConfirm)
            }
          >
            <Icon name="bug_report" className="text-[14px]" />
            {P.bugTemplate}
          </button>
          <button
            type="button"
            className={templateButton}
            onClick={() => editor.appendHtml(editorTemplates.spec)}
          >
            <Icon name="memory" className="text-[14px]" />
            {P.specTemplate}
          </button>
        </div>
      </div>

      <div className="p-space-md">
        <RichTextEditor
          value={editor.value}
          onChange={editor.setValue}
          placeholder={P.bodyPlaceholder}
          minHeight={300}
        />
      </div>
    </Card>
  );
};
