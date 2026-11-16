import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, getErrorMessage } from '../../../shared/api';
import { logoutToLogin } from '../../../shared/auth';
import { withdrawMe } from '../api/users';
import { ROUTES, withdrawContent } from '../data/mockData';
import { setFlashToast } from './useFlashToast';

export function useWithdraw() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState('');
  // 비밀번호 빈 값·불일치는 입력란 바로 아래에 보여 준다 (API_SPEC 2장 회원 탈퇴)
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // 서버 오류는 버튼 바로 위에 서버 메시지 그대로 보여 준다
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirm = async () => {
    if (!agreed || submitting) return;
    setErrorMessage(null);
    // 비밀번호는 입력한 그대로 서버가 비교하므로 공백을 지우지 않는다
    if (!password) {
      setPasswordError(withdrawContent.password.required);
      return;
    }
    setSubmitting(true);
    try {
      await withdrawMe(password);
      setFlashToast(withdrawContent.done);
      // 탈퇴한 회원의 토큰은 더 쓸 수 없으므로 지우고 로그인 화면으로 (REQ-ACCDELETE-001)
      logoutToLogin();
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.code === 'PASSWORD_MISMATCH') {
        setPasswordError(withdrawContent.password.mismatch);
      } else {
        setErrorMessage(getErrorMessage(error));
      }
    }
  };

  return {
    agreed,
    setAgreed,
    password,
    setPassword: (value: string) => {
      setPassword(value);
      setPasswordError(null);
    },
    passwordError,
    submitting,
    errorMessage,
    confirm,
    cancel: () => navigate(ROUTES.mypageEdit),
  };
}
