import { useCallback, useState } from 'react';

export interface DeleteRequest {
  /** 모달 제목에 들어갈 대상 이름. 예: "질문 #128" */
  readonly target: string;
  /** 삭제하면 함께 일어나는 일 (답변 함께 삭제, 채택 해제 등) */
  readonly notes?: readonly string[];
  readonly onConfirm: () => void;
}

export interface ConfirmDeleteState {
  readonly request: DeleteRequest | null;
  readonly ask: (request: DeleteRequest) => void;
  readonly close: () => void;
  readonly confirm: () => void;
}

/** 삭제 전 확인 모달 상태 (REQ-ADMIN-008). 실제 삭제는 confirm 에서만 실행한다. */
export function useConfirmDelete(): ConfirmDeleteState {
  const [request, setRequest] = useState<DeleteRequest | null>(null);

  const close = useCallback(() => setRequest(null), []);

  const confirm = useCallback(() => {
    request?.onConfirm();
    setRequest(null);
  }, [request]);

  return { request, ask: setRequest, close, confirm };
}
