import React from 'react';
import { newQuestionPage as P } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface NewSubmitBarProps {
  readonly onCancel: () => void;
  readonly onDraft: () => void;
  readonly draftSaved: boolean;
  readonly onSubmit: () => void;
  readonly submitting: boolean;
}

export const NewSubmitBar: React.FC<NewSubmitBarProps> = ({
  onCancel,
  onDraft,
  draftSaved,
  onSubmit,
  submitting,
}) => (
  <Card
    as="section"
    bordered={false}
    className="p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md"
  >
    <div className="flex items-center gap-space-xs text-ink-tertiary font-caption text-caption w-full sm:w-auto">
      <Icon name="verified_user" className="text-[18px] text-ink-subtle" />
      <span>{P.guideline}</span>
    </div>
    <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-subtle hover:text-ink font-label-md text-label-md transition-colors"
      >
        {P.cancel}
      </button>
      <button
        type="button"
        onClick={onDraft}
        className="px-4 py-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-ink font-label-md text-label-md transition-colors flex items-center gap-1"
      >
        <Icon
          name={draftSaved ? 'check' : 'save'}
          className={`text-[16px] ${draftSaved ? 'text-secondary' : ''}`}
        />
        {draftSaved ? P.draftSaved : P.draft}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary-hover active:bg-primary-focus text-on-primary font-label-md text-label-md font-medium shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-80"
      >
        <Icon
          name={submitting ? 'progress_activity' : 'send'}
          className={`text-[18px] ${submitting ? 'animate-spin' : ''}`}
        />
        {submitting ? P.submitting : P.submit}
      </button>
    </div>
  </Card>
);
