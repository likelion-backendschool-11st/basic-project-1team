import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getContents } from '../api/contents';
import { AnswerTable } from '../components/content/AnswerTable';
import { AuthorFilterNotice } from '../components/content/AuthorFilterNotice';
import { QuestionTable } from '../components/content/QuestionTable';
import { StatusChangeModal } from '../components/content/StatusChangeModal';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import {
  confirmDeleteCopy,
  confirmHideAcceptedCopy,
  contentStatusOptions,
  qnaCopy,
  ui,
} from '../data/mockData';
import { useContentCounts } from '../hooks/useContentCounts';
import { useContentModeration } from '../hooks/useContentModeration';
import { usePagedList } from '../hooks/usePagedList';
import type { Answer, ContentStatus, Question } from '../types';

type QnaTab = 'questions' | 'answers';

const PAGE_SIZE = 20;
const AUTHOR_PARAM = 'authorId';

interface QnaFilters {
  readonly query: string;
  readonly tag: string;
  /** 'all' 은 삭제된 항목을 뺀 전체 */
  readonly status: string;
  /** 회원 상세에서 넘어오면 그 회원 id, 아니면 '' */
  readonly authorId: string;
}

const toQuery = (f: QnaFilters, page: number, size: number) => ({
  page,
  size,
  keyword: f.query.trim() || undefined,
  status: f.status === 'all' ? undefined : (f.status as ContentStatus),
  authorId: f.authorId ? Number(f.authorId) : undefined,
});

const fetchQuestions = (f: QnaFilters, page: number, size: number) =>
  getContents('question', { ...toQuery(f, page, size), tag: f.tag.trim() || undefined });

const fetchAnswers = (f: QnaFilters, page: number, size: number) =>
  getContents('answer', toQuery(f, page, size));

interface PanelProps {
  readonly authorId: string;
  readonly onClearAuthor: () => void;
  /** 숨김·삭제 뒤 탭 배지를 다시 센다 */
  readonly onChanged: () => void;
}

const QuestionsPanel: React.FC<PanelProps> = ({ authorId, onClearAuthor, onChanged }) => {
  const list = usePagedList<Question, QnaFilters>(
    { query: '', tag: '', status: 'all', authorId },
    PAGE_SIZE,
    fetchQuestions,
  );
  const { reload } = list;
  const moderation = useContentModeration(
    'question',
    useCallback(() => {
      reload();
      onChanged();
    }, [reload, onChanged]),
  );

  // 함께 바뀌는 것을 알린다: 답변 삭제, 태그 연결 해제 (API_SPEC 10장, 10.3)
  const remove = (q: Question) =>
    moderation.askDelete(q.id, [
      ...(q.answerCount > 0 ? [confirmDeleteCopy.questionCascade] : []),
      ...(q.tags.length > 0 ? [confirmDeleteCopy.questionTagsCut] : []),
    ]);

  return (
    <>
      {authorId && <AuthorFilterNotice authorId={authorId} onClear={onClearAuthor} />}
      <FilterBar onSubmit={list.submit}>
        <TextInput
          className="min-w-[240px] flex-[1.3]"
          placeholder={qnaCopy.searchPlaceholder}
          value={list.draft.query}
          onChange={(event) => list.update('query', event.target.value)}
        />
        <TextInput
          className="min-w-[200px] flex-1"
          placeholder={qnaCopy.tagPlaceholder}
          value={list.draft.tag}
          onChange={(event) => list.update('tag', event.target.value)}
        />
        <Select
          className="w-[186px]"
          options={contentStatusOptions}
          value={list.draft.status}
          onChange={(v) => list.update('status', v)}
        />
      </FilterBar>

      <div className="mb-4 flex items-center justify-between gap-4">
        <ResultCount count={list.totalCount} />
        {moderation.actionError && (
          <p role="alert" className="text-body-md text-error">
            {moderation.actionError}
          </p>
        )}
      </div>

      <QuestionTable
        rows={list.items}
        pagination={list}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        onToggleHidden={(q) => moderation.askStatusChange(q)}
        onRemove={remove}
      />
      <StatusChangeModal
        request={moderation.statusRequest}
        onConfirm={moderation.confirmStatusChange}
        onClose={moderation.closeStatusChange}
      />
      <ConfirmDeleteModal state={moderation.confirmDelete} />
    </>
  );
};

