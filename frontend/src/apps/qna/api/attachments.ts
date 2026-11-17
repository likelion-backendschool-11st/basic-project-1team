import { apiRequest } from '../../../shared/api';
import type { UploadedAttachment } from '../data/types';

/** POST /api/attachments (API_SPEC 6장). 신고 증빙: PNG·JPG·WEBP, 최대 10MB */
export function uploadReportEvidence(file: File): Promise<UploadedAttachment> {
  const form = new FormData();
  form.append('purpose', 'report_evidence');
  form.append('file', file);
  return apiRequest<UploadedAttachment>('/attachments', { method: 'POST', body: form });
}
