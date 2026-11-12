import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ComponentType, MouseEvent, ReactNode } from 'react';
import { goToLogin, isLoggedIn } from './auth';

export interface LoginPromptProps {
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

interface LoginGateContextValue {
  /** 로그인 상태면 true. 아니면 로그인 안내 팝업을 띄우고 false. */
  readonly requireLogin: () => boolean;
  /** 회원 전용 화면으로 가는 Link 의 onClick. 비회원이면 이동을 막고 팝업을 띄운다. */
  readonly guardLink: (event: MouseEvent) => void;
}

const LoginGateContext = createContext<LoginGateContextValue | null>(null);

export interface LoginGateProviderProps {
  /** 모듈마다 디자인 토큰이 달라 팝업은 각 모듈이 넘긴다. */
  readonly prompt: ComponentType<LoginPromptProps>;
  readonly children: ReactNode;
}

/** 비회원이 작성·추천·신고를 누르면 로그인 화면으로 이동할지 묻는다. */
export function LoginGateProvider({ prompt: Prompt, children }: LoginGateProviderProps) {
  const [open, setOpen] = useState(false);
  const requireLogin = useCallback(() => {
    if (isLoggedIn()) return true;
    setOpen(true);
    return false;
  }, []);
  const guardLink = useCallback(
    (event: MouseEvent) => {
      if (!requireLogin()) event.preventDefault();
    },
    [requireLogin],
  );
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ requireLogin, guardLink }), [requireLogin, guardLink]);

  return (
    <LoginGateContext.Provider value={value}>
      {children}
      {open && <Prompt onClose={close} onConfirm={goToLogin} />}
    </LoginGateContext.Provider>
  );
}

export function useLoginGate(): LoginGateContextValue {
  const ctx = useContext(LoginGateContext);
  if (!ctx) throw new Error('useLoginGate must be used within LoginGateProvider');
  return ctx;
}
