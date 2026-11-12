import { useState } from 'react';
import type { FormEvent } from 'react';
import { mockAccounts } from '../data/mockData';

/** mock: 서버가 하는 마스킹 (API_SPEC POST /api/auth/find-username). 앞 3자, 5자 이하면 앞 2자만 보여 준다. */
function maskUsername(username: string): string {
  const visible = username.length <= 5 ? 2 : 3;
  return username.slice(0, visible) + '*'.repeat(username.length - visible);
}

export type FindIdResult =
  | { readonly status: 'idle' }
  | { readonly status: 'found'; readonly maskedUsername: string }
  | { readonly status: 'notFound' };

export function useFindId() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<FindIdResult>({ status: 'idle' });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = mockAccounts.find(
      (a) => a.name === name.trim() && a.email === email.trim(),
    );
    setResult(account ? { status: 'found', maskedUsername: maskUsername(account.username) } : { status: 'notFound' });
  };

  const reset = () => {
    setName('');
    setEmail('');
    setResult({ status: 'idle' });
  };

  return { name, setName, email, setEmail, result, submit, reset };
}
