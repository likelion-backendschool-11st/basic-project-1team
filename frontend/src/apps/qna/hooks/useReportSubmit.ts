import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api';
import { uploadReportEvidence } from '../api/attachments';
import { createReport } from '../api/reports';
import type { ReportReasonValue, ReportReceipt, ReportTargetType } from '../data/types';

/** 신고 폼에서 접수할 값 */
export interface ReportFormInput {
  readonly reason: ReportReasonValue;
  readonly reasonLabel: string;
  readonly detail: string;
  /** 고른 증빙 이미지. 접수할 때 올린다 */
  readonly files: readonly File[];
}

/**
 * 신고 접수: 증빙 이미지를 순서대로 올린 뒤 POST /api/reports 에 그 id 를 넣는다 (API_SPEC 6·8장).
 * 신고가 실패하면 이미 올린 증빙은 어떤 신고에도 연결되지 않아 정리 작업이 지운다.
 */
export function useReportSubmit(
  targetType: ReportTargetType,
  targetId: string,
  onDone: (receipt: ReportReceipt, reasonLabel: string) => void,
) {
  const [pending, setPending] = useState(false);

  const submit = async (input: ReportFormInput) => {
    if (pending) return;
    setPending(true);
    try {
      const attachmentIds: number[] = [];
      for (const file of input.files) {
        attachmentIds.push((await uploadReportEvidence(file)).id);
      }
      const receipt = await createReport({
        targetType,
        targetId: Number(targetId),
        reason: input.reason,
        detail: input.detail.trim() || undefined,
        attachmentIds,
      });
      setPending(false);
      onDone(receipt, input.reasonLabel);
    } catch (error) {
      setPending(false);
      window.alert(getErrorMessage(error));
    }
  };

  return { pending, submit };
}
