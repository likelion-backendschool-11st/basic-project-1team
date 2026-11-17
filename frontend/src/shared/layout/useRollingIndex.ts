import { type TransitionEvent, useCallback, useEffect, useState } from 'react';

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
      // 애니메이션이 꺼져 있으면(움직임 줄이기 설정) transitionend 가 오지 않으므로 복제본 다음은 1로 넘긴다
      setIndex((prev) => (prev >= count ? 1 : prev + 1));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [count, intervalMs, paused]);

  const onTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLElement>) => {
      // 안쪽 링크의 색 전환(hover) 이벤트는 무시하고 목록 이동만 본다
      if (event.target !== event.currentTarget || index < count) return;
      setAnimate(false);
      setIndex(0);
    },
    [index, count],
  );

  return {
    index,
    animate,
    onTransitionEnd,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  } as const;
}
