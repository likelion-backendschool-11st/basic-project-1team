import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api';

/**
 * 저장 버튼용. 요청 중에는 다시 누를 수 없고, 실패하면 서버 메시지를 안내한다.
 * (글쓰기 제한·차단 태그처럼 서버가 판단하는 오류도 message 를 그대로 보여 준다, API_SPEC 1.3)
 */
export function useAsyncSubmit<A extends unknown[], T>(
  action: (...args: A) => Promise<T>,
  onDone: (result: T) => void,
) {
  const [pending, setPending] = useState(false);

  const submit = async (...args: A) => {
    if (pending) return;
    setPending(true);
    try {
      const result = await action(...args);
      setPending(false);
      onDone(result);
    } catch (error) {
      setPending(false);
      window.alert(getErrorMessage(error));
    }
  };

  return { pending, submit };
}
