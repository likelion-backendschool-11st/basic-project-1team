import { useState } from 'react';
import type { FormEvent } from 'react';
import { mockAccounts } from '../data/mockData';

export type FindIdResult =
  | { readonly status: 'idle' }
  | { readonly status: 'found'; readonly username: string }
  | { readonly status: 'notFound' };

export function useFindId() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<FindIdResult>({ status: 'idle' });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = mockAccounts.find(
      (a) => a.name === name.trim() && a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    setResult(account ? { status: 'found', username: account.username } : { status: 'notFound' });
  };

  const reset = () => {
    setName('');
    setEmail('');
    setResult({ status: 'idle' });
  };

  return { name, setName, email, setEmail, result, submit, reset };
}
