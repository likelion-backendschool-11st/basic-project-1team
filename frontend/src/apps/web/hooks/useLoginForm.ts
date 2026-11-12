import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { getRedirectPath, saveAccessToken } from '../../../shared/auth';
import { mockAccounts } from '../data/mockData';

export function useLoginForm() {
  const { search } = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [hasError, setHasError] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = username.trim();
    const account = mockAccounts.find(
      (a) => (a.username === id || a.email === id) && a.password === password,
    );
    if (!account) {
      setHasError(true);
      return;
    }
    setHasError(false);
    // TODO: POST /api/auth/login 연동 시 응답의 accessToken 으로 교체
    saveAccessToken(`mock-token-${account.username}`, remember);
    // 다른 모듈로 돌아갈 수 있어 전체 페이지 이동
    window.location.assign(getRedirectPath(search));
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    remember,
    setRemember,
    hasError,
    dismissError: () => setHasError(false),
    submit,
  };
}
