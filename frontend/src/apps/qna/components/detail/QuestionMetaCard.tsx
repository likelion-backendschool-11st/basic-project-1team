import React from 'react';
import { questionMeta as M } from '../../data/mockData';
import type { MetaRow, Question } from '../../data/types';
import { formatCount, questionStatusLabel } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface QuestionMetaCardProps {
  readonly question: Question;
}

const valueClass = (tone: MetaRow['tone']) => {
  switch (tone) {
    case 'success-badge':
      return 'px-2 py-0.5 rounded bg-semantic-success-surface border border-semantic-success-border font-label-sm text-secondary font-semibold';
    case 'primary':
      return 'font-code-inline text-code-inline text-primary-hover font-semibold';
    default:
      return 'font-code-inline text-code-inline text-ink';
  }
};

export const QuestionMetaCard: React.FC<QuestionMetaCardProps> = ({ question: q }) => {
  const rows: readonly MetaRow[] = [
    {
      label: M.statusLabel,
      value: questionStatusLabel(q),
      tone: q.isAccepted ? 'success-badge' : 'primary',
    },
    { label: M.answersLabel, value: M.answers(formatCount(q.answerCount)), tone: 'code' },
    { label: M.viewsLabel, value: M.views(formatCount(q.viewCount)), tone: 'code' },
  ];

  return (
    <Card className="p-space-md space-y-space-sm">
      <h3 className="font-headline-sm text-headline-sm text-ink font-semibold flex items-center gap-2">
        <Icon name="info" className="text-primary text-[18px]" />
        <span>{M.title}</span>
      </h3>
      <div className="space-y-2 text-body-sm font-body-sm">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between items-center py-1 text-ink-subtle ${i < rows.length - 1 ? 'border-b border-hairline' : ''}`}
          >
            <span>{row.label}</span>
            <span className={valueClass(row.tone)}>{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
