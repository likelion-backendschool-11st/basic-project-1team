import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, signupContent, takenEmails, takenNicknames, takenUserIds } from '../data/mockData';
import { useDuplicateCheck } from './useDuplicateCheck';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const m = signupContent.messages;

export type MatchState = 'idle' | 'match' | 'mismatch';

export function useSignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [forceMismatch, setForceMismatch] = useState(false);

  const userId = useDuplicateCheck(takenUserIds, {
    prompt: m.checkPrompt,
    empty: m.idEmpty,
    taken: m.idTaken,
    available: m.idAvailable,
    unchecked: m.idUnchecked,
  });
  const nickname = useDuplicateCheck(takenNicknames, {
    prompt: m.checkPrompt,
    empty: m.nicknameEmpty,
    taken: m.nicknameTaken,
    available: m.nicknameAvailable,
    unchecked: m.nicknameUnchecked,
  });
  const email = useDuplicateCheck(
    takenEmails,
    {
      prompt: m.checkPrompt,
      empty: m.emailInvalid,
      invalid: m.emailInvalid,
      taken: m.emailTaken,
      available: m.emailAvailable,
      unchecked: m.emailUnchecked,
    },
    (v) => EMAIL_REGEX.test(v),
  );

  let matchState: MatchState = 'idle';
  if (passwordConfirm) matchState = password === passwordConfirm ? 'match' : 'mismatch';
  else if (forceMismatch) matchState = 'mismatch';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nameOk = name.trim().length > 0;
    const passwordOk = password.length > 0;
    const confirmOk = passwordConfirm.length > 0 && password === passwordConfirm;
    setNameError(!nameOk);
    setPasswordError(!passwordOk);
    setForceMismatch(!confirmOk);
    // Run every check so all field errors surface at once.
    const idOk = userId.requireChecked();
    const nicknameOk = nickname.requireChecked();
    const emailOk = email.requireChecked();

    if (nameOk && passwordOk && confirmOk && idOk && nicknameOk && emailOk) {
      window.alert(m.success);
      navigate(ROUTES.login);
    }
  };

  return {
    name,
    setName: (v: string) => {
      setName(v);
      setNameError(false);
    },
    nameError,
    password,
    setPassword: (v: string) => {
      setPassword(v);
      setPasswordError(false);
    },
    passwordError,
    passwordConfirm,
    setPasswordConfirm: (v: string) => {
      setPasswordConfirm(v);
      setForceMismatch(false);
    },
    matchState,
    userId,
    nickname,
    email,
    submit,
    cancel: () => navigate(ROUTES.login),
  };
}
