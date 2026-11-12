import { useEffect, useRef, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export function useDraftSave(initialStatus: string, savedPrefix: string) {
  const [status, setStatus] = useState(initialStatus);
  const [justSaved, setJustSaved] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const save = () => {
    const now = new Date();
    setStatus(
      `${savedPrefix} (${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())})`,
    );
    setJustSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustSaved(false), 2000);
  };

  return { status, justSaved, save } as const;
}
