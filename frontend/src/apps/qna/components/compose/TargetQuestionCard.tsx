import React from 'react';
import { Link } from 'react-router-dom';
import { htmlToText } from '../../../../shared/editor/richText';
import { editAnswerPage } from '../../data/mockData';
import type { Question } from '../../data/types';
import { formatCount, formatDate } from '../../display';
import { useToggle } from '../../hooks/useToggle';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';

interface TargetQuestionCardProps {
  /** 이 답변이 달린 질문 */
  readonly question: Question;
  readonly questionTo: string;
}

const T = editAnswerPage.target;

export const TargetQuestionCard: React.FC<TargetQuestionCardProps> = ({
  question: q,
  questionTo,
}) => {
  const collapsed = useToggle(false);
  return (
    <Card
      as="section"
      className="p-space-md relative overflow-hidden transition-all duration-200 hover:border-hairline-strong"
    >
      <div className="flex items-start justify-between gap-space-sm mb-space-xs">
        <div className="flex items-center gap-2 font-caption text-caption text-ink-tertiary">
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          <span className="uppercase tracking-wider font-code-inline text-[11px] text-ink-muted">
            {T.label}
          </span>
          <span className="text-hairline-strong">•</span>
          <span className="font-code-inline text-ink-tertiary">{T.qid(q.id)}</span>
        </div>
        <button
          type="button"
          onClick={collapsed.toggle}
          aria-expanded={!collapsed.on}
          className="inline-flex items-center gap-1 font-caption text-caption text-ink-subtle hover:text-ink bg-surface-2 hover:bg-surface-3 px-2.5 py-1 rounded border border-hairline transition-colors"
        >
          <span>{collapsed.on ? T.expand : T.collapse}</span>
          <Icon name={collapsed.on ? 'expand_more' : 'expand_less'} className="text-[16px]" />
        </button>
      </div>
      <Link
        to={questionTo}
        className="block font-headline-md text-headline-md text-ink font-semibold tracking-tight hover:text-primary transition-colors"
      >
        {q.title}
      </Link>
      <div className="flex flex-wrap items-center gap-1.5 mt-space-xs mb-space-sm">
        {q.tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </div>
      {!collapsed.on && (
        <div>
          <div className="p-space-sm rounded-lg bg-surface-2/60 border border-hairline font-body-sm text-body-sm text-ink-subtle leading-relaxed">
            <p className="line-clamp-4">{htmlToText(q.body)}</p>
          </div>
          <div className="mt-space-sm pt-space-xs border-t border-hairline flex flex-wrap items-center justify-between gap-space-sm font-caption text-caption text-ink-tertiary">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1.5">
                <Avatar initial={q.author.nickname.charAt(0)} tone="ink" />
                <span className="text-ink font-medium">{q.author.nickname}</span>
              </div>
              <span>•</span>
              <time dateTime={q.createdAt}>{T.postedAt(formatDate(q.createdAt))}</time>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon name="visibility" className="text-[14px]" />
                {T.views(formatCount(q.viewCount))}
              </span>
            </div>
            <Link
              to={questionTo}
              target="_blank"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-label-md text-label-md transition-colors"
            >
              {T.openOriginal}
              <Icon name="open_in_new" className="text-[14px]" />
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
};
