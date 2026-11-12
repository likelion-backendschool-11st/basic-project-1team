import { useState } from 'react';
import type { ReportReason } from '../data/types';

export function useReportForm(reasons: readonly ReportReason[]) {
  const [reason, setReason] = useState(reasons[0]?.value ?? '');
  const reasonLabel = reasons.find((r) => r.value === reason)?.label ?? '';
  return { reason, setReason, reasonLabel } as const;
}
