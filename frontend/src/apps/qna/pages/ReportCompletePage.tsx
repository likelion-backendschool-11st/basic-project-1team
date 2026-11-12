import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteNavigate } from '../../../shared/layout/moduleBase';
import { reportComplete as C, reportReasons } from '../data/mockData';
import { ReportCompleteModal } from '../components/report/ReportCompleteModal';
import { ReportForm } from '../components/report/ReportForm';
import { ReportToast } from '../components/report/ReportToast';
import { useReportTarget } from '../hooks/useReportTarget';
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
  const reasonLabel = state?.reasonLabel ?? reportReasons[0].label;

  return (
    <div
      className={`flex flex-col w-full relative min-h-[calc(100vh-3.5rem)] select-none ${className}`}
    >
      {/* The submitted report form stays visible behind the scrim, softly dimmed */}
      <div aria-hidden="true" className="filter blur-[2px] opacity-40 pointer-events-none">
        <ReportForm context={context} onSubmit={noop} onCancel={noop} />
      </div>
      <div className="fixed inset-0 z-40 bg-canvas/75 backdrop-blur-[6px]" />
      <ReportToast
        onUndo={() => {
          window.alert(C.toastUndoAlert);
          navigate(context.reportPath);
        }}
      />
      <ReportCompleteModal
        reasonLabel={reasonLabel}
        target={context.target}
        confirmLabel={context.listLabel}
        onClose={() => goSite(context.backHref)}
        onConfirm={() => goSite(context.listHref)}
      />
    </div>
  );
};
