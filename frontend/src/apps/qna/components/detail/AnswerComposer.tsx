import React, { useState } from 'react';
import { RichTextEditor } from '../../../../shared/editor/RichTextEditor';
import { RestrictionNotice } from '../../../../shared/layout/RestrictionNotice';
import { restrictionFor } from '../../../../shared/sanctions';
import { useRichText } from '../../../../shared/editor/useRichText';
import { answerComposer as C } from '../../data/mockData';
import { useLoginGate } from '../../../../shared/LoginGate';
import { Card } from '../common/Card';

interface AnswerComposerProps {
  /** 본문(HTML). 이미지·영상은 에디터로 본문 안에 넣는다. 등록에 성공하면 true */
  readonly onSubmit: (body: string) => Promise<boolean>;
}

export const AnswerComposer: React.FC<AnswerComposerProps> = ({ onSubmit }) => {
  const editor = useRichText();
  const restriction = restrictionFor('write');
  const { requireLogin } = useLoginGate();
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    // 비회원이면 작성한 내용을 지우지 않고 팝업만 띄운다
    if (!requireLogin()) return;
    if (editor.limitError) return window.alert(editor.limitError);
    setPending(true);
    const isCreated = await onSubmit(editor.value);
    setPending(false);
    // 실패하면 쓴 내용을 그대로 둔다
    if (isCreated) editor.setValue('');
  };

  return (
    <Card as="section" className="overflow-hidden flex flex-col">
      <div className="h-10 bg-surface-2 border-b border-hairline px-space-md flex items-center justify-between text-ink-subtle">
        <div className="flex items-center gap-1">
          <span className="font-label-md text-label-md text-ink font-semibold mr-2">{C.title}</span>
        </div>
        <span className="font-code-inline text-[11px] text-ink-tertiary">{C.markdownHint}</span>
      </div>
      <div className="p-space-md bg-surface-1">
        <RestrictionNotice message={restriction} className="mb-space-sm" />
        <RichTextEditor
          value={editor.value}
          onChange={editor.setValue}
          placeholder={C.placeholder}
          minHeight={140}
        />
      </div>
      <div className="p-space-sm sm:px-space-md bg-surface-2 border-t border-hairline flex flex-wrap items-center justify-end gap-space-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={editor.isEmpty || restriction !== null || pending}
            onClick={() => void handleSubmit()}
            className="px-space-md py-1.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            {pending ? C.submitting : C.submit}
          </button>
        </div>
      </div>
    </Card>
  );
};
