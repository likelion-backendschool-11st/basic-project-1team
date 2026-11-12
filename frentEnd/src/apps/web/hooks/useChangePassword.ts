import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordContent, ROUTES } from '../data/mockData';
import { usePasswordStrength } from './usePasswordStrength';

export type ConfirmState = 'hint' | 'match' | 'mismatch';

export function useChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forceMismatch, setForceMismatch] = useState(false);
  const timer = useRef<number>();
  const strength = usePasswordStrength(password);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  let confirmState: ConfirmState = 'hint';
  if (confirm) confirmState = password === confirm ? 'match' : 'mismatch';
  else if (forceMismatch) confirmState = 'mismatch';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) {
      window.alert(changePasswordContent.messages.tooShort);
      return;
    }
    if (password !== confirm) {
      setForceMismatch(true);
      return;
    }
    setSubmitting(true);
    timer.current = window.setTimeout(() => {
      window.alert(changePasswordContent.messages.success);
      navigate(ROUTES.login);
    }, 700);
  };

  return {
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
