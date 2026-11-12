import React from 'react';
import { answerComposer as C } from '../../data/mockData';
import { useDraftSave } from '../../hooks/useDraftSave';
import { useLoginGate } from '../../../../shared/LoginGate';
import { useMarkdownEditor, type FormatCommand } from '../../hooks/useMarkdownEditor';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface AnswerComposerProps {
  readonly onSubmit: (body: string) => void;
}

const tools: readonly { cmd: FormatCommand; icon: string; title: string }[] = [
  { cmd: 'bold', icon: 'format_bold', title: '굵게' },
  { cmd: 'italic', icon: 'format_italic', title: '기울임' },
  { cmd: 'codeblock', icon: 'code', title: '코드 블록' },
  { cmd: 'link', icon: 'link', title: '링크 삽입' },
];

export const AnswerComposer: React.FC<AnswerComposerProps> = ({ onSubmit }) => {
  const editor = useMarkdownEditor();
  const draft = useDraftSave('', C.draftSaved);
  const { requireLogin } = useLoginGate();

  return (
    <Card as="section" className="overflow-hidden flex flex-col">
      <div className="h-10 bg-surface-2 border-b border-hairline px-space-md flex items-center justify-between text-ink-subtle">
        <div className="flex items-center gap-1">
          <span className="font-label-md text-label-md text-ink font-semibold mr-2">{C.title}</span>
          {tools.map((t) => (
            <button key={t.cmd} type="button" title={t.title} onClick={() => editor.applyFormat(t.cmd)} className="p-1 rounded hover:bg-surface-3 hover:text-ink transition-colors">
              <Icon name={t.icon} className="text-[16px]" />
            </button>
          ))}
          <button type="button" title="이미지 업로드" className="p-1 rounded hover:bg-surface-3 hover:text-ink transition-colors">
            <Icon name="image" className="text-[16px]" />
          </button>
        </div>
        <span className="font-code-inline text-[11px] text-ink-tertiary">{C.markdownHint}</span>
      </div>
      <div className="p-space-md bg-surface-1">
        <textarea
          ref={editor.ref}
          value={editor.value}
          onChange={(e) => editor.setValue(e.target.value)}
          className="w-full bg-transparent text-ink placeholder:text-ink-tertiary font-body-md text-body-md focus:outline-none resize-y"
          placeholder={C.placeholder}
          rows={5}
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
            onClick={draft.save}
            className="px-space-sm py-1.5 rounded-lg bg-surface-1 hover:bg-surface-3 border border-hairline text-ink font-label-md text-label-md transition-colors"
          >
            {draft.justSaved ? C.draftSaved : C.draft}
          </button>
          <button
            type="button"
            disabled={!editor.value.trim()}
            onClick={() => {
              // 비회원이면 작성한 내용을 지우지 않고 팝업만 띄운다
              if (!requireLogin()) return;
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
