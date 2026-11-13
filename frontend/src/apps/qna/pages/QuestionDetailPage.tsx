import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { answerComposer, questionDetailLabels as L } from '../data/mockData';
import { formatCount } from '../display';
import { useQuestionDetail } from '../hooks/useQuestionDetail';
import { useRelatedQuestions } from '../hooks/useRelatedQuestions';
import { AnswerCard } from '../components/detail/AnswerCard';
import { AnswerComposer } from '../components/detail/AnswerComposer';
import { AuthorProfileCard } from '../components/detail/AuthorProfileCard';
import { DetailToolbar } from '../components/detail/DetailToolbar';
import { QuestionArticle } from '../components/detail/QuestionArticle';
import { QuestionMetaCard } from '../components/detail/QuestionMetaCard';
import { RelatedQuestionsCard } from '../components/detail/RelatedQuestionsCard';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { routes } from '../routes';

interface QuestionDetailPageProps {
  readonly className?: string;
}

export const QuestionDetailPage: React.FC<QuestionDetailPageProps> = ({ className = '' }) => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const detail = useQuestionDetail(id);
  const related = useRelatedQuestions(id);
  const { question, answers } = detail;
  const { hash } = useLocation();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const scrolledHash = useRef<string | null>(null);

  // 프로필 답변 목록에서 /questions/:id#answer-<id> 로 들어오면 그 답변으로 스크롤하고 잠시 강조한다.
  // 답변은 질문과 따로 불러오므로 목록이 그려진 뒤에 찾고, 같은 주소로는 한 번만 한다
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (!target || scrolledHash.current === hash) return undefined;
    scrolledHash.current = hash;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightedId(hash.slice(1));
    const timer = window.setTimeout(() => setHighlightedId(null), 2500);
    return () => window.clearTimeout(timer);
  }, [hash, answers]);

  if (detail.notFound || detail.errorMessage || !question) {
    return (
      <div className={`flex flex-col items-center gap-space-md w-full py-space-2xl ${className}`}>
        <p className="font-body-md text-body-md text-ink-subtle">
          {detail.notFound ? L.notFound : (detail.errorMessage ?? L.loading)}
        </p>
        {!detail.loading && (
          <Link
            to={routes.questions()}
            className="px-space-md py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-hairline text-ink font-label-md text-label-md transition-colors"
          >
            {L.board}
          </Link>
        )}
      </div>
    );
  }

  const submitAnswer = async (body: string) => {
    const created = await detail.addAnswer(body);
    if (!created) return false;
    window.alert(answerComposer.submitted);
    // 등록한 답변으로 스크롤한다 (목록을 다시 불러와 그린 뒤)
    window.setTimeout(
      () =>
        document
          .getElementById(routes.answerAnchor(created.id))
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      300,
    );
    return true;
  };

  return (
    <div className={`flex flex-col w-full py-space-lg space-y-space-lg ${className}`}>
      <DetailToolbar
        homeTo={routes.home()}
        boardTo={routes.questions()}
        editTo={routes.editQuestion(id)}
        reportTo={routes.report(id)}
        canEdit={question.isMine}
        onDelete={() => {
          void detail.removeQuestion().then((isRemoved) => {
            if (isRemoved) navigate(routes.questions());
          });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col space-y-space-lg min-w-0">
          <QuestionArticle
            question={question}
            reportTo={routes.report(id)}
            tagLinkTo={routes.questionsByTag}
          />

          <section className="flex flex-col space-y-space-md pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline-md text-headline-md text-ink font-semibold">
                  {L.answersHeading}
                </h2>
                <span className="font-code-inline text-headline-sm text-secondary font-semibold">
                  {L.answersCount(formatCount(answers.length))}
                </span>
              </div>
              <SegmentedControl
                options={L.answerSort}
                value={detail.sort}
                onChange={detail.setSort}
              />
            </div>
            {/* 채택된 답변이 맨 위, 나머지는 최신순·추천순 (서버가 정렬, REQ-QNA-005) */}
            {answers.map((a) => (
              <AnswerCard
                key={a.id}
                answer={a}
                onDelete={() => void detail.removeAnswer(a)}
                onAccept={() => void detail.accept(a)}
                highlighted={highlightedId === routes.answerAnchor(a.id)}
                editTo={routes.editAnswer(id, a.id)}
                reportTo={routes.reportTarget(
                  'answer',
                  a.id,
                  `${routes.question(id)}#${routes.answerAnchor(a.id)}`,
                )}
              />
            ))}
          </section>

          <AnswerComposer onSubmit={submitAnswer} />
        </div>

        <aside className="lg:col-span-4 flex flex-col space-y-space-md w-full">
          <QuestionMetaCard question={question} />
          <AuthorProfileCard author={question.author} />
          <RelatedQuestionsCard items={related} linkFor={routes.question} />
        </aside>
      </div>
    </div>
  );
};
