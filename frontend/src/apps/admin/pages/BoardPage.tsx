import { PostTable } from '../components/content/PostTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { boardCopy, pageCounts, posts, visibilityOptions } from '../data/mockData';
import { useModeration } from '../hooks/useModeration';
import { usePagination } from '../hooks/usePagination';
import { includesText, useSearchFilter } from '../hooks/useSearchFilter';
import { useTabs } from '../hooks/useTabs';
import type { Post } from '../types';

interface BoardPageProps {}

type BoardTab = 'posts' | 'comments';

interface PostFilters extends Record<string, string> {
  query: string;
  status: string;
}

const tabs: readonly TabItem<BoardTab>[] = [
  { key: 'posts', label: boardCopy.tabs.posts, count: boardCopy.tabCounts.posts },
  { key: 'comments', label: boardCopy.tabs.comments, count: boardCopy.tabCounts.comments },
];

const matchPost = (p: Post, f: PostFilters) =>
  includesText([p.title, p.author], f.query) && (f.status === 'all' || (f.status === 'hidden') === p.hidden);

export function BoardPage(_props: Readonly<BoardPageProps>) {
  const tab = useTabs<BoardTab>('posts');
  const moderation = useModeration(posts);
  const filter = useSearchFilter(moderation.rows, { query: '', status: 'all' }, matchPost);
  const pagination = usePagination(pageCounts.posts);
  const isFiltered = filter.applied.query !== '' || filter.applied.status !== 'all';

  return (
    <>
      <PageHeader title={boardCopy.title} description={boardCopy.description} />
      <TabBar tabs={tabs} active={tab.active} onChange={tab.select} />

      <FilterBar onSubmit={filter.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={boardCopy.searchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <Select className="w-[288px]" options={visibilityOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : boardCopy.tabCounts[tab.active]} />
      </div>

      <PostTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={moderation.remove} />
    </>
  );
}

export default BoardPage;
