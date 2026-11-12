import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { findPasswordContent, mockAccounts, ROUTES } from '../data/mockData';

export function useFindPassword() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = userId.trim();
    const mail = email.trim().toLowerCase();
    if (!id || !mail) {
      setError(findPasswordContent.messages.required);
      return;
    }
    const account = mockAccounts.find((a) => a.userId === id && a.email.toLowerCase() === mail);
    if (!account) {
      setError(findPasswordContent.messages.notFound);
      return;
    }
    setError(null);
    // Step 2 of the reset flow lives on the 비밀번호 변경 screen.
    navigate(ROUTES.changePassword, { state: { verifiedUserId: account.userId } });
  };

  return {
    userId,
    setUserId: (v: string) => {
      setUserId(v);
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
