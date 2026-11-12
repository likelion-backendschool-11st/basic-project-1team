import { useCallback, useMemo, useState, type FormEvent } from 'react';
import type { Notice } from '../types';

export interface NoticeDraft {
  readonly id: number | null;
  readonly title: string;
  readonly body: string;
  readonly pinned: boolean;
}

export interface NoticeEditorState {
  readonly notices: readonly Notice[];
  readonly draft: NoticeDraft | null;
  readonly isNew: boolean;
  readonly canSave: boolean;
  readonly startEdit: (id: number) => void;
  readonly startNew: () => void;
  readonly setField: <K extends 'title' | 'body' | 'pinned'>(key: K, value: NoticeDraft[K]) => void;
  readonly save: (event?: FormEvent) => void;
  readonly cancel: () => void;
  readonly remove: (id: number) => void;
}

interface NoticeEditorOptions {
  readonly author: string;
  readonly createdAt: string;
}

function toDraft(notice: Notice): NoticeDraft {
  return { id: notice.id, title: notice.title, body: notice.body, pinned: notice.pinned };
}

/** List + side editor for the notices screen. Pinned notices are always listed first. */
export function useNoticeEditor(initial: readonly Notice[], options: NoticeEditorOptions): NoticeEditorState {
  const [items, setItems] = useState<readonly Notice[]>(initial);
  const [draft, setDraft] = useState<NoticeDraft | null>(initial[0] ? toDraft(initial[0]) : null);

  const notices = useMemo(
    () => items.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    [items],
  );

  const startEdit = useCallback(
    (id: number) => {
      const target = items.find((n) => n.id === id);
      if (target) setDraft(toDraft(target));
    },
    [items],
  );

  const startNew = useCallback(() => setDraft({ id: null, title: '', body: '', pinned: false }), []);

  const setField = useCallback(<K extends 'title' | 'body' | 'pinned'>(key: K, value: NoticeDraft[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const canSave = Boolean(draft && draft.title.trim() && draft.body.trim());

  const save = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (!draft || !canSave) return;
      if (draft.id === null) {
        const id = Math.max(0, ...items.map((n) => n.id)) + 1;
        setItems((prev) => [
          { id, title: draft.title.trim(), body: draft.body.trim(), pinned: draft.pinned, author: options.author, createdAt: options.createdAt },
          ...prev,
        ]);
        setDraft({ ...draft, id });
      } else {
        setItems((prev) =>
          prev.map((n) => (n.id === draft.id ? { ...n, title: draft.title.trim(), body: draft.body.trim(), pinned: draft.pinned } : n)),
        );
      }
    },
    [draft, canSave, items, options.author, options.createdAt],
  );

  const cancel = useCallback(() => setDraft(null), []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    setDraft((prev) => (prev?.id === id ? null : prev));
  }, []);

  return {
    notices,
    draft,
    isNew: draft?.id === null,
    canSave,
    startEdit,
    startNew,
    setField,
    save,
    cancel,
    remove,
  };
}
