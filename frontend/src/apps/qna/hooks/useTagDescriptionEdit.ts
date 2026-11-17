import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { updateTagDescription } from '../api/tags';
import type { TagDetail } from '../data/types';

/** 태그 설명 최대 글자 수 (API_SPEC 5장 PATCH) */
export const TAG_DESCRIPTION_MAX = 100;

/**
 * 태그 설명 수정 (PATCH /api/tags/:tagName, REQ-TAG-003). ADMIN·Diamond 이상 회원만 화면에 버튼이 보인다.
 * 저장하면 받은 태그로 화면을 바꾸고, 권한·제재 오류는 서버 문구를 그대로 보여 준다.
 */
export function useTagDescriptionEdit(tag: TagDetail, onSaved: (tag: TagDetail) => void) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const start = () => {
    setDraft(tag.description ?? '');
    setErrorMessage(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setErrorMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const saved = await updateTagDescription(tag.name, draft.trim() === '' ? null : draft.trim());
      onSaved(saved);
      setEditing(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return {
    editing,
    draft,
    setDraft: (value: string) => setDraft(Array.from(value).slice(0, TAG_DESCRIPTION_MAX).join('')),
    length: Array.from(draft.trim()).length,
    saving,
    errorMessage,
    start,
    cancel,
    save,
  };
}
