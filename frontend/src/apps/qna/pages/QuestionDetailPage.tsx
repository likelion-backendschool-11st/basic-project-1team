import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { answers, questionDetailLabels as L } from '../data/mockData';
import { AnswerCard } from '../components/detail/AnswerCard';
import { AnswerComposer } from '../components/detail/AnswerComposer';
import { AuthorProfileCard } from '../components/detail/AuthorProfileCard';
import { DetailToolbar } from '../components/detail/DetailToolbar';
import { QuestionArticle } from '../components/detail/QuestionArticle';
import { QuestionMetaCard } from '../components/detail/QuestionMetaCard';
import { RelatedQuestionsCard } from '../components/detail/RelatedQuestionsCard';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { isLoggedIn } from '../../../shared/auth';
import { routes } from '../routes';

interface QuestionDetailPageProps {
  readonly className?: string;
}

export const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ className = '' }) => {
  const { id = '1' } = useParams();
  const [sort, setSort] = useState('votes');
  // mock: 비회원에게는 서버가 본인 기준 값(isMine, canAccept)을 false 로 내려준다
  const loggedIn = isLoggedIn();
  const visibleAnswers = answers.map((a) => ({ ...a, canEdit: loggedIn && a.canEdit, canAccept: loggedIn && a.canAccept }));
  const sorted = sort === 'votes' ? [...visibleAnswers].sort((a, b) => b.votes - a.votes) : [...visibleAnswers].sort((a, b) => b.answeredAt.localeCompare(a.answeredAt));

  return (
    <div className={`flex flex-col w-full py-space-lg space-y-space-lg ${className}`}>
      <DetailToolbar
        homeTo={routes.home()}
        boardTo={routes.questions()}
        editTo={routes.editQuestion(id)}
        reportTo={routes.report(id)}
        canEdit={loggedIn}
        onDelete={() => window.alert(L.removeBlockedAlert)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col space-y-space-lg min-w-0">
          <QuestionArticle reportTo={routes.report(id)} tagLinkTo={routes.questionsByTag} />

          <section className="flex flex-col space-y-space-md pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline-md text-headline-md text-ink font-semibold">{L.answersHeading}</h2>
                <span className="font-code-inline text-headline-sm text-secondary font-semibold">{answers.length}개</span>
              </div>
              <SegmentedControl options={L.answerSort} value={sort} onChange={setSort} />
            </div>
            {sorted.map((a) => (
              <AnswerCard key={a.id} answer={a} editTo={routes.editAnswer(id, a.id)} reportTo={routes.report(id)} />
            ))}
          </section>

          <AnswerComposer onSubmit={() => window.alert('답변이 등록되었습니다.')} />
        </div>

        <aside className="lg:col-span-4 flex flex-col space-y-space-md w-full">
          <QuestionMetaCard />
          <AuthorProfileCard />
          <RelatedQuestionsCard linkFor={routes.question} />
        </aside>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
