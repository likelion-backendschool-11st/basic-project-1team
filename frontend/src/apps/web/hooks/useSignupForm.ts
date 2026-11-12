import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail, isValidPassword, isValidPersonName, NICKNAME_MIN } from '../../../shared/userRules';
import { ROUTES, signupContent, takenEmails, takenNicknames, takenUsernames } from '../data/mockData';
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

  const username = useDuplicateCheck(takenUsernames, {
    prompt: m.checkPrompt,
    empty: m.idEmpty,
    taken: m.idTaken,
    available: m.idAvailable,
    unchecked: m.idUnchecked,
  });
  const nickname = useDuplicateCheck(
    takenNicknames,
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
    takenEmails,
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const nameMessage = !trimmedName ? m.nameRequired : isValidPersonName(trimmedName) ? null : m.nameInvalid;
    const passwordMessage = !password ? m.passwordRequired : isValidPassword(password) ? null : m.passwordInvalid;
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

    if (nameOk && passwordOk && confirmOk && idOk && nicknameOk && emailOk) {
      window.alert(m.success);
      navigate(ROUTES.login);
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
    submit,
    cancel: () => navigate(ROUTES.login),
  };
}
