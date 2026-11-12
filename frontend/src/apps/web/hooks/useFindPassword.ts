import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { findPasswordContent, mockAccounts, ROUTES } from '../data/mockData';

export function useFindPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = username.trim();
    const mail = email.trim().toLowerCase();
    if (!id || !mail) {
      setError(findPasswordContent.messages.required);
      return;
    }
    const account = mockAccounts.find((a) => a.username === id && a.email.toLowerCase() === mail);
    if (!account) {
      setError(findPasswordContent.messages.notFound);
      return;
    }
    setError(null);
    // Step 2 of the reset flow lives on the 비밀번호 변경 screen.
    navigate(ROUTES.changePassword, { state: { verifiedUsername: account.username } });
  };

  return {
    username,
    setUsername: (v: string) => {
      setUsername(v);
      setError(null);
    },
    email,
    setEmail: (v: string) => {
      setEmail(v);
      setError(null);
    },
    error,
    submit,
    cancel: () => navigate(ROUTES.login),
  };
}
