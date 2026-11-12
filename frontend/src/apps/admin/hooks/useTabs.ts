import { useState } from 'react';

export interface TabsState<K extends string> {
  readonly active: K;
  readonly select: (key: K) => void;
}

export function useTabs<K extends string>(initial: K): TabsState<K> {
  const [active, setActive] = useState<K>(initial);
  return { active, select: setActive };
}
