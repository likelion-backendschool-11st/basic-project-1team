import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileLink } from '../../../../shared/layout/ProfileLink';
import type { QuestionListItem } from '../../data/types';
import { formatCount, formatDate, isHotQuestion } from '../../display';
import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';
import { AnswerCountBadge } from './AnswerCountBadge';

interface QuestionRowProps {
  readonly question: QuestionListItem;
  readonly to: string;
}

export const QuestionRow: React.FC<QuestionRowProps> = ({ question: q, to }) => {
  const navigate = useNavigate();
  return (
    <tr
      onClick={() => navigate(to)}
      className={`group hover:bg-surface-2/70 transition-colors duration-100 cursor-pointer ${q.isAccepted ? 'bg-semantic-success-surface/20' : ''}`}
    >
      <td className="py-3 px-4 text-center font-code-inline text-code-inline text-ink-tertiary">
        {q.id}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {q.isAccepted && (
            <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-semantic-success text-on-primary">
              <Icon name="done" className="text-[12px]" />
            </span>
          )}
          <span className="font-body-md text-body-md text-ink group-hover:text-primary transition-colors font-medium group-hover:underline leading-tight">
            {q.title}
          </span>
          {isHotQuestion(q.viewCount) && (
            <span className="px-1.5 py-px rounded font-code-inline text-[10px] border bg-tertiary-container/30 text-tertiary border-tertiary/20">
              HOT
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        {q.tags[0] && <TagChip label={q.tags[0]} hash={false} variant="table" />}
      </td>
      <td className="py-3 px-4 text-center">
        <AnswerCountBadge count={q.answerCount} accepted={q.isAccepted} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <Avatar initial={q.author.nickname.charAt(0)} />
          <ProfileLink
            userId={q.author.id}
            className="whitespace-nowrap font-body-sm text-body-sm text-ink-muted"
          >
            {q.author.nickname}
          </ProfileLink>
        </div>
      </td>
      <td className="py-3 px-4 text-center font-code-inline text-caption text-ink-tertiary">
        {formatDate(q.createdAt)}
      </td>
      <td className="py-3 px-4 text-right font-code-inline text-caption text-ink-subtle">
        {formatCount(q.viewCount)}
      </td>
    </tr>
  );
};
