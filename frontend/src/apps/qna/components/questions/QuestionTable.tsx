import React from 'react';
import { questionListPage } from '../../data/mockData';
import type { QuestionSummary } from '../../data/types';
import { QuestionMobileCard } from './QuestionMobileCard';
import { QuestionRow } from './QuestionRow';

interface QuestionTableProps {
  readonly questions: readonly QuestionSummary[];
  readonly linkFor: (q: QuestionSummary) => string;
  readonly emptyMessage: string;
}

const headClasses = [
  'py-3 px-4 w-14 text-center font-code-inline',
  'py-3 px-4',
  'py-3 px-3 w-36',
  'py-3 px-4 w-28 text-center',
  'py-3 px-4 w-28',
  'py-3 px-4 w-28 text-center',
  'py-3 px-4 w-20 text-right',
];

export const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  linkFor,
  emptyMessage,
}) => (
  <div className="w-full rounded-xl bg-surface-1 border border-hairline overflow-hidden shadow-sm">
    <div className="hidden md:block w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[760px] lg:min-w-full">
        <thead>
          <tr className="bg-surface-container-lowest/80 border-b border-hairline font-label-sm text-label-sm text-ink-subtle tracking-wide">
            {questionListPage.columns.map((col, i) => (
              <th key={col} scope="col" className={headClasses[i]}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {questions.map((q) => (
            <QuestionRow key={q.id} question={q} to={linkFor(q)} />
          ))}
        </tbody>
      </table>
    </div>
    <div className="md:hidden flex flex-col divide-y divide-hairline">
      {questions.map((q) => (
        <QuestionMobileCard key={q.id} question={q} to={linkFor(q)} />
      ))}
    </div>
    {questions.length === 0 && (
      <p className="py-space-xl text-center font-body-sm text-body-sm text-ink-tertiary">
        {emptyMessage}
      </p>
    )}
  </div>
);
