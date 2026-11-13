import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { isValidTagName, normalizeTagName, stripInvalidTagChars } from '../../../shared/tag';
import { tagsCopy } from '../data/mockData';
import type { Tag, TagStatus } from '../types';

export type TagSort = 'usage_desc' | 'name_asc' | 'recent';
export type TagStatusFilter = 'all' | TagStatus;

export interface TagManagerState {
  readonly tags: readonly Tag[];
  /** 병합 대상 후보. 차단·병합된 태그는 원본·대상 모두 쓸 수 없다 */
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
  readonly editingId: number | null;
  readonly startEdit: (tag: Tag) => void;
  readonly cancelEdit: () => void;
  /** 삭제 = 차단. 행은 남기고 질문 연결만 끊는다 (REQ-ADMIN-010) */
  readonly remove: (id: number) => void;
  readonly restore: (id: number) => void;
  readonly mergeSource: Tag | null;
  readonly openMerge: (tag: Tag) => void;
  readonly closeMerge: () => void;
  /** 원본은 병합됨 상태로 남기고 질문 수를 대상으로 옮긴다 (API_SPEC 10.5) */
  readonly merge: (targetId: number) => void;
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
  const [editingId, setEditingId] = useState<number | null>(null);

  // Enforce the tag name rule (API_SPEC §5.1) while typing.
  const setDraftName = useCallback(
    (value: string) => setDraftNameRaw(stripInvalidTagChars(value)),
    [],
  );

  const visibleTags = useMemo(() => {
    // 태그 이름은 정규화(소문자)돼 저장되므로 검색어도 같은 규칙으로 맞춘다 (API_SPEC 5.1)
    const q = normalizeTagName(query);
    return tags
      .filter(
        (tag) =>
          (!q || tag.name.includes(q)) && (statusFilter === 'all' || tag.status === statusFilter),
      )
      .slice()
      .sort(sorters[sort]);
  }, [tags, query, sort, statusFilter]);

  const activeTags = useMemo(() => tags.filter((tag) => tag.status === 'active'), [tags]);

  const nameError = useMemo(() => {
    const clash = tags.find((tag) => tag.name === draftName && tag.id !== editingId);
    if (!clash) return null;
    if (clash.status === 'blocked') return tagsCopy.blockedName;
    return clash.status === 'merged' ? tagsCopy.mergedName : tagsCopy.duplicateName;
  }, [tags, draftName, editingId]);

  const create = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const name = draftName;
      const description = draftDescription.trim();
      if (!isValidTagName(name) || nameError) return;
      if (editingId !== null) {
        setTags((prev) =>
          prev.map((tag) => (tag.id === editingId ? { ...tag, name, description } : tag)),
        );
        setEditingId(null);
      } else {
        // mock: id 는 서버가 정한다
        setTags((prev) => [
          {
            id: Math.max(0, ...prev.map((tag) => tag.id)) + 1,
            name,
            description,
            usage: 0,
            status: 'active',
            createdAt: today(),
          },
          ...prev,
        ]);
      }
      setDraftNameRaw('');
      setDraftDescription('');
    },
    [draftName, draftDescription, nameError, editingId],
  );

  const startEdit = useCallback((tag: Tag) => {
    setEditingId(tag.id);
    setDraftNameRaw(tag.name);
    setDraftDescription(tag.description);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setDraftNameRaw('');
    setDraftDescription('');
  }, []);

  const remove = useCallback((id: number) => {
    // TODO: DELETE /api/admin/tags/:tagId
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, status: 'blocked', usage: 0 } : tag)),
    );
    setEditingId((prev) => (prev === id ? null : prev));
  }, []);

  const restore = useCallback((id: number) => {
    // TODO: PATCH /api/admin/tags/:tagId { status: 'active' }
    setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, status: 'active' } : tag)));
  }, []);

  const openMerge = useCallback((tag: Tag) => setMergeSource(tag), []);
  const closeMerge = useCallback(() => setMergeSource(null), []);

  const merge = useCallback(
    (targetId: number) => {
      // TODO: DELETE /api/admin/tags/:tagId?mergeInto=:targetTagId
      if (!mergeSource || targetId === mergeSource.id) return;
      setTags((prev) =>
        prev.map((tag) => {
          if (tag.id === mergeSource.id) return { ...tag, status: 'merged', usage: 0 };
          return tag.id === targetId ? { ...tag, usage: tag.usage + mergeSource.usage } : tag;
        }),
      );
      setEditingId((prev) => (prev === mergeSource.id ? null : prev));
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
    editingId,
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
