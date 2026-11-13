import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import {
  isValidEmail,
  isValidPassword,
  isValidPersonName,
  isValidUsername,
  NICKNAME_MIN,
} from '../../../shared/userRules';
import { signup } from '../api/auth';
import { ROUTES, signupContent } from '../data/mockData';
import { useDuplicateCheck } from './useDuplicateCheck';
const m = signupContent.messages;

export type MatchState = 'idle' | 'match' | 'mismatch';

export function useSignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [forceMismatch, setForceMismatch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const username = useDuplicateCheck(
    'username',
    {
      prompt: m.checkPrompt,
      empty: m.idEmpty,
      invalid: m.idInvalid,
      taken: m.idTaken,
      available: m.idAvailable,
      unchecked: m.idUnchecked,
    },
    isValidUsername,
  );
  const nickname = useDuplicateCheck(
    'nickname',
    {
      prompt: m.checkPrompt,
      empty: m.nicknameEmpty,
      invalid: m.nicknameInvalid,
      taken: m.nicknameTaken,
      available: m.nicknameAvailable,
      unchecked: m.nicknameUnchecked,
    },
    (v) => isValidPersonName(v, NICKNAME_MIN),
  );
  const email = useDuplicateCheck(
    'email',
    {
      prompt: m.checkPrompt,
      empty: m.emailInvalid,
      invalid: m.emailInvalid,
      taken: m.emailTaken,
      available: m.emailAvailable,
      unchecked: m.emailUnchecked,
    },
    isValidEmail,
  );

  let matchState: MatchState = 'idle';
  if (passwordConfirm) matchState = password === passwordConfirm ? 'match' : 'mismatch';
  else if (forceMismatch) matchState = 'mismatch';

  // 가입 시점에 서버가 다시 중복을 검사한다. 확인 뒤 다른 회원이 먼저 가입했으면 409 (API_SPEC 2장)
  const duplicatedFields: Readonly<Record<string, typeof username>> = {
    USERNAME_DUPLICATED: username,
    NICKNAME_DUPLICATED: nickname,
    EMAIL_DUPLICATED: email,
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const nameMessage = !trimmedName
      ? m.nameRequired
      : isValidPersonName(trimmedName)
        ? null
        : m.nameInvalid;
    const passwordMessage = !password
      ? m.passwordRequired
      : isValidPassword(password)
        ? null
        : m.passwordInvalid;
    const nameOk = nameMessage === null;
    const passwordOk = passwordMessage === null;
    const confirmOk = passwordConfirm.length > 0 && password === passwordConfirm;
    setNameError(nameMessage);
    setPasswordError(passwordMessage);
    setForceMismatch(!confirmOk);
    // Run every check so all field errors surface at once.
    const idOk = username.requireChecked();
    const nicknameOk = nickname.requireChecked();
    const emailOk = email.requireChecked();

    if (!(nameOk && passwordOk && confirmOk && idOk && nicknameOk && emailOk)) return;

    setSubmitting(true);
    try {
      await signup({
        name: trimmedName,
        username: username.value.trim(),
        nickname: nickname.value.trim(),
        password,
        email: email.value.trim(),
      });
      window.alert(m.success);
      navigate(ROUTES.login);
    } catch (error) {
      setSubmitting(false);
      const duplicated = error instanceof ApiError ? duplicatedFields[error.code] : undefined;
      if (duplicated) duplicated.markTaken();
      else window.alert(getErrorMessage(error));
    }
  };

  return {
    name,
    setName: (v: string) => {
      setName(v);
      setNameError(null);
    },
    nameError,
    password,
    setPassword: (v: string) => {
      setPassword(v);
      setPasswordError(null);
    },
    passwordError,
    passwordConfirm,
    setPasswordConfirm: (v: string) => {
      setPasswordConfirm(v);
      setForceMismatch(false);
    },
    matchState,
    username,
    nickname,
    email,
    submitting,
    submit,
    cancel: () => navigate(ROUTES.login),
  };
}
