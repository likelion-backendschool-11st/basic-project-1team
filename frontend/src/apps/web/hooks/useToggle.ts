import { useCallback, useState } from 'react';

export function useToggle(initial = false): readonly [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return [value, toggle, setValue] as const;
}
