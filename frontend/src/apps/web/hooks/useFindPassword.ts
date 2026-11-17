import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { verifyPasswordReset } from '../api/auth';
import { findPasswordContent, ROUTES } from '../data/mockData';

export function useFindPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 재설정 토큰이 만료돼 비밀번호 변경 화면에서 돌아온 경우 그 안내를 보여 준다.
  // 새로고침하면 다시 뜨지 않도록 기록의 state 는 비운다
  const returnedError = (location.state as { error?: string } | null)?.error;
  useEffect(() => {
    if (!returnedError) return;
    setError(returnedError);
    navigate(location.pathname, { replace: true, state: null });
  }, [returnedError, location.pathname, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const id = username.trim();
    const mail = email.trim();
    if (!id || !mail) {
      setError(findPasswordContent.messages.required);
      return;
    }
    setSubmitting(true);
    try {
      const { resetToken } = await verifyPasswordReset({ username: id, email: mail });
      setError(null);
      // 2단계(새 비밀번호 입력)는 비밀번호 변경 화면이 받는다. 토큰은 10분 동안 한 번만 쓸 수 있다
      navigate(ROUTES.changePassword, { state: { resetToken } });
    } catch (caught) {
      setSubmitting(false);
      setError(
        caught instanceof ApiError && caught.code === 'USER_NOT_FOUND'
          ? findPasswordContent.messages.notFound
          : getErrorMessage(caught),
      );
    }
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
    submitting,
    submit,
    cancel: () => navigate(ROUTES.login),
  };
}
