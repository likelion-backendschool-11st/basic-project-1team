import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { verifyPasswordReset } from '../api/auth';
import { findPasswordContent, ROUTES } from '../data/mockData';

export function useFindPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
