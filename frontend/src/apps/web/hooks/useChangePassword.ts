import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { goToLogin, isLoggedIn, logoutToLogin } from '../../../shared/auth';
import { isValidPassword, PASSWORD_RULE } from '../../../shared/userRules';
import { resetPassword } from '../api/auth';
import { changePasswordContent, mockAccounts, ROUTES } from '../data/mockData';
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
  const timer = useRef<number>();
  const strength = usePasswordStrength(password);

  useEffect(() => () => window.clearTimeout(timer.current), []);

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (mode === 'loggedIn') {
      if (!current) {
        setCurrentError(changePasswordContent.messages.currentRequired);
        return;
      }
      // TODO: PATCH /api/users/me/password 연동 (400 PASSWORD_MISMATCH)
      if (!mockAccounts.some((a) => a.password === current)) {
        setCurrentError(changePasswordContent.messages.currentMismatch);
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
    if (resetToken) {
      void submitReset(resetToken);
      return;
    }
    setSubmitting(true);
    timer.current = window.setTimeout(() => {
      window.alert(changePasswordContent.messages.success);
      // 로그인 상태에서 바꾸면 토큰을 지우고 로그인 화면으로 (API_SPEC PATCH /api/users/me/password)
      logoutToLogin();
    }, 700);
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
