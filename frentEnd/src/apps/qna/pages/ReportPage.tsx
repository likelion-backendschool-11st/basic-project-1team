import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportForm } from '../components/report/ReportForm';
import { routes } from '../routes';

interface ReportPageProps {
  readonly className?: string;
}

export interface ReportNavState {
  readonly reasonLabel: string;
}

export const ReportPage: React.FC<ReportPageProps> = ({ className = '' }) => {
  const { id = '1' } = useParams();
  const navigate = useNavigate();
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <ReportForm
        questionTo={routes.question(id)}
        onCancel={() => navigate(routes.question(id))}
        onSubmit={(reasonLabel) => navigate(routes.reportComplete(id), { state: { reasonLabel } satisfies ReportNavState })}
      />
    </div>
  );
};

export default ReportPage;
