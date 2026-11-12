import { useEffect, useState } from 'react';

/** Toast that slides in, runs a countdown bar for `durationMs`, then dismisses itself. */
export function useTimedToast(durationMs: number) {
  const [visible, setVisible] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 50);
    const run = window.setTimeout(() => setRunning(true), 100);
    const hide = window.setTimeout(() => setVisible(false), durationMs);
    return () => [show, run, hide].forEach((t) => window.clearTimeout(t));
  }, [durationMs]);

  return { visible, running, dismiss: () => setVisible(false) } as const;
}
