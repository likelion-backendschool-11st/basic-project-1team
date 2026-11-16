import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api';
import { updateUserPermissions } from '../api/users';
import { memberDetailCopy, ui } from '../data/mockData';
import type { MemberDetail } from '../types';

export interface PermissionFormState {
  readonly reason: string;
  readonly setReason: (value: string) => void;
  /** 권한을 바꿀 수 없는 회원이면 그 이유 (관리자: 400, 탈퇴 회원: 404) */
  readonly blockedReason: string | null;
  readonly canSubmit: boolean;
  readonly submitting: boolean;
  /** 서버가 거절한 이유 */
  readonly errorMessage: string | null;
  readonly hasPermission: (permission: string) => boolean;
  readonly grant: (permission: string) => void;
  readonly revoke: (permission: string) => void;
}

/**
 * 회원 상세의 관리 권한 부여 / 회수 (API_SPEC 10.2 PATCH, REQ-ADMIN-004).
 * 서버는 보낸 목록으로 교체하므로 지금 가진 권한에서 하나를 더하거나 빼서 보낸다.
 * 성공하면 응답으로 받은 회원 상세를 onUpdated 로 넘겨 화면을 바로 갱신한다.
 */
export function usePermissionForm(
  member: MemberDetail,
  onUpdated: (member: MemberDetail) => void,
): PermissionFormState {
  const [reason, setReasonRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setReason = useCallback(
    (value: string) => setReasonRaw(value.slice(0, memberDetailCopy.reasonMax)),
    [],
  );

  const blockedReason =
    member.status === 'withdrawn'
      ? memberDetailCopy.permissionWithdrawnBlocked
      : member.role === 'ADMIN'
        ? memberDetailCopy.permissionAdminBlocked
        : null;
  const canSubmit = reason.trim().length > 0 && blockedReason === null && !submitting;

  const hasPermission = useCallback(
    (permission: string) => member.permissions.includes(permission),
    [member.permissions],
  );

  const send = useCallback(
    async (permissions: readonly string[]) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        onUpdated(await updateUserPermissions(member.id, permissions, reason.trim()));
        setReasonRaw('');
      } catch (error) {
        setErrorMessage(error instanceof ApiError ? error.message : ui.loadError);
      } finally {
        setSubmitting(false);
      }
    },
    [member.id, reason, onUpdated],
  );

  const grant = useCallback(
    (permission: string) => {
      if (!canSubmit || member.permissions.includes(permission)) return;
      void send([...member.permissions, permission]);
    },
    [canSubmit, member.permissions, send],
  );

  const revoke = useCallback(
    (permission: string) => {
      if (!canSubmit || !member.permissions.includes(permission)) return;
      void send(member.permissions.filter((p) => p !== permission));
    },
    [canSubmit, member.permissions, send],
  );

  return {
    reason,
    setReason,
    blockedReason,
    canSubmit,
    submitting,
    errorMessage,
    hasPermission,
    grant,
    revoke,
  };
}