const AnswersPanel: React.FC<PanelProps> = ({ authorId, onClearAuthor, onChanged }) => {
  const list = usePagedList<Answer, QnaFilters>(
    { query: '', tag: '', status: 'all', authorId },
    PAGE_SIZE,
    fetchAnswers,
  );
  const { reload } = list;
  const moderation = useContentModeration(
    'answer',
    useCallback(() => {
      reload();
      onChanged();
    }, [reload, onChanged]),
  );

  // 채택된 답변은 숨기면 채택이 풀리고 복구해도 돌아오지 않으므로 함께 알린다 (API_SPEC 10.3)
  const toggleHidden = (a: Answer) =>
    moderation.askStatusChange(
      a,
      a.isAccepted && a.status === 'active'
        ? [confirmHideAcceptedCopy.released, confirmHideAcceptedCopy.notRestored]
        : [],
    );

  // 채택된 답변을 지우면 질문의 채택 상태도 풀린다 (API_SPEC 10.3)
  const remove = (a: Answer) =>
    moderation.askDelete(a.id, a.isAccepted ? [confirmDeleteCopy.acceptedAnswer] : []);

  return (
    <>
      {authorId && <AuthorFilterNotice authorId={authorId} onClear={onClearAuthor} />}
      <FilterBar onSubmit={list.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={qnaCopy.answerSearchPlaceholder}
          value={list.draft.query}
          onChange={(event) => list.update('query', event.target.value)}
        />
        <Select
          className="w-[186px]"
          options={contentStatusOptions}
          value={list.draft.status}
          onChange={(v) => list.update('status', v)}
        />
      </FilterBar>

      <div className="mb-4 flex items-center justify-between gap-4">
        <ResultCount count={list.totalCount} />
        {moderation.actionError && (
          <p role="alert" className="text-body-md text-error">
            {moderation.actionError}
          </p>
        )}
      </div>

      <AnswerTable
        rows={list.items}
        pagination={list}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        onToggleHidden={toggleHidden}
        onRemove={remove}
      />
      <StatusChangeModal
        request={moderation.statusRequest}
        onConfirm={moderation.confirmStatusChange}
        onClose={moderation.closeStatusChange}
      />
      <ConfirmDeleteModal state={moderation.confirmDelete} />
    </>
  );
};

/**
 * 탭(?tab=answers)과 회원 필터(?authorId=)는 주소에 둬서 회원 상세에서 바로 열 수 있게 한다.
 * 패널은 authorId 별로 key 를 달아, 회원 필터를 풀면 필터 없는 목록으로 새로 그린다.
 */
export const QnaPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const active: QnaTab = params.get('tab') === 'answers' ? 'answers' : 'questions';
  const authorId = params.get(AUTHOR_PARAM) ?? '';
  const counts = useContentCounts(['question', 'answer']);

  const tabs: readonly TabItem<QnaTab>[] = [
    { key: 'questions', label: qnaCopy.tabs.questions, count: counts.counts.question },
    { key: 'answers', label: qnaCopy.tabs.answers, count: counts.counts.answer },
  ];

  const select = (tab: QnaTab) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });

  const clearAuthor = () =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(AUTHOR_PARAM);
      return next;
    });

  const panelProps: PanelProps = { authorId, onClearAuthor: clearAuthor, onChanged: counts.reload };

  return (
    <>
      <PageHeader title={qnaCopy.title} description={qnaCopy.description} />
      <TabBar tabs={tabs} active={active} onChange={select} />
      {active === 'questions' ? (
        <QuestionsPanel key={`q-${authorId}`} {...panelProps} />
      ) : (
        <AnswersPanel key={`a-${authorId}`} {...panelProps} />
      )}
    </>
  );
};
