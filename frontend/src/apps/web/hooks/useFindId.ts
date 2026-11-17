import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { findUsername } from '../api/auth';
import { findIdContent } from '../data/mockData';

export type FindIdResult =
  | { readonly status: 'idle' }
  | { readonly status: 'found'; readonly maskedUsername: string }
  | { readonly status: 'notFound' }
  | { readonly status: 'error'; readonly message: string };

export function useFindId() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<FindIdResult>({ status: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  // 조회 중에 취소(reset)하면 늦게 온 응답을 화면에 보여 주지 않는다
  const requestId = useRef(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setResult({ status: 'error', message: findIdContent.required });
      return;
    }
    const id = ++requestId.current;
    setSubmitting(true);
    try {
      // 아이디는 서버가 일부를 가려서 준다 (API_SPEC POST /api/auth/find-username)
      const { maskedUsername } = await findUsername({ name: trimmedName, email: trimmedEmail });
      if (id === requestId.current) setResult({ status: 'found', maskedUsername });
    } catch (error) {
      if (id !== requestId.current) return;
      setResult(
        error instanceof ApiError && error.code === 'USER_NOT_FOUND'
          ? { status: 'notFound' }
          : { status: 'error', message: getErrorMessage(error) },
      );
    } finally {
      if (id === requestId.current) setSubmitting(false);
    }
  };

  const reset = () => {
    requestId.current += 1;
    setName('');
    setEmail('');
    setResult({ status: 'idle' });
    setSubmitting(false);
  };

  return { name, setName, email, setEmail, result, submitting, submit, reset };
}
