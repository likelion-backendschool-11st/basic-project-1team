import { useCallback, useEffect, useState } from 'react';

/**
 * 세로 롤링(아래 → 위) 인덱스. 마지막 다음에 첫 항목 복제본을 두고,
 * 복제본에 도착하면 애니메이션 없이 0으로 되돌려 끊김 없이 순환한다.
 */
export function useRollingIndex(count: number, intervalMs = 3500) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count <= 1 || paused) return undefined;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((prev) => prev + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [count, intervalMs, paused]);

  const onTransitionEnd = useCallback(() => {
    if (index < count) return;
    setAnimate(false);
    setIndex(0);
  }, [index, count]);

  return {
    index,
    animate,
    onTransitionEnd,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  } as const;
}
