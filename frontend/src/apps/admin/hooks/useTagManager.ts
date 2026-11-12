import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { isValidTagName, stripInvalidTagChars } from '../../../shared/tag';
import { tagsCopy } from '../data/mockData';
import type { Tag, TagStatus } from '../types';

export type TagSort = 'usage_desc' | 'name_asc' | 'recent';
export type TagStatusFilter = 'all' | TagStatus;

export interface TagManagerState {
  readonly tags: readonly Tag[];
  /** 병합 대상 후보. 차단된 태그는 원본·대상 모두 쓸 수 없다 */
  readonly activeTags: readonly Tag[];
  readonly visibleTags: readonly Tag[];
  readonly statusFilter: TagStatusFilter;
  readonly setStatusFilter: (value: TagStatusFilter) => void;
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly sort: TagSort;
  readonly setSort: (value: TagSort) => void;
  readonly draftName: string;
  /** 이미 있는 이름이거나 차단된 이름이면 안내 문구 */
  readonly nameError: string | null;
  readonly setDraftName: (value: string) => void;
  readonly draftDescription: string;
  readonly setDraftDescription: (value: string) => void;
  /** Creates a tag, or saves the tag being edited. */
  readonly create: (event?: FormEvent) => void;
  readonly editingName: string | null;
  readonly startEdit: (tag: Tag) => void;
  readonly cancelEdit: () => void;
  /** 삭제 = 차단. 행은 남기고 질문 연결만 끊는다 (REQ-ADMIN-010) */
  readonly remove: (name: string) => void;
  readonly restore: (name: string) => void;
  readonly mergeSource: Tag | null;
  readonly openMerge: (tag: Tag) => void;
  readonly closeMerge: () => void;
  readonly merge: (targetName: string) => void;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const sorters: Record<TagSort, (a: Tag, b: Tag) => number> = {
  usage_desc: (a, b) => b.usage - a.usage,
  name_asc: (a, b) => a.name.localeCompare(b.name),
  recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

export function useTagManager(initial: readonly Tag[]): TagManagerState {
  const [tags, setTags] = useState<readonly Tag[]>(initial);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<TagSort>('usage_desc');
  const [statusFilter, setStatusFilter] = useState<TagStatusFilter>('all');
  const [draftName, setDraftNameRaw] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [mergeSource, setMergeSource] = useState<Tag | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  // Enforce the tag name rule (API_SPEC §5.1) while typing.
  const setDraftName = useCallback((value: string) => setDraftNameRaw(stripInvalidTagChars(value)), []);

  const visibleTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags
      .filter((tag) => (!q || tag.name.includes(q)) && (statusFilter === 'all' || tag.status === statusFilter))
      .slice()
      .sort(sorters[sort]);
  }, [tags, query, sort, statusFilter]);

  const activeTags = useMemo(() => tags.filter((tag) => tag.status === 'active'), [tags]);

  const nameError = useMemo(() => {
    const clash = tags.find((tag) => tag.name === draftName && tag.name !== editingName);
    if (!clash) return null;
    return clash.status === 'blocked' ? tagsCopy.blockedName : tagsCopy.duplicateName;
  }, [tags, draftName, editingName]);

  const create = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const name = draftName;
      const description = draftDescription.trim();
      if (!isValidTagName(name) || nameError) return;
      if (editingName) {
        setTags((prev) => prev.map((tag) => (tag.name === editingName ? { ...tag, name, description } : tag)));
        setEditingName(null);
      } else {
        setTags((prev) => [{ name, description, usage: 0, status: 'active', createdAt: today() }, ...prev]);
      }
      setDraftNameRaw('');
      setDraftDescription('');
    },
    [draftName, draftDescription, nameError, editingName],
  );

  const startEdit = useCallback((tag: Tag) => {
    setEditingName(tag.name);
    setDraftNameRaw(tag.name);
    setDraftDescription(tag.description);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingName(null);
    setDraftNameRaw('');
    setDraftDescription('');
  }, []);

  const remove = useCallback((name: string) => {
    // TODO: DELETE /api/admin/tags/:tagId
    setTags((prev) => prev.map((tag) => (tag.name === name ? { ...tag, status: 'blocked', usage: 0 } : tag)));
    setEditingName((prev) => (prev === name ? null : prev));
  }, []);

  const restore = useCallback((name: string) => {
    // TODO: PATCH /api/admin/tags/:tagId { status: 'active' }
    setTags((prev) => prev.map((tag) => (tag.name === name ? { ...tag, status: 'active' } : tag)));
  }, []);

  const openMerge = useCallback((tag: Tag) => setMergeSource(tag), []);
  const closeMerge = useCallback(() => setMergeSource(null), []);

  const merge = useCallback(
    (targetName: string) => {
      if (!mergeSource || targetName === mergeSource.name) return;
      setTags((prev) =>
        prev
          .filter((tag) => tag.name !== mergeSource.name)
          .map((tag) => (tag.name === targetName ? { ...tag, usage: tag.usage + mergeSource.usage } : tag)),
      );
      setMergeSource(null);
    },
    [mergeSource],
  );

  return {
    tags,
    activeTags,
    visibleTags,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    sort,
    setSort,
    draftName,
    nameError,
    setDraftName,
    draftDescription,
    setDraftDescription,
    create,
    editingName,
    startEdit,
    cancelEdit,
    remove,
    restore,
    mergeSource,
    openMerge,
    closeMerge,
    merge,
  };
}
