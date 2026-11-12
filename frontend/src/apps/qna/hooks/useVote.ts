import { useState } from 'react';

export function useVote(initialCount: number) {
  const [voted, setVoted] = useState(false);
  return {
    voted,
    count: initialCount + (voted ? 1 : 0),
    toggle: () => setVoted((v) => !v),
  } as const;
}
