import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import type { EditHistory } from '../data/types';

/** 수정 이력 모달의 목록. `load` 는 질문·답변 수정 이력 API 중 하나 (API_SPEC 3·4장) */
export function useEditHistories(load: () => Promise<readonly EditHistory[]>) {
  const [histories, setHistories] = useState<readonly EditHistory[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    load()
      .then((next) => {
        if (!ignore) setHistories(next);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      });
    return () => {
      ignore = true;
    };
    // 모달을 열 때 한 번 부른다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { histories, errorMessage };
}
