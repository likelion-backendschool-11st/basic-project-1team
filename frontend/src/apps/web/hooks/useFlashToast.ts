import { useEffect, useState } from 'react';

const FLASH_TOAST_KEY = 'flashToast';
const TOAST_DURATION_MS = 3000;

/**
 * 다음 화면에 띄울 성공 안내를 남긴다.
 * 로그아웃 뒤 전체 페이지 이동(logoutToLogin)을 해도 남도록 sessionStorage 에 둔다.
 * 저장소를 못 쓰는 환경이면 안내만 빠지고 흐름은 그대로 진행한다.
 */
export function setFlashToast(message: string): void {
  try {
    sessionStorage.setItem(FLASH_TOAST_KEY, message);
  } catch {
    // 안내를 못 남겨도 화면 이동은 계속한다
  }
}

function takeFlashToast(): string | null {
  try {
    const message = sessionStorage.getItem(FLASH_TOAST_KEY);
    sessionStorage.removeItem(FLASH_TOAST_KEY);
    return message;
  } catch {
    return null;
  }
}

/** 이전 화면이 남긴 성공 안내를 한 번 꺼내 잠시 보여 준다 (회원가입·비밀번호 변경·회원탈퇴 후 로그인 화면) */
export function useFlashToast() {
  const [message, setMessage] = useState<string | null>(null);

  // StrictMode 개발 모드에서는 effect 가 두 번 돈다. 두 번째는 꺼낼 값이 없으므로 있을 때만 넣는다
  useEffect(() => {
    const flash = takeFlashToast();
    if (flash) setMessage(flash);
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  return { message, dismiss: () => setMessage(null) };
}
