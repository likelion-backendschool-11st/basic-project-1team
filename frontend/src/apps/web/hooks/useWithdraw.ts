import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, withdrawContent } from '../data/mockData';

export function useWithdraw() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const confirm = () => {
    if (!agreed) return;
    window.alert(withdrawContent.done);
    navigate(ROUTES.login, { replace: true });
  };

  return {
    agreed,
    setAgreed,
    confirm,
    cancel: () => navigate(ROUTES.mypageEdit),
  };
}
