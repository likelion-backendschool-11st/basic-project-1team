import React from 'react';
import { editQuestionPage as P, newQuestionPage } from '../../data/mockData';
import { Card } from '../common/Card';

interface EditTitleCardProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
}

export const EditTitleCard: React.FC<EditTitleCardProps> = ({ value, onChange }) => (
  <Card as="section" bordered={false} className="p-space-md flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <label className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1" htmlFor="question-title">
        {P.titleLabel} <span className="text-semantic-danger">*</span>
      </label>
      <span className="font-code-inline text-code-inline text-ink-tertiary">
        <span className="text-ink">{value.length}</span> / {newQuestionPage.titleMax}자
      </span>
    </div>
    <input
      id="question-title"
      type="text"
      maxLength={newQuestionPage.titleMax}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={P.titlePlaceholder}
      className="w-full bg-surface-2 text-ink font-body-lg text-body-lg px-space-sm py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-focus placeholder:text-ink-tertiary transition-colors"
    />
  </Card>
);

export default EditTitleCard;
