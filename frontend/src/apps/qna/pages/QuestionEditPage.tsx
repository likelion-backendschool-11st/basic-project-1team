import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { RestrictionNotice } from '../../../shared/layout/RestrictionNotice';
import { blockIfRestricted, restrictionFor } from '../../../shared/sanctions';
import { updateQuestion } from '../api/questions';
import { editQuestionPage as P, editorMessages } from '../data/mockData';
import type { Question, QuestionUpdateInput } from '../data/types';
import { useAsyncSubmit } from '../hooks/useAsyncSubmit';
import { useQuestionForEdit } from '../hooks/useQuestionForEdit';
import { useTagInput } from '../hooks/useTagInput';
import { useTagSuggestions } from '../hooks/useTagSuggestions';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
import { EditBodyCard } from '../components/compose/EditBodyCard';
import { EditNoticeBanner } from '../components/compose/EditNoticeBanner';
import { EditTagCard } from '../components/compose/EditTagCard';
import { EditTitleCard } from '../components/compose/EditTitleCard';
import { ReasonInputCard } from '../components/compose/ReasonInputCard';
import { EditCautionsCard } from '../components/sidebar/EditCautionsCard';
import { EditStatusCard } from '../components/sidebar/EditStatusCard';
import { OriginalPreviewCard } from '../components/sidebar/OriginalPreviewCard';
import { routes } from '../routes';

interface QuestionEditPageProps {
  readonly className?: string;
}

const sameTags = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((tag, i) => tag === b[i]);

/** 바뀐 필드만 보낸다 (API_SPEC 3장 PATCH). 아무것도 바뀌지 않았으면 null */
function changedFields(
  original: Question,
  title: string,
  body: string,
  tags: readonly string[],
): Omit<QuestionUpdateInput, 'editReason'> | null {
  const changes = {
    title: title !== original.title ? title : undefined,
    body: body !== original.body ? body : undefined,
    tags: sameTags(tags, original.tags) ? undefined : tags,
  };
  return Object.values(changes).some((value) => value !== undefined) ? changes : null;
}

interface QuestionEditFormProps {
  readonly question: Question;
}

/** 불러온 질문으로 입력값을 시작하는 수정 폼 */
const QuestionEditForm: React.FC<QuestionEditFormProps> = ({ question }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(question.title);
  const [reason, setReason] = useState('');
  // 글쓰기 제한·이용 정지 중이면 안내하고 저장을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('write');
  const editor = useRichText(question.body);
  const tags = useTagInput(question.tags, 5, editorMessages.maxTags);
  const suggestions = useTagSuggestions(tags.input, tags.tags);
  const submit = useAsyncSubmit(
    (changes: Omit<QuestionUpdateInput, 'editReason'>) =>
      updateQuestion(question.id, { ...changes, editReason: reason.trim() || undefined }),
    () => {
      window.alert(P.submitDone);
      // TODO: 질문 상세가 API 로 바뀌면 수정한 질문의 상세로 이동한다 (#34)
      navigate(routes.questions());
    },
  );

  const handleSubmit = () => {
    if (blockIfRestricted('write')) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return window.alert(editorMessages.titleRequired);
    // 공백을 뺀 순수 글자 15자 이상 (API_SPEC 3장)
    if (editor.visibleLength < 15) return window.alert(editorMessages.bodyTooShort);
    if (editor.limitError) return window.alert(editor.limitError);
    if (tags.tags.length === 0) return window.alert(editorMessages.tagRequired);
    const changes = changedFields(question, trimmedTitle, editor.value, tags.tags);
    if (!changes) return window.alert(P.noChanges);
    void submit.submit(changes);
  };

  return (
    <>
      <RestrictionNotice message={restriction} className="mb-space-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-space-2xl">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <EditTitleCard value={title} onChange={setTitle} />
          <EditBodyCard editor={editor} />
          <EditTagCard tagInput={tags} suggestions={suggestions} />
          <ReasonInputCard
            label={P.reasonLabel}
            optional={P.reasonOptional}
            hint={P.reasonHint}
            placeholder={P.reasonPlaceholder}
            maxLength={P.reasonMax}
            value={reason}
            onChange={setReason}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
            <Link
              to={routes.question(question.id)}
              className="w-full sm:w-auto px-space-md py-2.5 rounded-lg bg-surface-1 hover:bg-surface-2 text-ink-subtle hover:text-ink font-label-md text-label-md text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              {P.back}
            </Link>
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submit.pending}
                className="w-full sm:w-auto px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-80"
              >
                <Icon
                  name={submit.pending ? 'refresh' : 'check_circle'}
                  className={`text-[18px] transition-transform ${submit.pending ? 'animate-spin' : 'group-hover:rotate-12'}`}
                />
                <span>{submit.pending ? P.submitting : P.submit}</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <EditStatusCard question={question} />
          <EditCautionsCard />
          <OriginalPreviewCard to={routes.question(question.id)} question={question} />
        </aside>
      </div>
    </>
  );
};

export const QuestionEditPage: React.FC<QuestionEditPageProps> = ({ className = '' }) => {
  const { id = '' } = useParams();
  const { question, loading, notFound, errorMessage } = useQuestionForEdit(id);
  // TODO: content_manage 권한 회원도 수정할 수 있게 한다 (#57)
  const message = loading
    ? P.loading
    : notFound
      ? P.notFound
      : (errorMessage ?? (question && !question.isMine ? P.notMine : null));

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="py-space-md flex flex-wrap items-center justify-between gap-space-sm">
        <Breadcrumb
          items={[
            { label: '홈', to: routes.home(), icon: 'home' },
            { label: '질문/답변', to: routes.questions() },
            { label: P.breadcrumbCurrent },
          ]}
        />
      </div>

      <div className="pb-space-lg flex flex-col gap-space-xs">
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">
          {P.title}
        </h1>
        <p className="font-body-md text-body-md text-ink-subtle max-w-3xl">{P.description}</p>
        <EditNoticeBanner />
      </div>

      {message || !question ? (
        <div className="py-space-xl flex flex-col items-center gap-space-sm text-center">
          <p className="font-body-md text-body-md text-ink-subtle">{message}</p>
          {!loading && (
            <Link
              to={routes.questions()}
              className="font-label-md text-label-md text-primary hover:underline"
            >
              {P.backToList}
            </Link>
          )}
        </div>
      ) : (
        <QuestionEditForm question={question} />
      )}
    </div>
  );
};
