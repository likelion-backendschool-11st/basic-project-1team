import { QuestionTable } from '../components/content/QuestionTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { pageCounts, qnaCopy, questions, visibilityOptions } from '../data/mockData';
import { useModeration } from '../hooks/useModeration';
import { usePagination } from '../hooks/usePagination';
import { includesText, useSearchFilter } from '../hooks/useSearchFilter';
import { useTabs } from '../hooks/useTabs';
import type { Question } from '../types';

interface QnaPageProps {}

type QnaTab = 'questions' | 'answers';

interface QuestionFilters extends Record<string, string> {
  query: string;
  tag: string;
  status: string;
}

const tabs: readonly TabItem<QnaTab>[] = [
  { key: 'questions', label: qnaCopy.tabs.questions, count: qnaCopy.tabCounts.questions },
  { key: 'answers', label: qnaCopy.tabs.answers, count: qnaCopy.tabCounts.answers },
];

const matchQuestion = (q: Question, f: QuestionFilters) =>
  includesText([q.title, q.author], f.query) &&
  includesText([q.tag], f.tag) &&
  (f.status === 'all' || (f.status === 'hidden') === q.hidden);

export function QnaPage(_props: Readonly<QnaPageProps>) {
  const tab = useTabs<QnaTab>('questions');
  const moderation = useModeration(questions);
  const filter = useSearchFilter(moderation.rows, { query: '', tag: '', status: 'all' }, matchQuestion);
  const pagination = usePagination(pageCounts.questions);
  const isFiltered = filter.applied.query !== '' || filter.applied.tag !== '' || filter.applied.status !== 'all';

  return (
    <>
      <PageHeader title={qnaCopy.title} description={qnaCopy.description} />
      <TabBar tabs={tabs} active={tab.active} onChange={tab.select} />

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
        <Select className="w-[186px]" options={visibilityOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : qnaCopy.tabCounts[tab.active]} />
      </div>

      <QuestionTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={moderation.remove} />
    </>
  );
}

export default QnaPage;
