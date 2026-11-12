import React from 'react';
import { AnswerTable } from '../components/content/AnswerTable';
import { QuestionTable } from '../components/content/QuestionTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { answers, confirmDeleteCopy, pageCounts, qnaCopy, questions, contentStatusOptions } from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { matchesStatus, useModeration } from '../hooks/useModeration';
import { usePagination } from '../hooks/usePagination';
import { includesText, useSearchFilter } from '../hooks/useSearchFilter';
import { useTabs } from '../hooks/useTabs';
import type { Answer, Question } from '../types';

type QnaTab = 'questions' | 'answers';

interface QuestionFilters extends Record<string, string> {
  query: string;
  tag: string;
  status: string;
}

interface AnswerFilters extends Record<string, string> {
  query: string;
  status: string;
}

const tabs: readonly TabItem<QnaTab>[] = [
  { key: 'questions', label: qnaCopy.tabs.questions, count: qnaCopy.tabCounts.questions },
  { key: 'answers', label: qnaCopy.tabs.answers, count: qnaCopy.tabCounts.answers },
];

const matchQuestion = (q: Question, f: QuestionFilters) =>
  includesText([q.title, q.author], f.query) &&
  includesText([q.tag], f.tag) &&
  matchesStatus(q.status, f.status);

const matchAnswer = (a: Answer, f: AnswerFilters) =>
  includesText([a.preview, a.author], f.query) && matchesStatus(a.status, f.status);

const QuestionsPanel: React.FC = () => {
  const moderation = useModeration(questions);
  const filter = useSearchFilter(moderation.rows, { query: '', tag: '', status: 'all' }, matchQuestion);
  const pagination = usePagination(pageCounts.questions);
  const isFiltered = filter.applied.query !== '' || filter.applied.tag !== '' || filter.applied.status !== 'all';
  const confirmDelete = useConfirmDelete();

  const remove = (id: number) => {
    const question = moderation.rows.find((q) => q.id === id);
    confirmDelete.ask({
      target: `${confirmDeleteCopy.targets.question} #${id}`,
      notes: question && question.answers > 0 ? [confirmDeleteCopy.questionCascade] : [],
      onConfirm: () => moderation.remove(id),
    });
  };

  return (
    <>
      <FilterBar onSubmit={filter.submit}>
        <TextInput
          className="min-w-[240px] flex-[1.3]"
          placeholder={qnaCopy.searchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <TextInput
          className="min-w-[200px] flex-1"
          placeholder={qnaCopy.tagPlaceholder}
          value={filter.draft.tag}
          onChange={(event) => filter.update('tag', event.target.value)}
        />
        <Select className="w-[186px]" options={contentStatusOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : qnaCopy.tabCounts.questions} />
      </div>

      <QuestionTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={remove} />
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
};

const AnswersPanel: React.FC = () => {
  const moderation = useModeration(answers);
  const filter = useSearchFilter(moderation.rows, { query: '', status: 'all' }, matchAnswer);
  const pagination = usePagination(pageCounts.answers);
  const isFiltered = filter.applied.query !== '' || filter.applied.status !== 'all';

  const confirmDelete = useConfirmDelete();

  // 채택된 답변을 지우면 질문의 채택 상태도 풀린다는 점을 함께 알린다 (API_SPEC 10.3)
  const remove = (answer: Answer) =>
    confirmDelete.ask({
      target: `${confirmDeleteCopy.targets.answer} #${answer.id}`,
      notes: answer.accepted ? [confirmDeleteCopy.acceptedAnswer] : [],
      onConfirm: () => moderation.remove(answer.id),
    });

  return (
    <>
      <FilterBar onSubmit={filter.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={qnaCopy.answerSearchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <Select className="w-[186px]" options={contentStatusOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : qnaCopy.tabCounts.answers} />
      </div>

      <AnswerTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={remove} />
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
};

export const QnaPage: React.FC = () => {
  const tab = useTabs<QnaTab>('questions');

  return (
    <>
      <PageHeader title={qnaCopy.title} description={qnaCopy.description} />
      <TabBar tabs={tabs} active={tab.active} onChange={tab.select} />
      {tab.active === 'questions' ? <QuestionsPanel /> : <AnswersPanel />}
    </>
  );
};
