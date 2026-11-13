import React, { useCallback, useState } from 'react';
import { getContents } from '../api/contents';
import { ContentDetailModal } from '../components/content/ContentDetailModal';
import { CommentTable } from '../components/content/CommentTable';
import { PostTable } from '../components/content/PostTable';
import { StatusChangeModal } from '../components/content/StatusChangeModal';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { FilterBar } from '../components/ui/FilterBar';
import { Select, TextInput } from '../components/ui/FormControls';
import { PageHeader } from '../components/ui/PageHeader';
import { ResultCount } from '../components/ui/ResultCount';
import { TabBar, type TabItem } from '../components/ui/TabBar';
import { boardCopy, confirmDeleteCopy, contentStatusOptions, ui } from '../data/mockData';
import { useContentCounts } from '../hooks/useContentCounts';
import { useContentModeration } from '../hooks/useContentModeration';
import { usePagedList } from '../hooks/usePagedList';
import type { Comment, ContentStatus, Post } from '../types';

type BoardTab = 'posts' | 'comments';

const PAGE_SIZE = 20;

interface BoardFilters {
  readonly query: string;
  /** 'all' 은 삭제된 항목을 뺀 전체 */
  readonly status: string;
}

const INITIAL_FILTERS: BoardFilters = { query: '', status: 'all' };

const toQuery = (f: BoardFilters, page: number, size: number) => ({
  page,
  size,
  keyword: f.query.trim() || undefined,
  status: f.status === 'all' ? undefined : (f.status as ContentStatus),
});

const fetchPosts = (f: BoardFilters, page: number, size: number) =>
  getContents('post', toQuery(f, page, size));

const fetchComments = (f: BoardFilters, page: number, size: number) =>
  getContents('comment', toQuery(f, page, size));

interface PanelProps {
  /** 숨김·삭제 뒤 탭 배지를 다시 센다 */
  readonly onChanged: () => void;
}

const PostsPanel: React.FC<PanelProps> = ({ onChanged }) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const list = usePagedList<Post, BoardFilters>(INITIAL_FILTERS, PAGE_SIZE, fetchPosts);
  const { reload } = list;
  const moderation = useContentModeration(
    'post',
    useCallback(() => {
      reload();
      onChanged();
    }, [reload, onChanged]),
  );

  // 게시글을 지우면 댓글도 함께 삭제된다 (API_SPEC 10.4)
  const remove = (p: Post) =>
    moderation.askDelete(p.id, p.commentCount > 0 ? [confirmDeleteCopy.postCascade] : []);

  return (
    <>
      <FilterBar onSubmit={list.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={boardCopy.searchPlaceholder}
          value={list.draft.query}
          onChange={(event) => list.update('query', event.target.value)}
        />
        <Select
          className="w-[288px]"
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

      <PostTable
        rows={list.items}
        pagination={list}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        onOpen={(row) => setOpenId(row.id)}
        onToggleHidden={(p) => moderation.askStatusChange(p)}
        onRemove={remove}
      />
      <ContentDetailModal
        type="post"
        id={openId}
        onClose={() => setOpenId(null)}
        onToggleHidden={(p) => moderation.askStatusChange(p)}
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

const CommentsPanel: React.FC<PanelProps> = ({ onChanged }) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const list = usePagedList<Comment, BoardFilters>(INITIAL_FILTERS, PAGE_SIZE, fetchComments);
  const { reload } = list;
  const moderation = useContentModeration(
    'comment',
    useCallback(() => {
      reload();
      onChanged();
    }, [reload, onChanged]),
  );

  return (
    <>
      <FilterBar onSubmit={list.submit}>
        <TextInput
          className="min-w-[280px] flex-1"
          placeholder={boardCopy.commentSearchPlaceholder}
          value={list.draft.query}
          onChange={(event) => list.update('query', event.target.value)}
        />
        <Select
          className="w-[288px]"
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

      <CommentTable
        rows={list.items}
        pagination={list}
        message={list.loading ? ui.loading : (list.errorMessage ?? undefined)}
        onOpen={(row) => setOpenId(row.id)}
        onToggleHidden={(c) => moderation.askStatusChange(c)}
        onRemove={(c) => moderation.askDelete(c.id)}
      />
      <ContentDetailModal
        type="comment"
        id={openId}
        onClose={() => setOpenId(null)}
        onToggleHidden={(c) => moderation.askStatusChange(c)}
        onRemove={(c) => moderation.askDelete(c.id)}
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

export const BoardPage: React.FC = () => {
  const [active, setActive] = useState<BoardTab>('posts');
  const counts = useContentCounts(['post', 'comment']);

  const tabs: readonly TabItem<BoardTab>[] = [
    { key: 'posts', label: boardCopy.tabs.posts, count: counts.counts.post },
    { key: 'comments', label: boardCopy.tabs.comments, count: counts.counts.comment },
  ];

  return (
    <>
      <PageHeader title={boardCopy.title} description={boardCopy.description} />
      <TabBar tabs={tabs} active={active} onChange={setActive} />
      {active === 'posts' ? (
        <PostsPanel onChanged={counts.reload} />
      ) : (
        <CommentsPanel onChanged={counts.reload} />
      )}
    </>
  );
};
