import React from 'react';
import { newQuestionPage as P } from '../../data/mockData';
import { Card } from '../common/Card';
import { NumberBadge } from '../common/NumberBadge';

interface NewTitleCardProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
}

export const NewTitleCard: React.FC<NewTitleCardProps> = ({ value, onChange }) => (
  <Card as="section" bordered={false} className="p-space-lg">
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-space-xs font-label-md text-label-md text-ink" htmlFor="question-title">
          <NumberBadge index={1} />
          {P.titleLabel} <span className="text-semantic-danger text-[12px]">*</span>
        </label>
        <span className={`font-code-inline text-code-inline ${value.length >= 95 ? 'text-semantic-danger' : 'text-ink-tertiary'}`}>
          {value.length} / {P.titleMax}자
        </span>
      </div>
      <input
        id="question-title"
        type="text"
        maxLength={P.titleMax}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={P.titlePlaceholder}
        className="w-full h-11 px-space-md bg-surface-2 text-ink placeholder:text-ink-tertiary font-body-md text-body-md rounded-lg focus:outline-none focus:bg-surface-3 transition-colors"
      />
      <p className="font-caption text-caption text-ink-tertiary">
        {P.titleHelpPrefix}
        <strong>{P.titleHelpStrong}</strong>
        {P.titleHelpSuffix}
      </p>
    </div>
  </Card>
);
