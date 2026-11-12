import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAccounts, ROUTES } from '../data/mockData';

export function useLoginForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [hasError, setHasError] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = userId.trim();
    const account = mockAccounts.find(
      (a) => (a.userId === id || a.email === id) && a.password === password,
    );
    if (!account) {
      setHasError(true);
      return;
    }
    setHasError(false);
    navigate(ROUTES.mypage);
  };

  return {
    userId,
    setUserId,
    password,
    setPassword,
    remember,
    setRemember,
    hasError,
    dismissError: () => setHasError(false),
    submit,
  };
}
