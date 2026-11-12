import { useCallback, useState, type FormEvent } from 'react';
import { sanctionTypeLabels } from '../data/mockData';
import { durationLabel, memberStatus } from '../sanction';
import type {
  ActiveSanction,
  Member,
  MemberStatus,
  SanctionDays,
  SanctionRecord,
  SanctionType,
} from '../types';

export interface SanctionFormState {
  readonly status: MemberStatus;
  readonly sanctions: readonly ActiveSanction[];
  readonly type: SanctionType;
  readonly setType: (value: SanctionType) => void;
  readonly duration: SanctionDays;
  readonly setDuration: (value: SanctionDays) => void;
  readonly reason: string;
  readonly setReason: (value: string) => void;
  readonly history: readonly SanctionRecord[];
  /** 관리자 계정은 제재할 수 없다 (403 CANNOT_SANCTION_ADMIN) */
  readonly protectedAccount: boolean;
  /** 같은 종류 제재가 이미 걸려 있음 (409 SANCTION_ALREADY_ACTIVE) */
  readonly alreadyActive: boolean;
  readonly canApply: boolean;
  readonly canRelease: boolean;
  readonly apply: (event?: FormEvent) => void;
  readonly release: (type: SanctionType) => void;
}

const OPERATOR = '운영자01';

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function releaseDate(days: SanctionDays): string | null {
  if (days === 'permanent') return null;
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** 회원 상세의 제재 적용 / 해제 (정지·글쓰기 제한·댓글 제한, 기간 또는 영구). */
export function useSanctionForm(
  member: Member,
  initialHistory: readonly SanctionRecord[],
): SanctionFormState {
  const [sanctions, setSanctions] = useState<readonly ActiveSanction[]>(member.sanctions);
  const [type, setType] = useState<SanctionType>('write_ban');
  const [duration, setDuration] = useState<SanctionDays>('7');
  const [reason, setReasonRaw] = useState('');
  const [history, setHistory] = useState<readonly SanctionRecord[]>(initialHistory);

  const setReason = useCallback((value: string) => setReasonRaw(value.slice(0, 200)), []);

  const hasReason = reason.trim().length > 0;
  const protectedAccount = member.role === 'ADMIN';
  const alreadyActive = sanctions.some((s) => s.type === type);
  const canApply = hasReason && !protectedAccount && !alreadyActive;
  const canRelease = hasReason;

  const record = useCallback(
    (entry: Omit<SanctionRecord, 'at' | 'admin' | 'reason'>) =>
      setHistory((prev) => [
        { at: nowStamp(), admin: OPERATOR, reason: reason.trim(), ...entry },
        ...prev,
      ]),
    [reason],
  );

  const apply = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (!canApply) return;
      // TODO: PATCH /api/admin/users/:userId { sanctions: { <type>: { days } }, reason }
      setSanctions((prev) => [...prev, { type, until: releaseDate(duration) }]);
      record({
        action: 'apply',
        type,
        label: `${sanctionTypeLabels[type]} ${durationLabel(duration)}`,
      });
      setReasonRaw('');
    },
    [canApply, type, duration, record],
  );

  const release = useCallback(
    (target: SanctionType) => {
      if (!canRelease) return;
      // TODO: PATCH /api/admin/users/:userId { sanctions: { <type>: null }, reason }
      setSanctions((prev) => prev.filter((s) => s.type !== target));
      record({ action: 'release', type: target, label: `${sanctionTypeLabels[target]} 해제` });
      setReasonRaw('');
    },
    [canRelease, record],
  );

  return {
    status: memberStatus(sanctions),
    sanctions,
    type,
    setType,
    duration,
    setDuration,
    reason,
    setReason,
    history,
    protectedAccount,
    alreadyActive,
    canApply,
    canRelease,
    apply,
    release,
  };
}
