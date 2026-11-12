import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { isValidTagName, stripInvalidTagChars } from '../../../shared/tag';
import type { Tag } from '../types';

export type TagSort = 'usage_desc' | 'name_asc' | 'recent';

export interface TagManagerState {
  readonly tags: readonly Tag[];
  readonly visibleTags: readonly Tag[];
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly sort: TagSort;
  readonly setSort: (value: TagSort) => void;
  readonly draftName: string;
  readonly setDraftName: (value: string) => void;
  readonly draftDescription: string;
  readonly setDraftDescription: (value: string) => void;
  /** Creates a tag, or saves the tag being edited. */
  readonly create: (event?: FormEvent) => void;
  readonly editingName: string | null;
  readonly startEdit: (tag: Tag) => void;
  readonly cancelEdit: () => void;
  readonly remove: (name: string) => void;
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
  const [draftName, setDraftNameRaw] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [mergeSource, setMergeSource] = useState<Tag | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  // Enforce the tag name rule (API_SPEC §5.1) while typing.
  const setDraftName = useCallback((value: string) => setDraftNameRaw(stripInvalidTagChars(value)), []);

  const visibleTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags.filter((tag) => !q || tag.name.includes(q)).slice().sort(sorters[sort]);
  }, [tags, query, sort]);

  const create = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      const name = draftName;
      const description = draftDescription.trim();
      if (!isValidTagName(name) || tags.some((tag) => tag.name === name && tag.name !== editingName)) return;
      if (editingName) {
        setTags((prev) => prev.map((tag) => (tag.name === editingName ? { ...tag, name, description } : tag)));
        setEditingName(null);
      } else {
        setTags((prev) => [{ name, description, usage: 0, createdAt: today() }, ...prev]);
      }
      setDraftNameRaw('');
      setDraftDescription('');
    },
    [draftName, draftDescription, tags, editingName],
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
    setTags((prev) => prev.filter((tag) => tag.name !== name));
    setEditingName((prev) => (prev === name ? null : prev));
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
    visibleTags,
    query,
    setQuery,
    sort,
    setSort,
    draftName,
    setDraftName,
    draftDescription,
    setDraftDescription,
    create,
    editingName,
    startEdit,
    cancelEdit,
    remove,
    mergeSource,
    openMerge,
    closeMerge,
    merge,
  };
}
