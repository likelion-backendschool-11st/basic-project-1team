import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { goToLogin, isLoggedIn, logoutToLogin } from '../../../shared/auth';
import { isValidPassword, PASSWORD_RULE } from '../../../shared/userRules';
import { resetPassword } from '../api/auth';
import { changeMyPassword } from '../api/users';
import { changePasswordContent, ROUTES } from '../data/mockData';
import { usePasswordStrength } from './usePasswordStrength';

export type ConfirmState = 'hint' | 'match' | 'mismatch';

/**
 * 같은 화면을 두 흐름이 함께 쓴다.
 * - 비밀번호 찾기에서 넘어옴(reset): 새 비밀번호만 → POST /api/auth/password-reset
 * - 로그인 상태(loggedIn): 현재 비밀번호 + 새 비밀번호 → PATCH /api/users/me/password
 */
export function useChangePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // 비밀번호 찾기 1단계에서 받은 재설정 토큰 (API_SPEC POST /api/auth/password-reset/verify)
  const resetToken = (state as { resetToken?: string } | null)?.resetToken;
  const mode: 'reset' | 'loggedIn' = resetToken ? 'reset' : 'loggedIn';
  const [current, setCurrent] = useState('');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forceMismatch, setForceMismatch] = useState(false);
  const strength = usePasswordStrength(password);

  // 비밀번호 찾기를 거치지 않고 들어온 비회원은 로그인부터
  useEffect(() => {
    if (mode === 'loggedIn' && !isLoggedIn()) goToLogin();
  }, [mode]);

  let confirmState: ConfirmState = 'hint';
  if (confirm) confirmState = password === confirm ? 'match' : 'mismatch';
  else if (forceMismatch) confirmState = 'mismatch';

  const submitReset = async (token: string) => {
    setSubmitting(true);
    try {
      await resetPassword({ resetToken: token, newPassword: password });
      window.alert(changePasswordContent.messages.success);
      // 쓴 토큰이 남은 이 화면으로 뒤로 가기 하지 않도록 기록을 바꾼다
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      setSubmitting(false);
      window.alert(getErrorMessage(error));
      // 만료·이미 사용한 토큰이면 본인 확인부터 다시 (API_SPEC 2장 RESET_TOKEN_INVALID)
      if (error instanceof ApiError && error.code === 'RESET_TOKEN_INVALID') {
        navigate(ROUTES.findPassword, { replace: true });
      }
    }
  };

  const submitLoggedIn = async () => {
    setSubmitting(true);
    try {
      await changeMyPassword({ currentPassword: current, newPassword: password });
      window.alert(changePasswordContent.messages.success);
      // 바꾼 뒤에는 토큰을 지우고 로그인 화면으로 (API_SPEC PATCH /api/users/me/password)
      logoutToLogin();
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.code === 'PASSWORD_MISMATCH') {
        setCurrentError(changePasswordContent.messages.currentMismatch);
      } else {
        window.alert(getErrorMessage(error));
      }
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (mode === 'loggedIn') {
      if (!current) {
        setCurrentError(changePasswordContent.messages.currentRequired);
        return;
      }
    }
    if (!isValidPassword(password)) {
      window.alert(PASSWORD_RULE);
      return;
    }
    if (password !== confirm) {
      setForceMismatch(true);
      return;
    }
    // 현재 비밀번호가 맞는지는 서버가 확인한다 (400 PASSWORD_MISMATCH)
    if (resetToken) void submitReset(resetToken);
    else void submitLoggedIn();
  };

  return {
    mode,
    current,
    setCurrent: (v: string) => {
      setCurrent(v);
      setCurrentError(null);
    },
    currentError,
    password,
    setPassword,
    confirm,
    setConfirm: (v: string) => {
      setConfirm(v);
      setForceMismatch(false);
    },
    strength,
    confirmState,
    submitting,
    submit,
    cancel: () => navigate(-1),
  };
}
