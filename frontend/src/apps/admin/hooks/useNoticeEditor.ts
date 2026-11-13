import { useCallback, useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { BODY_TEXT_MAX, textLength, visibleTextLength } from '../../../shared/editor/richText';
import { createNotice, deleteNotice, getNotices, updateNotice } from '../api/notices';
import type { Notice } from '../types';
import { usePagedList, type PagedListState } from './usePagedList';

const PAGE_SIZE = 20;

export interface NoticeDraft {
  /** 새 공지면 null */
  readonly id: number | null;
  readonly title: string;
  readonly body: string;
  readonly pinned: boolean;
}

export interface NoticeEditorState {
  readonly list: PagedListState<Notice, Record<string, never>>;
  readonly draft: NoticeDraft | null;
  readonly isNew: boolean;
  readonly canSave: boolean;
  readonly saving: boolean;
  /** 저장·삭제가 실패한 이유 (서버 메시지) */
  readonly errorMessage: string | null;
  readonly startEdit: (id: number) => void;
  readonly startNew: () => void;
  readonly setField: <K extends 'title' | 'body' | 'pinned'>(key: K, value: NoticeDraft[K]) => void;
  readonly save: (event?: FormEvent) => void;
  readonly cancel: () => void;
  readonly remove: (id: number) => void;
}

const NO_FILTERS: Record<string, never> = {};
const fetchNotices = (_filters: Record<string, never>, page: number, size: number) =>
  getNotices(page, size);

const toDraft = (notice: Notice): NoticeDraft => ({
  id: notice.id,
  title: notice.title,
  body: notice.body,
  pinned: notice.isPinned,
});

/**
 * 공지 목록 + 오른쪽 편집기 (API_SPEC 10.7). 서버가 고정 공지 먼저, 그다음 최신순으로 준다.
 * 저장·삭제가 끝나면 목록을 다시 불러온다.
 */
export function useNoticeEditor(): NoticeEditorState {
  const list = usePagedList<Notice, Record<string, never>>(NO_FILTERS, PAGE_SIZE, fetchNotices);
  const { reload } = list;
  const [draft, setDraft] = useState<NoticeDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startEdit = useCallback(
    (id: number) => {
      const target = list.items.find((n) => n.id === id);
      if (target) setDraft(toDraft(target));
      setErrorMessage(null);
    },
    [list.items],
  );

  const startNew = useCallback(() => {
    setDraft({ id: null, title: '', body: '', pinned: false });
    setErrorMessage(null);
  }, []);

  const setField = useCallback(
    <K extends 'title' | 'body' | 'pinned'>(key: K, value: NoticeDraft[K]) => {
      setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  // 본문은 에디터 HTML 이라 태그를 뺀 글자로 비었는지·길이를 본다 (API_SPEC 1.9)
  const bodyLength = draft ? textLength(draft.body) : 0;
  const canSave = Boolean(
    draft &&
    !saving &&
    draft.title.trim() &&
    visibleTextLength(draft.body) > 0 &&
    bodyLength <= BODY_TEXT_MAX,
  );

  const save = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!draft || !canSave) return;
      setSaving(true);
      setErrorMessage(null);
      const input = { title: draft.title.trim(), body: draft.body, isPinned: draft.pinned };
      try {
        const saved =
          draft.id === null ? await createNotice(input) : await updateNotice(draft.id, input);
        // 서버가 정리한 본문(허용 태그만)으로 편집기를 맞춘다
        setDraft(toDraft(saved));
        reload();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setSaving(false);
      }
    },
    [draft, canSave, reload],
  );

  const cancel = useCallback(() => {
    setDraft(null);
    setErrorMessage(null);
  }, []);

  // 서버는 status 를 deleted 로 바꾸고(soft delete), 관리자 공지 목록에서도 빠진다 (API_SPEC 10.7)
  const remove = useCallback(
    async (id: number) => {
      setErrorMessage(null);
      try {
        await deleteNotice(id);
        setDraft((prev) => (prev?.id === id ? null : prev));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        reload();
      }
    },
    [reload],
  );

  return {
    list,
    draft,
    isNew: draft?.id === null,
    canSave,
    saving,
    errorMessage,
    startEdit,
    startNew,
    setField,
    save: (event) => void save(event),
    cancel,
    remove: (id) => void remove(id),
  };
}
