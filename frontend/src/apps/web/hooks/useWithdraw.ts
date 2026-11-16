import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { logoutToLogin } from '../../../shared/auth';
import { withdrawMe } from '../api/users';
import { ROUTES, withdrawContent } from '../data/mockData';
import { setFlashToast } from './useFlashToast';

export function useWithdraw() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // 서버 오류는 버튼 바로 위에 서버 메시지 그대로 보여 준다
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirm = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await withdrawMe();
      setFlashToast(withdrawContent.done);
      // 탈퇴한 회원의 토큰은 더 쓸 수 없으므로 지우고 로그인 화면으로 (REQ-ACCDELETE-001)
      logoutToLogin();
    } catch (error) {
      setSubmitting(false);
      setErrorMessage(getErrorMessage(error));
    }
  };

  return {
    agreed,
    setAgreed,
    submitting,
    errorMessage,
    confirm,
    cancel: () => navigate(ROUTES.mypageEdit),
  };
}
