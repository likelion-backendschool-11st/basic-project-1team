import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { editorMessages, newQuestionPage as P } from '../data/mockData';
import { useAttachments } from '../hooks/useAttachments';
import { useDraftSave } from '../hooks/useDraftSave';
import { useSubmitAction } from '../hooks/useSubmitAction';
import { useTagInput } from '../hooks/useTagInput';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { NewBodyCard } from '../components/compose/NewBodyCard';
import { NewSubmitBar } from '../components/compose/NewSubmitBar';
import { NewTagCard } from '../components/compose/NewTagCard';
import { NewTitleCard } from '../components/compose/NewTitleCard';
import { RewardCard } from '../components/sidebar/RewardCard';
import { SimilarSolvedCard } from '../components/sidebar/SimilarSolvedCard';
import { WritingGuideCard } from '../components/sidebar/WritingGuideCard';
import { routes } from '../routes';

interface QuestionNewPageProps {
  readonly className?: string;
}

export const QuestionNewPage: React.FC<QuestionNewPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const editor = useRichText();
  const files = useAttachments(P.initialAttachments);
  const tags = useTagInput(P.initialTags, 5, editorMessages.maxTags);
  const draft = useDraftSave(P.autosaveInitial, P.autosaveDone);
  const submit = useSubmitAction(() => {
    window.alert(P.submitDone);
    navigate(routes.questions());
  });

  const handleSubmit = () => {
    if (!title.trim()) return window.alert(editorMessages.titleRequired);
    // 공백을 뺀 순수 글자 15자 이상 (API_SPEC 3장)
    if (editor.visibleLength < 15) return window.alert(editorMessages.bodyTooShort);
    if (editor.limitError) return window.alert(editor.limitError);
    submit.submit();
  };

  const handleCancel = () => {
    if (window.confirm(editorMessages.leaveConfirm)) navigate(-1);
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="py-space-md flex items-center justify-between">
        <Breadcrumb
          currentTone="primary"
          items={[
            { label: '홈', to: routes.home(), icon: 'home' },
            { label: '질문/답변', to: routes.questions() },
            { label: P.breadcrumbCurrent },
          ]}
        />
        <div className="hidden sm:flex items-center gap-space-xs text-ink-tertiary font-caption text-caption">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
          </span>
          <span>{draft.status}</span>
        </div>
      </div>

      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
          {P.title}
        </h1>
        <p className="font-body-md text-body-md text-ink-subtle mt-1">{P.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-space-2xl">
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          <NewTitleCard value={title} onChange={setTitle} />
          <NewBodyCard editor={editor} files={files} />
          <NewTagCard tagInput={tags} />
          <NewSubmitBar
            onCancel={handleCancel}
            onDraft={draft.save}
            draftSaved={draft.justSaved}
            onSubmit={handleSubmit}
            submitting={submit.pending}
          />
        </div>
        <aside className="lg:col-span-4 flex flex-col gap-space-lg">
          <WritingGuideCard />
          <RewardCard />
          <SimilarSolvedCard linkFor={routes.question} />
        </aside>
      </div>
    </div>
  );
};
