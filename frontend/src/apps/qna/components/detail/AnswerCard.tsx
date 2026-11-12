import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  answerEditHistories,
  editHistoryLabels,
  questionDetailLabels as L,
} from '../../data/mockData';
import type { Answer } from '../../data/types';
import { useLoginGate } from '../../../../shared/LoginGate';
import { useVote } from '../../hooks/useVote';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { EditHistoryModal } from './EditHistoryModal';
import { routes } from '../../routes';

interface AnswerCardProps {
  readonly answer: Answer;
  readonly editTo: string;
  readonly reportTo: string;
  /** 프로필 답변 목록에서 이 답변을 보러 들어왔을 때 잠시 강조 */
  readonly highlighted?: boolean;
}

/** 최초 작성일과, 수정된 경우 수정일을 따로 보여 준다 (REQ-QNA-012). */
const AnswerDates: React.FC<{ readonly answer: Answer; readonly onOpenHistory: () => void }> = ({
  answer,
  onOpenHistory,
}) => (
  <div className="flex flex-wrap items-center justify-end gap-x-1.5 font-code-inline text-caption text-ink-subtle">
    <span>
      {answer.answeredAt}
      {L.answeredSuffix}
    </span>
    {answer.editedAt && (
      <>
        <span className="text-ink-tertiary">·</span>
        <button
          type="button"
          title={editHistoryLabels.openHint}
          onClick={onOpenHistory}
          className="text-ink-tertiary underline decoration-dotted underline-offset-2 hover:text-ink transition-colors"
        >
          {answer.editedAt}
          {L.editedSuffix}
        </button>
      </>
    )}
  </div>
);

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer: a,
  editTo,
  reportTo,
  highlighted = false,
}) => {
  const vote = useVote(a.votes);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { requireLogin, guardLink } = useLoginGate();

  return (
    <Card
      as="article"
      id={routes.answerAnchor(a.id)}
      className={`relative scroll-mt-28 p-space-md sm:p-space-lg flex flex-col space-y-space-md transition-shadow duration-700 ${
        highlighted ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
      } ${
        a.accepted
          ? "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-secondary before:rounded-t-xl"
          : ''
      }`}
    >
      {a.accepted ? (
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-semantic-success-surface border border-semantic-success-border text-secondary font-label-sm text-label-sm font-semibold">
              <Icon name="check_circle" className="text-[15px]" />
              <span>{L.acceptedBadge}</span>
            </span>
            <span className="text-caption font-caption text-ink-tertiary">{L.acceptedBy}</span>
          </div>
          <AnswerDates answer={a} onOpenHistory={() => setHistoryOpen(true)} />
        </div>
      ) : (
        <div className="flex justify-end">
          <AnswerDates answer={a} onOpenHistory={() => setHistoryOpen(true)} />
        </div>
      )}

      <div className="text-body-md font-body-md text-ink leading-relaxed space-y-3">
        {a.intro && <p>{a.intro}</p>}
        {a.points && (
          <div className="space-y-2 pl-3 border-l-2 border-primary-container/40">
            {a.points.map((pt) => (
              <p key={pt.heading}>
                <strong className="text-ink font-semibold">{pt.heading}</strong>
                <br />
                {pt.body}
              </p>
            ))}
          </div>
        )}
        {a.paragraphs.map((p) => (
          <p key={p.text} className={p.kind === 'muted' ? 'text-ink-muted' : ''}>
            {p.text}
          </p>
        ))}
        {a.tip && (
          <div className="p-3 bg-surface-2 rounded-lg border border-hairline font-body-sm text-body-sm text-ink-muted flex items-start gap-2">
            <Icon name="lightbulb" className="text-[18px] text-secondary mt-0.5" />
            <span>
              <strong>{L.tipLabel}</strong> {a.tip}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t border-hairline">
        <div className="flex items-center gap-space-xs">
          <Avatar
            initial={a.author.initial}
            size="md"
            tone={a.accepted ? 'secondary' : 'tertiary'}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-ink font-body-sm text-body-sm">
                {a.author.name}
              </span>
              <span className="px-1.5 py-px rounded bg-surface-2 border border-hairline font-code-inline text-[10px] text-ink-subtle">
                {a.author.level}
              </span>
            </div>
            <span className="font-caption text-[11px] text-ink-tertiary">{a.author.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {a.canEdit && (
            <>
              <Link
                to={editTo}
                className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-ink font-label-sm text-label-sm transition-colors"
              >
                {L.editAnswer}
              </Link>
              <button
                type="button"
                className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-semantic-danger transition-colors font-label-sm text-label-sm"
              >
                {L.deleteAnswer}
              </button>
              <div className="h-4 w-px bg-hairline" />
            </>
          )}
          {a.accepted ? (
            <div className="px-2.5 py-1 rounded bg-semantic-success-surface border border-semantic-success-border font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
              <Icon name="check" className="text-[14px]" />
              <span>{L.acceptedState}</span>
            </div>
          ) : (
            a.canAccept && (
              <button
                type="button"
                className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline font-label-sm text-label-sm text-ink-subtle hover:text-ink transition-colors flex items-center gap-1"
              >
                <span>{L.acceptAnswer}</span>
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => requireLogin() && vote.toggle()}
            aria-pressed={vote.voted}
            className={`flex items-center gap-1.5 px-space-sm py-1 rounded-lg border font-label-sm text-label-sm transition-colors ${
              a.accepted || vote.voted
                ? 'bg-primary-container/15 hover:bg-primary-container/25 border-primary-container/40 text-primary-hover'
                : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink'
            }`}
          >
            <Icon
              name="thumb_up"
              className={`text-[15px] ${a.accepted || vote.voted ? '' : 'text-ink-subtle'}`}
            />
            <span>{L.vote}</span>
            <span className="font-code-inline text-code-inline font-semibold">{vote.count}</span>
          </button>
          <Link
            to={reportTo}
            onClick={guardLink}
            title={L.reportAnswer}
            aria-label={L.reportAnswer}
            className="p-1 text-ink-tertiary hover:text-ink-subtle rounded transition-colors"
          >
            <Icon name="flag" className="text-[16px]" />
          </Link>
        </div>
      </div>
      {historyOpen && (
        // TODO: GET /api/answers/:answerId/edit-histories 연동
        <EditHistoryModal
          target={editHistoryLabels.answer}
          histories={answerEditHistories[a.id] ?? []}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </Card>
  );
};
