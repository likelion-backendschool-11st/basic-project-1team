import React from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import { useRichText } from '../../../../shared/editor/useRichText';
import { answerComposer as C } from '../../data/mockData';
import { useLoginGate } from '../../../../shared/LoginGate';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface AnswerComposerProps {
  readonly onSubmit: (body: string) => void;
}

export const AnswerComposer: React.FC<AnswerComposerProps> = ({ onSubmit }) => {
  const editor = useRichText();
  const { requireLogin } = useLoginGate();

  return (
    <Card as="section" className="overflow-hidden flex flex-col">
      <div className="h-10 bg-surface-2 border-b border-hairline px-space-md flex items-center justify-between text-ink-subtle">
        <div className="flex items-center gap-1">
          <span className="font-label-md text-label-md text-ink font-semibold mr-2">{C.title}</span>
        </div>
        <span className="font-code-inline text-[11px] text-ink-tertiary">{C.markdownHint}</span>
      </div>
      <div className="p-space-md bg-surface-1">
        <RichTextEditor
          value={editor.value}
          onChange={editor.setValue}
          placeholder={C.placeholder}
          minHeight={140}
        />
      </div>
      <div className="p-space-sm sm:px-space-md bg-surface-2 border-t border-hairline flex flex-wrap items-center justify-between gap-space-xs">
        <div className="flex items-center gap-2 text-ink-subtle font-caption text-caption">
          <Icon name="attach_file" className="text-[15px]" />
          <span>{C.attachHint}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={editor.isEmpty}
            onClick={() => {
              // 비회원이면 작성한 내용을 지우지 않고 팝업만 띄운다
              if (!requireLogin()) return;
              if (editor.limitError) return window.alert(editor.limitError);
              onSubmit(editor.value);
              editor.setValue('');
            }}
            className="px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            {C.submit}
          </button>
        </div>
      </div>
    </Card>
  );
};
