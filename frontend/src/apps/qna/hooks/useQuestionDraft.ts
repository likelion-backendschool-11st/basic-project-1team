import { useCallback, useEffect, useRef, useState } from 'react';
import { visibleTextLength } from '../../../shared/editor/richText';

/** 질문 임시저장 키. 서버가 아니라 브라우저에 저장한다 (REQ-QNA-019, API_SPEC 3장) */
const STORAGE_KEY = 'gamers:qna:question-draft';
const AUTOSAVE_DELAY_MS = 3000;

export interface QuestionDraft {
  readonly title: string;
  /** 에디터 본문 HTML */
  readonly body: string;
  readonly tags: readonly string[];
  /** 저장 시각 (ISO 8601) */
  readonly savedAt: string;
}

type DraftContent = Omit<QuestionDraft, 'savedAt'>;

const pad = (n: number) => String(n).padStart(2, '0');
export const formatDraftTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// 사생활 보호 모드 등에서는 저장소 접근이 막힐 수 있어 실패해도 화면은 그대로 쓴다
/** 저장된 임시글. 화면의 처음 값으로 쓴다 */
export function readQuestionDraft(): QuestionDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<QuestionDraft>;
    if (typeof draft.title !== 'string' || typeof draft.body !== 'string') return null;
    return {
      title: draft.title,
      body: draft.body,
      tags: Array.isArray(draft.tags) ? draft.tags.filter((t) => typeof t === 'string') : [],
      savedAt: typeof draft.savedAt === 'string' ? draft.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: QuestionDraft): boolean {
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

const isBlank = (c: DraftContent) =>
  !c.title.trim() && visibleTextLength(c.body) === 0 && c.tags.length === 0;

/**
 * 질문 작성 임시저장. 내용이 바뀌면 3초 뒤 자동 저장하고, `saveNow` 로 바로 저장한다.
 * `content` 는 렌더마다 새 객체여도 되며, 바뀐 값만 저장한다. `restored` 는 처음 불러온 임시글이다.
 */
export function useQuestionDraft(content: DraftContent, restored: QuestionDraft | null) {
  const [savedAt, setSavedAt] = useState<string | null>(restored?.savedAt ?? null);
  const [justSaved, setJustSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const serialized = JSON.stringify(content);
  const lastSaved = useRef(
    restored
      ? JSON.stringify({ title: restored.title, body: restored.body, tags: restored.tags })
      : JSON.stringify(content),
  );
  const contentRef = useRef(content);
  contentRef.current = content;
  const flashTimer = useRef<number>();

  const save = useCallback((manual: boolean) => {
    const current = contentRef.current;
    const key = JSON.stringify(current);
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
      flashTimer.current = window.setTimeout(() => setJustSaved(false), 2000);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => save(false), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [serialized, save]);

  useEffect(() => () => window.clearTimeout(flashTimer.current), []);

  /** 등록에 성공했거나 새로 쓰기를 고르면 지운다 */
  const clear = useCallback(() => {
    removeDraft();
    lastSaved.current = JSON.stringify({ title: '', body: '', tags: [] });
    setSavedAt(null);
  }, []);

  return { savedAt, justSaved, failed, saveNow: () => save(true), clear };
}
