import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRichText } from '../../../shared/editor/useRichText';
import { RestrictionNotice } from '../../../shared/layout/RestrictionNotice';
import { blockIfRestricted, restrictionFor } from '../../../shared/sanctions';
import { editQuestionPage as P, editorMessages } from '../data/mockData';
import { useAttachments } from '../hooks/useAttachments';
import { useQuestionDetail } from '../hooks/useQuestionDetail';
import { useSubmitAction } from '../hooks/useSubmitAction';
import { useTagInput } from '../hooks/useTagInput';
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

export const QuestionEditPage: React.FC<QuestionEditPageProps> = ({ className = '' }) => {
  const { id = '1' } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>(P.initialTitle);
  const [reason, setReason] = useState<string>(P.initialReason);
  // 수정 화면은 상세와 같은 데이터(API 의 body HTML)로 시작한다
  const { question } = useQuestionDetail(id);
  // 글쓰기 제한·이용 정지 중이면 안내하고 저장을 막는다 (API_SPEC 1.2)
  const restriction = restrictionFor('write');
  const editor = useRichText(question.body);
  const files = useAttachments(P.attachments);
  const tags = useTagInput(P.initialTags, 5, editorMessages.maxTags);
  const submit = useSubmitAction(() => {
    window.alert(P.submitDone);
    navigate(routes.question(id));
  }, 700);

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

      <RestrictionNotice message={restriction} className="mb-space-lg" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-space-2xl">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <EditTitleCard value={title} onChange={setTitle} />
          <EditBodyCard editor={editor} files={files} />
          <EditTagCard tagInput={tags} />
          <ReasonInputCard
            label={P.reasonLabel}
            optional={P.reasonOptional}
            hint={P.reasonHint}
            placeholder={P.reasonPlaceholder}
            value={reason}
            onChange={setReason}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
            <Link
              to={routes.question(id)}
              className="w-full sm:w-auto px-space-md py-2.5 rounded-lg bg-surface-1 hover:bg-surface-2 text-ink-subtle hover:text-ink font-label-md text-label-md text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              {P.back}
            </Link>
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  if (blockIfRestricted('write')) return;
                  if (editor.limitError) window.alert(editor.limitError);
                  else submit.submit();
                }}
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
          <EditStatusCard />
          <EditCautionsCard />
          <OriginalPreviewCard to={routes.question(id)} />
        </aside>
      </div>
    </div>
  );
};
