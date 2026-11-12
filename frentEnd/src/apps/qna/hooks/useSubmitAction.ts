import { useEffect, useRef, useState } from 'react';

/** Simulates an async submit: shows a pending state, then runs `onDone`. */
export function useSubmitAction(onDone: () => void, delayMs = 800) {
  const [pending, setPending] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = () => {
    if (pending) return;
    setPending(true);
    timer.current = window.setTimeout(() => {
      setPending(false);
      onDone();
    }, delayMs);
  };

  return { pending, submit } as const;
}
