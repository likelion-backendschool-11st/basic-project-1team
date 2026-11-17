import { useCallback, useEffect, useRef, useState } from 'react';
import { visibleTextLength } from '../../../shared/editor/richText';

/** 게시글 임시저장 키. 서버가 아니라 브라우저에 저장한다 (REQ-BOARD-015) */
const STORAGE_KEY = 'gamers:board:post-draft';
const AUTOSAVE_DELAY_MS = 3000;
const FLASH_MS = 2000;

export interface PostDraft {
  readonly title: string;
  /** 에디터 본문 HTML */
  readonly body: string;
  /** 저장 시각 (ISO 8601) */
  readonly savedAt: string;
}

type DraftContent = Omit<PostDraft, 'savedAt'>;

const EMPTY_KEY = JSON.stringify({ title: '', body: '' });
const toKey = (c: DraftContent) => JSON.stringify({ title: c.title, body: c.body });
const isBlank = (c: DraftContent) => !c.title.trim() && visibleTextLength(c.body) === 0;

// 사생활 보호 모드 등에서는 저장소 접근이 막힐 수 있어 실패해도 화면은 그대로 쓴다
/** 저장된 임시글. 작성 화면의 처음 값으로 쓴다 */
export function readPostDraft(): PostDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<PostDraft>;
    if (typeof draft.title !== 'string' || typeof draft.body !== 'string') return null;
    return {
      title: draft.title,
      body: draft.body,
      savedAt: typeof draft.savedAt === 'string' ? draft.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: PostDraft): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function removeDraft() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 지우지 못해도 다음 저장 때 덮어쓴다
  }
}

/**
 * 게시글 작성 임시저장 (REQ-BOARD-015). 내용이 바뀌면 3초 뒤 자동 저장하고, `saveNow` 로 바로 저장한다.
 * `enabled` 가 false(수정 화면)면 저장하지 않는다. `restored` 는 처음 불러온 임시글이다.
 */
export function usePostDraft(content: DraftContent, restored: PostDraft | null, enabled: boolean) {
  const [savedAt, setSavedAt] = useState<string | null>(restored?.savedAt ?? null);
  const [justSaved, setJustSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const serialized = toKey(content);
  const lastSaved = useRef(restored ? toKey(restored) : serialized);
  const contentRef = useRef(content);
  contentRef.current = content;
  const flashTimer = useRef<number>();

  const save = useCallback(
    (manual: boolean) => {
      if (!enabled) return;
      const current = contentRef.current;
      const key = toKey(current);
      if (!manual && (key === lastSaved.current || isBlank(current))) return;
      const draft = { ...current, savedAt: new Date().toISOString() };
      const ok = writeDraft(draft);
      setFailed(!ok);
      if (!ok) return;
      lastSaved.current = key;
      setSavedAt(draft.savedAt);
      if (manual) {
        setJustSaved(true);
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setJustSaved(false), FLASH_MS);
      }
    },
    [enabled],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => save(false), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [serialized, save]);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  /** 등록에 성공했거나 새로 쓰기를 고르면 지운다 */
  const clear = useCallback(() => {
    removeDraft();
    lastSaved.current = EMPTY_KEY;
    setSavedAt(null);
  }, []);

  const saveNow = useCallback(() => save(true), [save]);

  return { savedAt, justSaved, failed, saveNow, clear };
}
