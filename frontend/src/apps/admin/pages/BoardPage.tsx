import { CommentTable } from '../components/content/CommentTable';
import { PostTable } from '../components/content/PostTable';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { boardCopy, comments, confirmDeleteCopy, pageCounts, posts, contentStatusOptions } from '../data/mockData';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { matchesStatus, useModeration } from '../hooks/useModeration';
import { usePagination } from '../hooks/usePagination';
import { includesText, useSearchFilter } from '../hooks/useSearchFilter';
import { useTabs } from '../hooks/useTabs';
import type { Comment, Post } from '../types';

type BoardTab = 'posts' | 'comments';

interface ContentFilters extends Record<string, string> {
  query: string;
  status: string;
}

const tabs: readonly TabItem<BoardTab>[] = [
  { key: 'posts', label: boardCopy.tabs.posts, count: boardCopy.tabCounts.posts },
  { key: 'comments', label: boardCopy.tabs.comments, count: boardCopy.tabCounts.comments },
];

const matchPost = (p: Post, f: ContentFilters) =>
  includesText([p.title, p.author], f.query) && matchesStatus(p.status, f.status);

const matchComment = (c: Comment, f: ContentFilters) =>
  includesText([c.preview, c.author], f.query) && matchesStatus(c.status, f.status);

function PostsPanel() {
  const moderation = useModeration(posts);
  const filter = useSearchFilter(moderation.rows, { query: '', status: 'all' }, matchPost);
  const pagination = usePagination(pageCounts.posts);
  const isFiltered = filter.applied.query !== '' || filter.applied.status !== 'all';
  const confirmDelete = useConfirmDelete();

  const remove = (id: number) => {
    const post = moderation.rows.find((p) => p.id === id);
    confirmDelete.ask({
      target: `${confirmDeleteCopy.targets.post} #${id}`,
      notes: post && post.comments > 0 ? [confirmDeleteCopy.postCascade] : [],
      onConfirm: () => moderation.remove(id),
    });
  };

  return (
    <>
      <FilterBar onSubmit={filter.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={boardCopy.searchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <Select className="w-[288px]" options={contentStatusOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : boardCopy.tabCounts.posts} />
      </div>

      <PostTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={remove} />
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
}

function CommentsPanel() {
  const moderation = useModeration(comments);
  const filter = useSearchFilter(moderation.rows, { query: '', status: 'all' }, matchComment);
  const pagination = usePagination(pageCounts.comments);
  const isFiltered = filter.applied.query !== '' || filter.applied.status !== 'all';
  const confirmDelete = useConfirmDelete();

  const remove = (id: number) =>
    confirmDelete.ask({ target: `${confirmDeleteCopy.targets.comment} #${id}`, onConfirm: () => moderation.remove(id) });

  return (
    <>
      <FilterBar onSubmit={filter.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={boardCopy.commentSearchPlaceholder}
          value={filter.draft.query}
          onChange={(event) => filter.update('query', event.target.value)}
        />
        <Select className="w-[288px]" options={contentStatusOptions} value={filter.draft.status} onChange={(v) => filter.update('status', v)} />
      </FilterBar>

      <div className="mb-4">
        <ResultCount count={isFiltered ? filter.results.length : boardCopy.tabCounts.comments} />
      </div>

      <CommentTable rows={filter.results} pagination={pagination} onToggleHidden={moderation.toggleHidden} onRemove={remove} />
      <ConfirmDeleteModal state={confirmDelete} />
    </>
  );
}

export function BoardPage() {
  const tab = useTabs<BoardTab>('posts');

  return (
    <>
      <PageHeader title={boardCopy.title} description={boardCopy.description} />
      <TabBar tabs={tabs} active={tab.active} onChange={tab.select} />
      {tab.active === 'posts' ? <PostsPanel /> : <CommentsPanel />}
    </>
  );
}

export default BoardPage;
