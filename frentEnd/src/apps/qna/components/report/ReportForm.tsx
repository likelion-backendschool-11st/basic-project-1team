import React, { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { reportPage as R, reportReasons } from '../../data/mockData';
import { useAttachments } from '../../hooks/useAttachments';
import { useMarkdownEditor } from '../../hooks/useMarkdownEditor';
import { useReportForm } from '../../hooks/useReportForm';
import { Icon } from '../common/Icon';
import { HiddenFileInput } from '../editor/HiddenFileInput';
import { ModerationStatsCard } from '../sidebar/ModerationStatsCard';
import { ReportGuideCard } from '../sidebar/ReportGuideCard';
import { ReasonSelector } from './ReasonSelector';
import { ReportDetailSection } from './ReportDetailSection';
import { ReportTargetCard } from './ReportTargetCard';

interface ReportFormProps {
  readonly questionTo: string;
  readonly onSubmit: (reasonLabel: string) => void;
  readonly onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ questionTo, onSubmit, onCancel }) => {
  const form = useReportForm(reportReasons);
  const detail = useMarkdownEditor();
  const evidence = useAttachments([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form.reasonLabel);
  };

  return (
    <div className="max-w-[1280px] w-full mx-auto py-8">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-hairline">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-ink-subtle">
          <Link to={questionTo} className="hover:text-ink transition-colors flex items-center gap-1">
            <Icon name="arrow_back" className="text-[16px]" />
            <span>{R.back}</span>
          </Link>
          <span className="text-ink-tertiary">/</span>
          <span className="font-code-inline text-code-inline text-ink-tertiary">{R.targetCode}</span>
          <span className="text-ink-tertiary">/</span>
          <span className="text-semantic-danger font-medium flex items-center gap-1">
            <Icon name="flag" className="text-[14px]" />
            <span>{R.crumb}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 flex flex-col gap-6">
          <ReportTargetCard />
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <ReasonSelector reasons={reportReasons} value={form.reason} onChange={form.setReason} />
            <ReportDetailSection
              value={detail.value}
              onChange={detail.setValue}
              textareaRef={detail.ref}
              onCommand={detail.applyFormat}
              onPickFiles={evidence.openPicker}
            />
            <HiddenFileInput inputRef={evidence.inputRef} onChange={evidence.onFilesSelected} accept="image/png,image/jpeg,image/webp" />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded bg-surface-1 border border-hairline text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors font-label-md text-label-md flex items-center gap-1.5"
              >
                {R.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded bg-semantic-danger text-ink font-label-md text-label-md hover:bg-semantic-danger/90 active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm font-semibold"
              >
                <Icon name="report_problem" className="text-[18px]" />
                <span>{R.submit}</span>
              </button>
            </div>
          </form>
        </section>
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <ReportGuideCard />
          <ModerationStatsCard />
        </aside>
      </div>
    </div>
  );
};

export default ReportForm;
