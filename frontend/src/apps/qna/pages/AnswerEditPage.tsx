import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { RestrictionNotice } from '../../../shared/layout/RestrictionNotice';
import { blockIfRestricted, restrictionFor } from '../../../shared/sanctions';
import { updateAnswer } from '../api/answers';
import { editAnswerPage as P } from '../data/mockData';
import type { Answer, Question } from '../data/types';
import { useAnswerForEdit } from '../hooks/useAnswerForEdit';
import { useAsyncSubmit } from '../hooks/useAsyncSubmit';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
import { AnswerEditorCard } from '../components/compose/AnswerEditorCard';
import { ReasonInputCard } from '../components/compose/ReasonInputCard';
import { TargetQuestionCard } from '../components/compose/TargetQuestionCard';
import { AnswerCautionsCard } from '../components/sidebar/AnswerCautionsCard';
import { MyAnswerStatusCard } from '../components/sidebar/MyAnswerStatusCard';
import { OriginalQuestionLinkCard } from '../components/sidebar/OriginalQuestionLinkCard';
import { routes } from '../routes';

interface AnswerEditPageProps {
  readonly className?: string;
}

interface AnswerEditFormProps {
  readonly answer: Answer;
  readonly question: Question;
}

/** 불러온 답변으로 본문을 시작하는 수정 폼 */
const AnswerEditForm: React.FC<AnswerEditFormProps> = ({ answer, question }) => {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  // 글쓰기 제한·이용 정지 중이면 안내하고 저장을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('write');
  const editor = useRichText(answer.body);
  const questionTo = routes.question(question.id);
  const submit = useAsyncSubmit(
    () => updateAnswer(answer.id, { body: editor.value, editReason: reason.trim() || undefined }),
    () => {
      window.alert(P.submitDone);
      // 상세 화면에서 수정한 답변으로 스크롤한다
      navigate(`${questionTo}#${routes.answerAnchor(answer.id)}`);
    },
  );

  const handleSubmit = () => {
    if (blockIfRestricted('write')) return;
    if (editor.isEmpty) return window.alert(P.bodyRequired);
    if (editor.limitError) return window.alert(editor.limitError);
    if (editor.value === answer.body) return window.alert(P.noChanges);
    void submit.submit();
  };

  return (
    <>
      <RestrictionNotice message={restriction} className="mt-space-md" />
      <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          <TargetQuestionCard question={question} questionTo={questionTo} />
          <AnswerEditorCard editor={editor} />
          <ReasonInputCard
            variant="answer"
            label={P.reasonLabel}
            optional={P.reasonOptional}
            hint={P.reasonVersion}
            placeholder={P.reasonPlaceholder}
            maxLength={P.reasonMax}
            value={reason}
            onChange={setReason}
            footnote={P.reasonHint}
          />

          <div className="sticky bottom-4 z-40 p-space-sm rounded-xl bg-canvas/90 backdrop-blur-xl border border-hairline-strong shadow-2xl flex flex-col-reverse sm:flex-row items-center justify-between gap-space-sm">
            <Link
              to={questionTo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-1 hover:bg-surface-2 border border-hairline text-ink-muted hover:text-ink font-label-md text-label-md transition-colors"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              {P.back}
            </Link>
            <div className="w-full sm:w-auto flex items-center justify-end gap-space-xs">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submit.pending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-space-lg py-2 rounded-lg bg-primary-container hover:bg-primary-hover text-on-primary-container font-label-md text-label-md font-semibold transition-all shadow-md active:bg-primary-focus disabled:opacity-80"
              >
                <Icon
                  name={submit.pending ? 'refresh' : 'check_circle'}
                  className={`text-[18px] ${submit.pending ? 'animate-spin' : ''}`}
                />
                {submit.pending ? P.submitting : P.submit}
              </button>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <MyAnswerStatusCard answer={answer} />
          <AnswerCautionsCard />
          <OriginalQuestionLinkCard to={questionTo} question={question} />
        </aside>
      </div>
    </>
  );
};

export const AnswerEditPage: React.FC<AnswerEditPageProps> = ({ className = '' }) => {
  const { id: questionId = '', answerId = '' } = useParams();
  const { answer, question, loading, notFound, errorMessage } = useAnswerForEdit(
    questionId,
    answerId,
  );
  // 채택된 답변은 수정할 수 없다. 서버도 409 ANSWER_ALREADY_ACCEPTED 로 막는다 (REQ-QNA-012)
  const accepted = answer?.isAccepted ?? false;
  // TODO: content_manage 권한 회원도 수정할 수 있게 한다 (#57)
  const message = loading
    ? P.loading
    : notFound
      ? P.notFound
      : (errorMessage ?? (answer && !answer.isMine ? P.notMine : null));
  const canEdit = !message && !accepted;

  return (
    <div className={`flex flex-col w-full pb-space-2xl ${className}`}>
      <div className="flex flex-col gap-space-sm pt-space-lg pb-space-md border-b border-hairline">
        <Breadcrumb
          items={[
            { label: '홈', to: routes.home(), icon: 'home' },
            { label: '질문/답변', to: routes.questions() },
            { label: P.breadcrumbCurrent },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pt-space-xs">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight flex items-center gap-space-xs">
              {P.title}
              <span className="font-code-inline text-caption text-primary font-normal bg-primary-container/15 px-2 py-0.5 rounded border border-primary-container/30">
                {P.codePrefix}
                {answerId}
              </span>
            </h1>
            <p className="font-body-md text-body-md text-ink-subtle mt-0.5">{P.description}</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2 text-ink-tertiary font-caption text-caption">
              <Icon name="history" className="text-[16px]" />
              <span>{P.editNote}</span>
            </div>
          )}
        </div>
      </div>

      {message || !answer || !question ? (
        <div className="py-space-xl flex flex-col items-center gap-space-sm text-center">
          <p className="font-body-md text-body-md text-ink-subtle">{message}</p>
          {!loading && (
            <Link
              to={routes.question(questionId)}
              className="font-label-md text-label-md text-primary hover:underline"
            >
              {P.acceptedBlocked.back}
            </Link>
          )}
        </div>
      ) : accepted ? (
        <div className="mt-space-lg rounded-xl bg-surface-1 border border-hairline-strong p-space-lg flex flex-col items-start gap-space-sm">
          <div className="flex items-center gap-2">
            <Icon name="lock" className="text-[20px] text-semantic-success" />
            <h2 className="font-headline-sm text-headline-sm text-ink font-semibold">
              {P.acceptedBlocked.title}
            </h2>
          </div>
          <p className="font-body-md text-body-md text-ink-muted leading-relaxed">
            {P.acceptedBlocked.body}
          </p>
          <Link
            to={routes.question(questionId)}
            className="mt-space-xs inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink font-label-md text-label-md transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            {P.acceptedBlocked.back}
          </Link>
        </div>
      ) : (
        <AnswerEditForm answer={answer} question={question} />
      )}
    </div>
  );
};
