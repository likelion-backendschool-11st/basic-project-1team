import { useCallback, useMemo, useState } from 'react';
import type { Tag } from '../types';

export interface TagPickerState {
  readonly query: string;
  readonly setQuery: (value: string) => void;
  readonly selected: Tag | null;
  readonly select: (tag: Tag) => void;
  readonly clear: () => void;
  readonly suggestions: readonly Tag[];
}

/** Search-and-select for the merge target inside the tag merge modal. */
export function useTagPicker(tags: readonly Tag[], excludeName: string | undefined): TagPickerState {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Tag | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || selected) return [];
    return tags.filter((tag) => tag.name !== excludeName && tag.name.includes(q)).slice(0, 6);
  }, [tags, query, excludeName, selected]);

  const select = useCallback((tag: Tag) => {
    setSelected(tag);
    setQuery('');
  }, []);

  const clear = useCallback(() => setSelected(null), []);

  return { query, setQuery, selected, select, clear, suggestions };
}
