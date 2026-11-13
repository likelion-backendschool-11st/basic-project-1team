import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { RestrictionNotice } from '../../../shared/layout/RestrictionNotice';
import { blockIfRestricted, restrictionFor } from '../../../shared/sanctions';
import { editAnswerPage as P } from '../data/mockData';
import { useQuestionDetail } from '../hooks/useQuestionDetail';
import { useSubmitAction } from '../hooks/useSubmitAction';
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

export const AnswerEditPage: React.FC<AnswerEditPageProps> = ({ className = '' }) => {
  const { id = '1', answerId } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>(P.initialReason);
  // 수정 화면은 상세와 같은 답변 데이터(API 의 body HTML)로 시작한다. TODO: GET /api/answers/:answerId
  const { answers } = useQuestionDetail(id);
  // 글쓰기 제한·이용 정지 중이면 안내하고 저장을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('write');
  const answer = answers.find((a) => a.id === answerId);
  // 채택된 답변은 수정할 수 없다. 서버도 409 ANSWER_ALREADY_ACCEPTED 로 막는다 (REQ-QNA-012)
  const accepted = answer?.accepted ?? false;
  const editor = useRichText(answer?.body ?? '');
  const submit = useSubmitAction(() => {
    window.alert(P.submitDone);
    navigate(routes.question(id));
  });

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
          {!accepted && (
            <div className="flex items-center gap-2 text-ink-tertiary font-caption text-caption">
              <Icon name="history" className="text-[16px]" />
              <span>{P.editNote}</span>
            </div>
          )}
        </div>
      </div>

      {accepted ? (
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
            to={routes.question(id)}
            className="mt-space-xs inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink font-label-md text-label-md transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            {P.acceptedBlocked.back}
          </Link>
        </div>
      ) : (
        <>
          <RestrictionNotice message={restriction} className="mt-space-md" />
          <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
              <TargetQuestionCard questionTo={routes.question(id)} />
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
                  to={routes.question(id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-1 hover:bg-surface-2 border border-hairline text-ink-muted hover:text-ink font-label-md text-label-md transition-colors"
                >
                  <Icon name="arrow_back" className="text-[16px]" />
                  {P.back}
                </Link>
                <div className="w-full sm:w-auto flex items-center justify-end gap-space-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (blockIfRestricted('write')) return;
                      if (editor.limitError) window.alert(editor.limitError);
                      else submit.submit();
                    }}
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
              <MyAnswerStatusCard />
              <AnswerCautionsCard />
              <OriginalQuestionLinkCard to={routes.question(id)} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
};
