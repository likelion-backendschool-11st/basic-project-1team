import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { useSiteNavigate } from '../../../shared/layout/siteRouting';
import { cancelReport } from '../api/reports';
import { reportComplete as C } from '../data/mockData';
import { useReportTarget } from '../hooks/useReportTarget';
import { ReportCompleteModal } from '../components/report/ReportCompleteModal';
import { ReportForm } from '../components/report/ReportForm';
import { ReportToast } from '../components/report/ReportToast';
import type { ReportNavState } from './ReportPage';

interface ReportCompletePageProps {
  readonly className?: string;
}

const noop = () => undefined;

export const ReportCompletePage: React.FC<ReportCompletePageProps> = ({ className = '' }) => {
  const context = useReportTarget();
  const goSite = useSiteNavigate();
  const navigate = useNavigate();
  const state = useLocation().state as ReportNavState | null;
  const [canceling, setCanceling] = useState(false);

  // 접수 정보는 신고 화면에서만 넘어온다. 새로고침 등으로 없으면 신고 화면으로 돌려보낸다
  if (!state?.receipt) return <Navigate to={context.reportPath} replace />;
  const { receipt, reasonLabel } = state;

  const undo = async () => {
    if (canceling) return;
    setCanceling(true);
    try {
      await cancelReport(receipt.id);
      window.alert(C.toastUndoAlert);
      navigate(context.reportPath);
    } catch (error) {
      // 10초가 지났으면 409 REPORT_CANCEL_EXPIRED 메시지를 안내한다
      window.alert(getErrorMessage(error));
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div
      className={`flex flex-col w-full relative min-h-[calc(100vh-3.5rem)] select-none ${className}`}
    >
      {/* 접수한 신고 양식을 흐리게 뒤에 둔다 */}
      {context.target && (
        <div aria-hidden="true" className="filter blur-[2px] opacity-40 pointer-events-none">
          <ReportForm context={context} target={context.target} onSubmit={noop} onCancel={noop} />
        </div>
      )}
      <div className="fixed inset-0 z-40 bg-canvas/75 backdrop-blur-[6px]" />
      <ReportToast receipt={receipt} onUndo={() => void undo()} />
      {context.target && (
        <ReportCompleteModal
          receipt={receipt}
          reasonLabel={reasonLabel}
          target={context.target}
          confirmLabel={context.listLabel}
          onClose={() => goSite(context.backHref)}
          onConfirm={() => goSite(context.listHref)}
        />
      )}
    </div>
  );
};
