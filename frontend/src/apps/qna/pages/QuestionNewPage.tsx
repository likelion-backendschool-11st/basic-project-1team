import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { RestrictionNotice } from '../../../shared/layout/RestrictionNotice';
import { blockIfRestricted, restrictionFor } from '../../../shared/sanctions';
import { createQuestion } from '../api/questions';
import { editorMessages, newQuestionPage as P } from '../data/mockData';
import { useAsyncSubmit } from '../hooks/useAsyncSubmit';
import { formatDraftTime, readQuestionDraft, useQuestionDraft } from '../hooks/useQuestionDraft';
import { useTagInput } from '../hooks/useTagInput';
import { useTagSuggestions } from '../hooks/useTagSuggestions';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
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
  // 임시저장한 글이 있으면 그 내용으로 시작한다 (REQ-QNA-019)
  const [initialDraft] = useState(readQuestionDraft);
  const [showRestored, setShowRestored] = useState(initialDraft !== null);
  const [title, setTitle] = useState(initialDraft?.title ?? '');
  // 글쓰기 제한·이용 정지 중이면 안내하고 저장을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('write');
  const editor = useRichText(initialDraft?.body ?? '');
  const tags = useTagInput(initialDraft?.tags ?? [], 5, editorMessages.maxTags);
  const suggestions = useTagSuggestions(tags.input, tags.tags);
  const draft = useQuestionDraft({ title, body: editor.value, tags: tags.tags }, initialDraft);
  const submit = useAsyncSubmit(
    () => createQuestion({ title: title.trim(), body: editor.value, tags: tags.tags }),
    (created) => {
      draft.clear();
      window.alert(P.submitDone);
      navigate(routes.question(created.id));
    },
  );

  const handleSubmit = () => {
    if (blockIfRestricted('write')) return;
    if (!title.trim()) return window.alert(editorMessages.titleRequired);
    // 공백을 뺀 순수 글자 15자 이상 (API_SPEC 3장)
    if (editor.visibleLength < 15) return window.alert(editorMessages.bodyTooShort);
    if (editor.limitError) return window.alert(editor.limitError);
    if (tags.tags.length === 0) return window.alert(editorMessages.tagRequired);
    void submit.submit();
  };

  const discardDraft = () => {
    if (!window.confirm(P.draftDiscardConfirm)) return;
    draft.clear();
    setTitle('');
    editor.setValue('');
    tags.reset([]);
    setShowRestored(false);
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
          <span>
            {draft.failed
              ? P.autosaveFailed
              : draft.savedAt
                ? P.autosaveAt(formatDraftTime(draft.savedAt))
                : P.autosaveNone}
          </span>
        </div>
      </div>

      <div className="mb-space-lg">
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
          {P.title}
        </h1>
        <p className="font-body-md text-body-md text-ink-subtle mt-1">{P.description}</p>
      </div>

      {showRestored && initialDraft && (
        <div
          role="status"
          className="mb-space-lg px-space-md py-space-sm rounded-lg border border-primary-container/40 bg-primary-container/10 flex flex-wrap items-center justify-between gap-space-sm font-body-sm text-body-sm text-ink-muted"
        >
          <span className="flex items-center gap-space-xs">
            <Icon name="history" className="text-[18px] text-primary" />
            {P.draftRestored(formatDraftTime(initialDraft.savedAt))}
          </span>
          <button
            type="button"
            onClick={discardDraft}
            className="px-space-sm py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink font-label-md text-label-md transition-colors"
          >
            {P.draftDiscard}
          </button>
        </div>
      )}

      <RestrictionNotice message={restriction} className="mb-space-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-space-2xl">
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          <NewTitleCard value={title} onChange={setTitle} />
          <NewBodyCard editor={editor} />
          <NewTagCard tagInput={tags} suggestions={suggestions} />
          <NewSubmitBar
            onCancel={handleCancel}
            onDraft={draft.saveNow}
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
