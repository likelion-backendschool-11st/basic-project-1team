import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RichTextView } from '../../../../shared/editor/RichTextView';
import { ProfileLink } from '../../../../shared/layout/ProfileLink';
import { useLoginGate } from '../../../../shared/LoginGate';
import { getAnswerEditHistories } from '../../api/answers';
import { editHistoryLabels, questionDetailLabels as L } from '../../data/mockData';
import type { Answer } from '../../data/types';
import { formatDateTime } from '../../display';
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
  /** 삭제. 채택된 답변은 삭제할 수 없어 버튼을 보여 주지 않는다 */
  readonly onDelete: () => void;
  /** 채택. canAccept 일 때만 버튼을 보여 준다 */
  readonly onAccept: () => void;
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
      {formatDateTime(answer.createdAt)}
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
          {formatDateTime(answer.editedAt)}
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
  onDelete,
  onAccept,
  highlighted = false,
}) => {
  const vote = useVote(a);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { requireLogin, guardLink } = useLoginGate();

  return (
    <Card
      as="article"
      id={routes.answerAnchor(a.id)}
      className={`relative scroll-mt-28 p-space-md sm:p-space-lg flex flex-col space-y-space-md transition-shadow duration-700 ${
        highlighted ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
      } ${
        a.isAccepted
          ? "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-secondary before:rounded-t-xl"
          : ''
      }`}
    >
      {a.isAccepted ? (
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

      <RichTextView html={a.body} className="text-body-md font-body-md text-ink leading-relaxed" />

      <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t border-hairline">
        <div className="flex items-center gap-space-xs">
          <Avatar
            initial={a.author.nickname.charAt(0)}
            size="md"
            tone={a.isAccepted ? 'secondary' : 'tertiary'}
          />
          <ProfileLink
            userId={a.author.id}
            className="font-medium text-ink font-body-sm text-body-sm"
          >
            {a.author.nickname}
          </ProfileLink>
        </div>

        <div className="flex items-center gap-2">
          {/* 채택된 답변은 수정·삭제할 수 없다 (REQ-QNA-012, 409 ANSWER_ALREADY_ACCEPTED) */}
          {a.isMine && !a.isAccepted && (
            <>
              <Link
                to={editTo}
                className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-ink font-label-sm text-label-sm transition-colors"
              >
                {L.editAnswer}
              </Link>
              <button
                type="button"
                onClick={onDelete}
                className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-semantic-danger transition-colors font-label-sm text-label-sm"
              >
                {L.deleteAnswer}
              </button>
              <div className="h-4 w-px bg-hairline" />
            </>
          )}
          {a.isAccepted ? (
            <div className="px-2.5 py-1 rounded bg-semantic-success-surface border border-semantic-success-border font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
              <Icon name="check" className="text-[14px]" />
              <span>{L.acceptedState}</span>
            </div>
          ) : (
            a.canAccept && (
              <button
                type="button"
                onClick={onAccept}
                className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline font-label-sm text-label-sm text-ink-subtle hover:text-ink transition-colors flex items-center gap-1"
              >
                <span>{L.acceptAnswer}</span>
              </button>
            )
          )}
          {/* 본인 답변은 추천할 수 없다 (API_SPEC 4장, 400 CANNOT_VOTE_OWN_ANSWER) */}
          <button
            type="button"
            onClick={() => {
              if (requireLogin()) void vote.toggle();
            }}
            disabled={a.isMine || vote.pending}
            aria-pressed={vote.voted}
            className={`flex items-center gap-1.5 px-space-sm py-1 rounded-lg border font-label-sm text-label-sm transition-colors disabled:cursor-default disabled:opacity-70 ${
              a.isAccepted || vote.voted
                ? 'bg-primary-container/15 hover:bg-primary-container/25 border-primary-container/40 text-primary-hover'
                : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink'
            }`}
          >
            <Icon
              name="thumb_up"
              className={`text-[15px] ${a.isAccepted || vote.voted ? '' : 'text-ink-subtle'}`}
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
        <EditHistoryModal
          target={editHistoryLabels.answer}
          load={() => getAnswerEditHistories(a.id)}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </Card>
  );
};
