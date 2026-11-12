import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteNavigate } from '../../../shared/layout/moduleBase';
import { ReportForm } from '../components/report/ReportForm';
import { useReportTarget } from '../hooks/useReportTarget';

interface ReportPageProps {
  readonly className?: string;
}

export interface ReportNavState {
  readonly reasonLabel: string;
}

/** 신고 화면. 질문·답변·게시글·댓글 모두 같은 화면을 쓴다 (API_SPEC 8장) */
export const ReportPage: React.FC<ReportPageProps> = ({ className = '' }) => {
  const context = useReportTarget();
  const navigate = useNavigate();
  const goSite = useSiteNavigate();
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <ReportForm
        context={context}
        onCancel={() => goSite(context.backHref)}
        onSubmit={(reasonLabel) =>
          // TODO: POST /api/reports { targetType, targetId, reason, detail, attachmentIds }
          navigate(context.completePath, { state: { reasonLabel } satisfies ReportNavState })
        }
      />
    </div>
  );
};
