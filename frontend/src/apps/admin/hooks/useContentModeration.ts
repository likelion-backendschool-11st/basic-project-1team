import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { deleteContent, updateContentStatus } from '../api/contents';
import { confirmDeleteCopy, ui } from '../data/mockData';
import type { ContentStatus, ContentType } from '../types';
import { useConfirmDelete, type ConfirmDeleteState } from './useConfirmDelete';

/** 숨김·복구 확인 창에 띄울 요청 */
export interface StatusChangeRequest {
  readonly id: number;
  /** 예: "답변 #342" */
  readonly target: string;
  readonly nextStatus: 'hidden' | 'active';
  /** 함께 알릴 내용 (채택 해제 등) */
  readonly notes: readonly string[];
}

export interface ContentModerationState {
  readonly statusRequest: StatusChangeRequest | null;
  /** 숨김·복구 버튼: 사유를 받는 확인 창을 연다 */
  readonly askStatusChange: (
    row: { readonly id: number; readonly status: ContentStatus },
    notes?: readonly string[],
  ) => void;
  readonly closeStatusChange: () => void;
  readonly confirmStatusChange: (reason: string) => void;
  /** 삭제 버튼: 함께 바뀌는 것을 알리는 확인 창을 연다 (REQ-ADMIN-008) */
  readonly askDelete: (id: number, notes?: readonly string[]) => void;
  readonly confirmDelete: ConfirmDeleteState;
  readonly submitting: boolean;
  /** 서버가 거절한 이유 (예: 다른 관리자가 먼저 삭제함) */
  readonly actionError: string | null;
}

const toMessage = (error: unknown) => (error instanceof ApiError ? error.message : ui.loadError);

/**
 * 질문·답변·게시글·댓글의 숨김/복구/삭제 (API_SPEC 10.3·10.4).
 * 성공하면 onChanged 로 목록·탭 개수를 다시 불러온다.
 */
export function useContentModeration(
  type: ContentType,
  onChanged: () => void,
): ContentModerationState {
  const [statusRequest, setStatusRequest] = useState<StatusChangeRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const confirmDelete = useConfirmDelete();
  const targetName = confirmDeleteCopy.targets[type];

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setSubmitting(true);
      setActionError(null);
      try {
        await action();
      } catch (error) {
        setActionError(toMessage(error));
      } finally {
        setSubmitting(false);
        // 실패해도 다른 관리자가 먼저 바꿨을 수 있으므로 최신 상태를 다시 읽는다
        onChanged();
      }
    },
    [onChanged],
  );

  const askStatusChange = useCallback<ContentModerationState['askStatusChange']>(
    (row, notes = []) => {
      if (row.status === 'deleted') return;
      setStatusRequest({
        id: row.id,
        target: `${targetName} #${row.id}`,
        nextStatus: row.status === 'hidden' ? 'active' : 'hidden',
        notes,
      });
    },
    [targetName],
  );

  const closeStatusChange = useCallback(() => setStatusRequest(null), []);

  const confirmStatusChange = useCallback(
    (reason: string) => {
      if (!statusRequest) return;
      const { id, nextStatus } = statusRequest;
      setStatusRequest(null);
      void run(() => updateContentStatus(type, id, nextStatus, reason));
    },
    [statusRequest, run, type],
  );

  const askDelete = useCallback(
    (id: number, notes: readonly string[] = []) =>
      confirmDelete.ask({
        target: `${targetName} #${id}`,
        notes,
        onConfirm: () => void run(() => deleteContent(type, id)),
      }),
    [confirmDelete, targetName, run, type],
  );

  return {
    statusRequest,
    askStatusChange,
    closeStatusChange,
    confirmStatusChange,
    askDelete,
    confirmDelete,
    submitting,
    actionError,
  };
}
