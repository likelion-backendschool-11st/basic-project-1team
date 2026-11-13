import { useState, type KeyboardEvent } from 'react';
import { isValidTagName, normalizeTagName, TAG_NAME_RULE } from '../../../shared/tag';

export function useTagInput(initial: readonly string[], max: number, maxMessage: string) {
  const [tags, setTags] = useState<string[]>([...initial]);
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const tag = normalizeTagName(raw);
    if (!tag) return;
    if (!isValidTagName(tag)) {
      window.alert(TAG_NAME_RULE);
      return;
    }
    // 관리자가 차단한 태그는 저장할 때 서버가 TAG_BLOCKED 로 알려 준다 (API_SPEC 5.1)
    if (tags.length >= max) {
      window.alert(maxMessage);
      return;
    }
    if (!tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setInput('');
  };

  const remove = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  /** 임시저장을 지우고 새로 쓸 때처럼 태그를 통째로 바꾼다 */
  const reset = (next: readonly string[]) => {
    setTags([...next]);
    setInput('');
  };

  return { tags, input, setInput, add, remove, onKeyDown, reset, max } as const;
}
