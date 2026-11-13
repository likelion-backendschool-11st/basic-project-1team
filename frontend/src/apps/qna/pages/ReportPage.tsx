import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteNavigate } from '../../../shared/layout/siteRouting';
import { reportPage as R } from '../data/mockData';
import type { ReportReceipt } from '../data/types';
import { useReportSubmit } from '../hooks/useReportSubmit';
import { useReportTarget } from '../hooks/useReportTarget';
import { ReportForm } from '../components/report/ReportForm';

interface ReportPageProps {
  readonly className?: string;
}

/** 신고 완료 화면으로 넘기는 값 */
export interface ReportNavState {
  readonly reasonLabel: string;
  readonly receipt: ReportReceipt;
}

/** 신고 화면. 질문·답변·게시글·댓글 모두 같은 화면을 쓴다 (API_SPEC 8장) */
export const ReportPage: React.FC<ReportPageProps> = ({ className = '' }) => {
  const context = useReportTarget();
  const navigate = useNavigate();
  const goSite = useSiteNavigate();
  const report = useReportSubmit(context.type, context.targetId, (receipt, reasonLabel) =>
    navigate(context.completePath, { state: { reasonLabel, receipt } satisfies ReportNavState }),
  );

  if (!context.target) {
    return (
      <div className={`flex flex-col items-center gap-space-md w-full py-space-2xl ${className}`}>
        <p className="font-body-md text-body-md text-ink-subtle">
          {context.loading ? R.loading : R.notFound}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${className}`}>
      <ReportForm
        context={context}
        target={context.target}
        submitting={report.pending}
        onCancel={() => goSite(context.backHref)}
        onSubmit={(input) => void report.submit(input)}
      />
    </div>
  );
};
