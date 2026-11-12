import { useState, type KeyboardEvent } from 'react';

export function useTagInput(initial: readonly string[], max: number, maxMessage: string) {
  const [tags, setTags] = useState<string[]>([...initial]);
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const tag = raw.replace(/^#/, '').trim();
    if (!tag) return;
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

  return { tags, input, setInput, add, remove, onKeyDown, max } as const;
}
