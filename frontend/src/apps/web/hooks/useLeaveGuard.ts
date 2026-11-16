import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 저장하지 않은 변경이 있을 때 화면을 떠나기 전에 묻는다.
 * - 화면 안 링크: guardLink(to)를 onClick에 걸면 이동을 멈추고 확인 창을 띄운다(pendingTo)
 * - 새로고침·탭 닫기: 브라우저 기본 경고 (문구는 브라우저가 정해 바꿀 수 없다)
 * BrowserRouter라 헤더 메뉴 이동과 브라우저 뒤로 가기는 막지 않는다
 */
export function useLeaveGuard(dirty: boolean) {
  const navigate = useNavigate();
  const [pendingTo, setPendingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 예전 브라우저는 returnValue 를 채워야 경고를 띄운다
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const guardLink = (to: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (!dirty) return;
    // 새 탭 열기 등 보조 키를 누른 클릭은 이 화면을 떠나지 않으므로 그대로 둔다
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setPendingTo(to);
  };

  return {
    pendingTo,
    guardLink,
    cancelLeave: () => setPendingTo(null),
    confirmLeave: () => {
      if (pendingTo) navigate(pendingTo);
    },
  };
}
