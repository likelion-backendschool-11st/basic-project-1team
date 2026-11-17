import { useCallback, useState, type FormEvent } from 'react';
import { ApiError } from '../../../shared/api';
import { updateUserSanction } from '../api/users';
import { memberDetailCopy, ui } from '../data/mockData';
import { toSanctionDays } from '../sanction';
import type { MemberDetail, SanctionDays, SanctionType } from '../types';

export interface SanctionFormState {
  readonly type: SanctionType;
  readonly setType: (value: SanctionType) => void;
  readonly duration: SanctionDays;
  readonly setDuration: (value: SanctionDays) => void;
  readonly reason: string;
  readonly setReason: (value: string) => void;
  /** 제재할 수 없는 회원이면 그 이유 (관리자: 403 CANNOT_SANCTION_ADMIN, 탈퇴 회원: 404) */
  readonly blockedReason: string | null;
  /** 같은 종류 제재가 이미 걸려 있음 (409 SANCTION_ALREADY_ACTIVE) */
  readonly alreadyActive: boolean;
  readonly canApply: boolean;
  readonly canRelease: boolean;
  readonly submitting: boolean;
  /** 서버가 거절한 이유 */
  readonly errorMessage: string | null;
  readonly apply: (event?: FormEvent) => void;
  readonly release: (type: SanctionType) => void;
}

/**
 * 회원 상세의 제재 적용 / 해제 (API_SPEC 10.2 PATCH).
 * 성공하면 응답으로 받은 회원 상세를 onUpdated 로 넘겨 상태·제재 이력을 바로 갱신한다.
 */
export function useSanctionForm(
  member: MemberDetail,
  onUpdated: (member: MemberDetail) => void,
): SanctionFormState {
  const [type, setType] = useState<SanctionType>('write_ban');
  const [duration, setDuration] = useState<SanctionDays>('7');
  const [reason, setReasonRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setReason = useCallback(
    (value: string) => setReasonRaw(value.slice(0, memberDetailCopy.reasonMax)),
    [],
  );

  const blockedReason =
    member.status === 'withdrawn'
      ? memberDetailCopy.withdrawnBlocked
      : member.role === 'ADMIN'
        ? memberDetailCopy.adminProtected
        : null;
  const hasReason = reason.trim().length > 0;
  const alreadyActive = member.sanctions.some((s) => s.type === type);
  const canApply = hasReason && blockedReason === null && !alreadyActive && !submitting;
  const canRelease = hasReason && blockedReason === null && !submitting;

  const send = useCallback(
    async (target: SanctionType, change: { days: number | null } | 'release') => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        onUpdated(await updateUserSanction(member.id, target, change, reason.trim()));
        setReasonRaw('');
      } catch (error) {
        setErrorMessage(error instanceof ApiError ? error.message : ui.loadError);
      } finally {
        setSubmitting(false);
      }
    },
    [member.id, reason, onUpdated],
  );

  const apply = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (!canApply) return;
      void send(type, { days: toSanctionDays(duration) });
    },
    [canApply, send, type, duration],
  );

  const release = useCallback(
    (target: SanctionType) => {
      if (!canRelease) return;
      void send(target, 'release');
    },
    [canRelease, send],
  );

  return {
    type,
    setType,
    duration,
    setDuration,
    reason,
    setReason,
    blockedReason,
    alreadyActive,
    canApply,
    canRelease,
    submitting,
    errorMessage,
    apply,
    release,
  };
}
