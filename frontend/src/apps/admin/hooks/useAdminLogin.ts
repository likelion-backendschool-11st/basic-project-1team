import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../../shared/api';
import { saveAccessToken } from '../../../shared/auth';
import { getAdminRedirectPath } from '../adminSite';
import { login } from '../api/auth';
import { adminLoginCopy } from '../data/mockData';

/**
 * 아이디·비밀번호 틀림은 구분 없이 같은 문구로 알린다 (API_SPEC 2장 로그인).
 * 정지(USER_SUSPENDED) 등은 해제일이 들어 있는 서버 메시지를 그대로 보여 준다.
 */
function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code !== 'INVALID_CREDENTIALS') return error.message;
  return adminLoginCopy.invalidCredentials;
}

/**
 * 관리자 사이트 로그인. 사용자 로그인(apps/web useLoginForm)과 같은 처리이고,
 * 관리자(ADMIN)가 아니면 토큰을 저장하지 않고 거절한다.
 */
export function useAdminLogin() {
  const { search } = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = loginId.trim() !== '' && password !== '' && !submitting;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await login({ loginId: loginId.trim(), password, rememberMe: remember });
      if (result.user.role !== 'ADMIN') {
        setErrorMessage(adminLoginCopy.notAdmin);
        setSubmitting(false);
        return;
      }
      setErrorMessage(null);
      saveAccessToken(result.accessToken, remember);
      // 화면 전체가 로그인 상태를 다시 읽도록 전체 페이지 이동
      window.location.assign(getAdminRedirectPath(search));
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setSubmitting(false);
    }
  };

  return {
    loginId,
    setLoginId,
    password,
    setPassword,
    remember,
    setRemember,
    errorMessage,
    submitting,
    canSubmit,
    submit: (event: FormEvent<HTMLFormElement>) => void submit(event),
  };
}
