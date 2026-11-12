import { useCallback, useState } from 'react';
import { type Comment, initialComments, labels } from '../data/mockData';

export function useComments(seed: Comment[] = initialComments) {
  const [comments, setComments] = useState<Comment[]>(seed);
  const [expanded, setExpanded] = useState(true);
  const [draft, setDraft] = useState('');

  const submit = useCallback(() => {
    const body = draft.trim();
    if (!body) return;
    setComments((list) => [
      ...list,
      { id: Date.now(), author: labels.anonymous, date: labels.justNow, body, tone: 'brand' },
    ]);
    setDraft('');
  }, [draft]);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);
  const shown = expanded ? comments : comments.slice(0, 1);

  return { comments, shown, expanded, toggleExpanded, draft, setDraft, submit };
}
