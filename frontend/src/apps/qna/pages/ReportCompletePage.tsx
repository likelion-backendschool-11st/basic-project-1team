import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { reportComplete as C, reportReasons } from '../data/mockData';
import { ReportCompleteModal } from '../components/report/ReportCompleteModal';
import { ReportForm } from '../components/report/ReportForm';
import { ReportToast } from '../components/report/ReportToast';
import { routes } from '../routes';
import type { ReportNavState } from './ReportPage';

interface ReportCompletePageProps {
  readonly className?: string;
}

const noop = () => undefined;

export const ReportCompletePage: React.FC<ReportCompletePageProps> = ({ className = '' }) => {
  const { id = '1' } = useParams();
  const navigate = useNavigate();
  const state = useLocation().state as ReportNavState | null;
  const reasonLabel = state?.reasonLabel ?? reportReasons[0].label;

  return (
    <div className={`flex flex-col w-full relative min-h-[calc(100vh-3.5rem)] select-none ${className}`}>
      {/* The submitted report form stays visible behind the scrim, softly dimmed */}
      <div aria-hidden="true" className="filter blur-[2px] opacity-40 pointer-events-none">
        <ReportForm questionTo={routes.question(id)} onSubmit={noop} onCancel={noop} />
      </div>
      <div className="fixed inset-0 z-40 bg-canvas/75 backdrop-blur-[6px]" />
      <ReportToast
        onUndo={() => {
          window.alert(C.toastUndoAlert);
          navigate(routes.report(id));
        }}
      />
      <ReportCompleteModal
        reasonLabel={reasonLabel}
        onClose={() => navigate(routes.question(id))}
        onHistory={() => window.alert(C.historyAlert)}
        onConfirm={() => navigate(routes.questions())}
      />
    </div>
  );
};
