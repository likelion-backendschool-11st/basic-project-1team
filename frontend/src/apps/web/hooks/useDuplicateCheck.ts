import { useState } from 'react';
import type { StatusTone } from '../components/ui/StatusMessage';

export interface DuplicateCheckMessages {
  readonly prompt: string;
  readonly empty: string;
  readonly taken: string;
  readonly available: string;
  readonly unchecked: string;
  readonly invalid?: string;
}

export interface CheckStatus {
  readonly tone: StatusTone;
  readonly text: string;
}

/** Input value + "중복 확인" state. Editing the value resets the check. */
export function useDuplicateCheck(
  taken: readonly string[],
  messages: DuplicateCheckMessages,
  validate?: (value: string) => boolean,
) {
  const [value, setRawValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<CheckStatus>({ tone: 'info', text: messages.prompt });

  const setValue = (next: string) => {
    setRawValue(next);
    setChecked(false);
    setStatus({ tone: 'info', text: messages.prompt });
  };

  const check = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setStatus({ tone: 'danger', text: messages.empty });
      return;
    }
    if (validate && !validate(trimmed)) {
      setStatus({ tone: 'danger', text: messages.invalid ?? messages.empty });
      return;
    }
    // 대소문자를 구분해 비교한다 (API_SPEC 1.10)
    const isTaken = taken.includes(trimmed);
    setChecked(!isTaken);
    setStatus({
      tone: isTaken ? 'danger' : 'success',
      text: isTaken ? messages.taken : messages.available,
    });
  };

  /** Returns true when the value passed the duplicate check; otherwise flags an error. */
  const requireChecked = () => {
    if (checked) return true;
    setStatus({ tone: 'danger', text: value.trim() ? messages.unchecked : messages.empty });
    return false;
  };

  return { value, setValue, checked, status, check, requireChecked };
}

export type DuplicateCheckState = ReturnType<typeof useDuplicateCheck>;
