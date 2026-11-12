import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuestionSummary } from '../../data/types';
import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';
import { AnswerCountBadge } from './AnswerCountBadge';

interface QuestionRowProps {
  readonly question: QuestionSummary;
  readonly to: string;
}

export const QuestionRow: React.FC<QuestionRowProps> = ({ question: q, to }) => {
  const navigate = useNavigate();
  return (
    <tr
      onClick={() => navigate(to)}
      className={`group hover:bg-surface-2/70 transition-colors duration-100 cursor-pointer ${q.accepted ? 'bg-semantic-success-surface/20' : ''}`}
    >
      <td className="py-3 px-4 text-center font-code-inline text-code-inline text-ink-tertiary">{q.id}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {q.accepted && (
            <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-semantic-success text-on-primary">
              <Icon name="done" className="text-[12px]" />
            </span>
          )}
          <span className="font-body-md text-body-md text-ink group-hover:text-primary transition-colors font-medium group-hover:underline leading-tight">
            {q.title}
          </span>
          {q.badge && (
            <span
              className={`px-1.5 py-px rounded font-code-inline text-[10px] border ${
                q.badge.tone === 'hot'
                  ? 'bg-tertiary-container/30 text-tertiary border-tertiary/20'
                  : 'bg-surface-2 text-ink-tertiary border-hairline'
              }`}
            >
              {q.badge.label}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <TagChip label={q.tag} hash={false} variant="table" />
      </td>
      <td className="py-3 px-4 text-center">
        <AnswerCountBadge count={q.answers} accepted={q.accepted} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <Avatar initial={q.author.charAt(0)} />
          <span className="font-body-sm text-body-sm text-ink-muted">{q.author}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center font-code-inline text-caption text-ink-tertiary">{q.date}</td>
      <td className="py-3 px-4 text-right font-code-inline text-caption text-ink-subtle">{q.views}</td>
    </tr>
  );
};
