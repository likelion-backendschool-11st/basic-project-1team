import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../../shared/api';
import { getRedirectPath, saveAccessToken } from '../../../shared/auth';
import { login } from '../api/auth';
import { loginContent } from '../data/mockData';

/**
 * 아이디·비밀번호 틀림은 구분 없이 같은 문구로 알린다 (API_SPEC 2장 로그인).
 * 정지(USER_SUSPENDED) 등은 해제일이 들어 있는 서버 메시지를 그대로 보여 준다.
 */
function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code !== 'INVALID_CREDENTIALS') return error.message;
  return loginContent.error.message;
}

export function useLoginForm() {
  const { search } = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await login({ loginId: username.trim(), password, rememberMe: remember });
      setErrorMessage(null);
      saveAccessToken(result.accessToken, remember);
      // 헤더 등 화면 전체가 로그인 상태를 다시 읽도록 전체 페이지 이동 (관리자 화면으로 갈 수도 있음)
      window.location.assign(getRedirectPath(search, result.user.role));
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setSubmitting(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    remember,
    setRemember,
    hasError: errorMessage !== null,
    errorMessage,
    submitting,
    dismissError: () => setErrorMessage(null),
    submit,
  };
}
