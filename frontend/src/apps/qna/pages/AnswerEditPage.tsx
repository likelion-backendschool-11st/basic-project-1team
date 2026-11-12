import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { editAnswerPage as P } from '../data/mockData';
import { useAttachments } from '../hooks/useAttachments';
import { useSubmitAction } from '../hooks/useSubmitAction';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Icon } from '../components/common/Icon';
import { AnswerAttachmentsCard } from '../components/compose/AnswerAttachmentsCard';
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
  const { id = '1' } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState<string>(P.initialReason);
  const editor = useRichText(P.initialBody);
  const files = useAttachments(P.attachments);
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
                {P.code}
              </span>
            </h1>
            <p className="font-body-md text-body-md text-ink-subtle mt-0.5">{P.description}</p>
          </div>
          <div className="flex items-center gap-2 text-ink-tertiary font-caption text-caption">
            <Icon name="verified" className="text-[16px] text-semantic-success" />
            <span>{P.acceptedNote}</span>
          </div>
        </div>
      </div>

      <div className="mt-space-md rounded-xl bg-semantic-success-surface border border-semantic-success-border p-space-md flex items-start gap-space-sm">
        <div className="p-1 rounded bg-semantic-success/10 text-semantic-success shrink-0 mt-0.5">
          <Icon name="workspace_premium" className="text-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-semantic-success font-semibold">
              {P.bannerTitle}
            </span>
            <span className="px-1.5 py-px rounded bg-semantic-success-border font-code-inline text-[10px] text-secondary-fixed">
              {P.bannerBadge}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-ink-muted mt-1 leading-relaxed">
            {P.bannerPrefix}
            <code className="font-code-inline text-code-inline text-ink px-1 rounded bg-surface-2 border border-hairline">
              {P.bannerCode}
            </code>
            {P.bannerSuffix}
          </p>
        </div>
      </div>

      <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg min-w-0">
          <TargetQuestionCard questionTo={routes.question(id)} />
          <AnswerEditorCard editor={editor} />
          <AnswerAttachmentsCard files={files} />
          <ReasonInputCard
            variant="answer"
            label={P.reasonLabel}
            optional={P.reasonOptional}
            hint={P.reasonVersion}
            placeholder={P.reasonPlaceholder}
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
                onClick={() =>
                  editor.limitError ? window.alert(editor.limitError) : submit.submit()
                }
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
    </div>
  );
};
