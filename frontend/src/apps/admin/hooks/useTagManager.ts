import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { isValidTagName, stripInvalidTagChars } from '../../../shared/tag';
import { createTag, deleteTag, getTags, updateTag, type TagSort } from '../api/tags';
import type { Tag, TagStatus } from '../types';
import { usePagedList, type PagedListState } from './usePagedList';

export type { TagSort } from '../api/tags';
export type TagStatusFilter = 'all' | TagStatus;

const PAGE_SIZE = 20;
/** 검색어는 입력이 멈춘 뒤 불러온다 */
const SEARCH_DELAY_MS = 300;

interface TagFilters {
  readonly query: string;
  readonly status: TagStatusFilter;
  readonly sort: TagSort;
}

const fetchTags = (f: TagFilters, page: number, size: number) =>
  getTags({
    page,
    size,
    keyword: f.query.trim() || undefined,
    sort: f.sort,
    status: f.status === 'all' ? undefined : f.status,
  });

// 이름 칸 아래에 보여 줄 오류: 중복·차단된 이름은 서버 메시지를 그대로 쓴다 (API_SPEC 10.5)
const NAME_ERROR_CODES = ['TAG_BLOCKED', 'TAG_DUPLICATED', 'VALIDATION_ERROR'];

export interface TagManagerState {
  readonly list: PagedListState<Tag, TagFilters>;
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly statusFilter: TagStatusFilter;
  readonly setStatusFilter: (value: TagStatusFilter) => void;
  readonly sort: TagSort;
  readonly setSort: (value: TagSort) => void;
  readonly draftName: string;
  /** 서버가 거절한 이름 (중복·차단·규칙 위반) */
  readonly nameError: string | null;
  readonly setDraftName: (value: string) => void;
  readonly draftDescription: string;
  readonly setDraftDescription: (value: string) => void;
  readonly canSubmit: boolean;
  /** 새 태그 등록, 또는 수정 중인 태그 저장 */
  readonly create: (event?: FormEvent) => void;
  readonly editingId: number | null;
  readonly startEdit: (tag: Tag) => void;
  readonly cancelEdit: () => void;
  /** 삭제 = 차단. 행은 남기고 질문 연결만 끊는다 (REQ-ADMIN-010) */
  readonly remove: (id: number) => void;
  readonly restore: (id: number) => void;
  readonly submitting: boolean;
  /** 차단·차단 해제가 실패한 이유 */
  readonly actionError: string | null;
}

/** 태그 관리 (API_SPEC 10.5): 목록·검색·정렬, 등록·수정, 삭제(차단)·차단 해제 */
export function useTagManager(): TagManagerState {
  const list = usePagedList<Tag, TagFilters>(
    { query: '', status: 'all', sort: 'usage_desc' },
    PAGE_SIZE,
    fetchTags,
  );
  const { applyNow, reload } = list;
  const [query, setQuery] = useState('');
  const [draftName, setDraftNameRaw] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const appliedQuery = list.applied.query;
  useEffect(() => {
    if (query === appliedQuery) return undefined;
    const timer = setTimeout(() => applyNow('query', query), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, appliedQuery, applyNow]);

  // 입력하는 동안 태그 이름 규칙(API_SPEC 5.1)에 맞지 않는 글자는 빼고, 지난 오류는 지운다
  const setDraftName = useCallback((value: string) => {
    setDraftNameRaw(stripInvalidTagChars(value));
    setNameError(null);
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setDraftNameRaw('');
    setDraftDescription('');
    setNameError(null);
  }, []);

  const canSubmit = isValidTagName(draftName) && !submitting;

  const create = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      try {
        const body = { name: draftName, description: draftDescription.trim() };
        if (editingId === null) await createTag(body);
        else await updateTag(editingId, body);
        resetForm();
        reload();
      } catch (error) {
        setNameError(
          error instanceof ApiError && NAME_ERROR_CODES.includes(error.code)
            ? error.message
            : getErrorMessage(error),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [canSubmit, draftName, draftDescription, editingId, resetForm, reload],
  );

  const startEdit = useCallback((tag: Tag) => {
    setEditingId(tag.id);
    setDraftNameRaw(tag.name);
    setDraftDescription(tag.description ?? '');
    setNameError(null);
  }, []);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setActionError(null);
      try {
        await action();
      } catch (error) {
        setActionError(getErrorMessage(error));
      } finally {
        // 실패해도 다른 관리자가 먼저 바꿨을 수 있으므로 최신 상태를 다시 읽는다
        reload();
      }
    },
    [reload],
  );

  const remove = useCallback(
    (id: number) => {
      if (editingId === id) resetForm();
      void run(() => deleteTag(id));
    },
    [editingId, resetForm, run],
  );

  const restore = useCallback(
    (id: number) => void run(() => updateTag(id, { status: 'active' })),
    [run],
  );

  return {
    list,
    query,
    setQuery,
    statusFilter: list.applied.status,
    setStatusFilter: (value) => applyNow('status', value),
    sort: list.applied.sort,
    setSort: (value) => applyNow('sort', value),
    draftName,
    nameError,
    setDraftName,
    draftDescription,
    setDraftDescription,
    canSubmit,
    create: (event) => void create(event),
    editingId,
    startEdit,
    cancelEdit: resetForm,
    remove,
    restore,
    submitting,
    actionError,
  };
}
