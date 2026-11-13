import { useRef, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { type AvailabilityField, getAvailability } from '../api/users';
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

/**
 * 입력값 + "중복 확인" 상태. 값을 고치면 확인을 다시 해야 한다.
 * 서버가 대소문자를 구분해 탈퇴하지 않은 회원과 비교한다 (API_SPEC GET /api/users/availability).
 */
export function useDuplicateCheck(
  field: AvailabilityField,
  messages: DuplicateCheckMessages,
  validate?: (value: string) => boolean,
) {
  const [value, setRawValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<CheckStatus>({ tone: 'info', text: messages.prompt });
  // 확인 중에 값을 고치면, 늦게 온 이전 값의 응답이 새 값의 상태를 덮어쓰지 않게 한다
  const requestId = useRef(0);

  const setValue = (next: string) => {
    requestId.current += 1;
    setRawValue(next);
    setChecked(false);
    setChecking(false);
    setStatus({ tone: 'info', text: messages.prompt });
  };

  const check = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setStatus({ tone: 'danger', text: messages.empty });
      return;
    }
    if (validate && !validate(trimmed)) {
      setStatus({ tone: 'danger', text: messages.invalid ?? messages.empty });
      return;
    }
    const id = ++requestId.current;
    setChecking(true);
    try {
      const { isAvailable } = await getAvailability(field, trimmed);
      if (id !== requestId.current) return;
      setChecked(isAvailable);
      setStatus({
        tone: isAvailable ? 'success' : 'danger',
        text: isAvailable ? messages.available : messages.taken,
      });
    } catch (error) {
      if (id !== requestId.current) return;
      setChecked(false);
      setStatus({ tone: 'danger', text: `✖ ${getErrorMessage(error)}` });
    } finally {
      if (id === requestId.current) setChecking(false);
    }
  };

  /** Returns true when the value passed the duplicate check; otherwise flags an error. */
  const requireChecked = () => {
    if (checked) return true;
    setStatus({ tone: 'danger', text: value.trim() ? messages.unchecked : messages.empty });
    return false;
  };

  /** 중복 확인 뒤 다른 회원이 먼저 같은 값으로 가입해 가입 요청이 409로 실패했을 때 */
  const markTaken = () => {
    requestId.current += 1;
    setChecked(false);
    setChecking(false);
    setStatus({ tone: 'danger', text: messages.taken });
  };

  return { value, setValue, checked, checking, status, check, requireChecked, markTaken };
}

export type DuplicateCheckState = ReturnType<typeof useDuplicateCheck>;
