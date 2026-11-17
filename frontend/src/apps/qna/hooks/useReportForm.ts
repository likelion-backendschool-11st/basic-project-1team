import { useState } from 'react';
import type { ReportReason, ReportReasonValue } from '../data/types';

export function useReportForm(reasons: readonly ReportReason[]) {
  const [reason, setReason] = useState<ReportReasonValue>(reasons[0]?.value ?? 'spam');
  const reasonLabel = reasons.find((r) => r.value === reason)?.label ?? '';
  return {
    reason,
    // 선택지는 reportReasons(API_SPEC 8장 Enum) 의 값만 온다
    setReason: (value: string) => setReason(value as ReportReasonValue),
    reasonLabel,
  } as const;
}
