import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { goToLogin, isLoggedIn, logout } from '../../../shared/auth';
import { isValidPassword, PASSWORD_RULE } from '../../../shared/userRules';
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
  const mode: 'reset' | 'loggedIn' = (state as { verifiedUsername?: string } | null)?.verifiedUsername ? 'reset' : 'loggedIn';
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    setSubmitting(true);
    timer.current = window.setTimeout(() => {
      window.alert(changePasswordContent.messages.success);
      // 로그인 상태였다면 토큰을 지우고 로그인 화면으로 (API_SPEC PATCH /api/users/me/password)
      if (mode === 'loggedIn') logout();
      else navigate(ROUTES.login);
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
