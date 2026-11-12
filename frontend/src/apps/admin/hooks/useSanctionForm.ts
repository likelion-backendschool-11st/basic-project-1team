import { useCallback, useState, type FormEvent } from 'react';
import type { Member, MemberStatus, SanctionRecord } from '../types';

export type SuspensionDays = '3' | '7' | '30';

export interface SanctionFormState {
  readonly status: MemberStatus;
  readonly suspendedUntil?: string;
  readonly duration: SuspensionDays;
  readonly setDuration: (value: SuspensionDays) => void;
  readonly reason: string;
  readonly setReason: (value: string) => void;
  readonly history: readonly SanctionRecord[];
  readonly canSuspend: boolean;
  readonly canUnsuspend: boolean;
  readonly suspend: (event?: FormEvent) => void;
  readonly unsuspend: () => void;
}

const OPERATOR = '운영자01';

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function releaseDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** Suspend / unsuspend flow on the member detail screen. */
export function useSanctionForm(member: Member, initialHistory: readonly SanctionRecord[]): SanctionFormState {
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [suspendedUntil, setSuspendedUntil] = useState<string | undefined>(member.suspendedUntil);
  const [duration, setDuration] = useState<SuspensionDays>('7');
  const [reason, setReasonRaw] = useState('');
  const [history, setHistory] = useState<readonly SanctionRecord[]>(initialHistory);

  const setReason = useCallback((value: string) => setReasonRaw(value.slice(0, 200)), []);

  const hasReason = reason.trim().length > 0;
  const canSuspend = status === 'active' && hasReason;
  const canUnsuspend = status === 'suspended' && hasReason;

  const suspend = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (!canSuspend) return;
      setStatus('suspended');
      setSuspendedUntil(releaseDate(Number(duration)));
      setHistory((prev) => [
        { at: nowStamp(), admin: OPERATOR, kind: 'suspend', label: `${duration}일 정지`, reason: reason.trim() },
        ...prev,
      ]);
      setReasonRaw('');
    },
    [canSuspend, duration, reason],
  );

  const unsuspend = useCallback(() => {
    if (!canUnsuspend) return;
    setStatus('active');
    setSuspendedUntil(undefined);
    setHistory((prev) => [{ at: nowStamp(), admin: OPERATOR, kind: 'unsuspend', label: '해제', reason: reason.trim() }, ...prev]);
    setReasonRaw('');
  }, [canUnsuspend, reason]);

  return {
    status,
    suspendedUntil,
    duration,
    setDuration,
    reason,
    setReason,
    history,
    canSuspend,
    canUnsuspend,
    suspend,
    unsuspend,
  };
}
