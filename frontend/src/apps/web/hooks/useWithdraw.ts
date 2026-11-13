import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { logoutToLogin } from '../../../shared/auth';
import { withdrawMe } from '../api/users';
import { ROUTES, withdrawContent } from '../data/mockData';

export function useWithdraw() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    try {
      await withdrawMe();
      window.alert(withdrawContent.done);
      // 탈퇴한 회원의 토큰은 더 쓸 수 없으므로 지우고 로그인 화면으로 (REQ-ACCDELETE-001)
      logoutToLogin();
    } catch (error) {
      setSubmitting(false);
      window.alert(getErrorMessage(error));
    }
  };

  return {
    agreed,
    setAgreed,
    submitting,
    confirm,
    cancel: () => navigate(ROUTES.mypageEdit),
  };
}
