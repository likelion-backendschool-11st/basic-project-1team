import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { editHistoryLabels, questionDetail as Q, questionDetailLabels as L, questionEditHistories } from '../../data/mockData';
import { useLoginGate } from '../../../../shared/LoginGate';
import { useVote } from '../../hooks/useVote';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { TagChip } from '../common/TagChip';
import { EditHistoryModal } from './EditHistoryModal';

interface QuestionArticleProps {
  readonly reportTo: string;
  readonly tagLinkTo: (tag: string) => string;
}

export const QuestionArticle: React.FC<QuestionArticleProps> = ({ reportTo, tagLinkTo }) => {
  const vote = useVote(Q.votes);
  const { requireLogin, guardLink } = useLoginGate();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Card as="article" className="p-space-md sm:p-space-lg flex flex-col space-y-space-md">
      <div className="flex flex-col space-y-space-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-surface-2 border border-hairline font-code-inline text-code-inline text-primary-hover font-semibold">{Q.code}</span>
          <span className="px-2 py-0.5 rounded bg-primary-container/20 border border-primary-container/40 text-primary font-caption text-caption">{Q.status}</span>
          <span className="text-caption font-caption text-ink-tertiary">{Q.version}</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-ink font-semibold tracking-tight">{Q.title}</h1>
      </div>

      <div className="flex items-center justify-between border-y border-hairline py-space-xs text-body-sm font-body-sm text-ink-subtle">
        <div className="flex items-center gap-space-xs">
          <Avatar initial={Q.author.initial} size="sm" tone="primary" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">{Q.author.name}</span>
            <span className="text-ink-tertiary">•</span>
            <span className="font-code-inline text-caption text-ink-subtle">
              {Q.postedAt}
              {L.postedSuffix}
            </span>
            {Q.editedAt && (
              <>
                <span className="text-ink-tertiary">•</span>
                <button
                  type="button"
                  title={editHistoryLabels.openHint}
                  onClick={() => setHistoryOpen(true)}
                  className="font-code-inline text-caption text-ink-tertiary underline decoration-dotted underline-offset-2 hover:text-ink transition-colors"
                >
                  {Q.editedAt}
                  {L.editedSuffix}
                </button>
              </>
            )}
            <span className="text-ink-tertiary">•</span>
            <span className="flex items-center gap-1 text-caption text-ink-subtle">
              <Icon name="visibility" className="text-[14px]" />
              {Q.views}
            </span>
          </div>
        </div>
        <Link to={reportTo} onClick={guardLink} className="text-ink-tertiary hover:text-semantic-danger font-caption text-caption transition-colors flex items-center gap-1">
          <Icon name="flag" className="text-[14px]" />
          <span>{L.report}</span>
        </Link>
      </div>

      <div className="text-body-md font-body-md text-ink leading-relaxed space-y-3.5">
        {Q.body.map((p) => (
          <p key={p} className="whitespace-pre-line">
            {p}
          </p>
        ))}
        <div className="bg-surface-2 rounded-lg p-space-sm border border-hairline font-code-block text-code-block space-y-1 text-ink-muted">
          <div className="text-caption font-semibold text-ink-subtle flex items-center gap-1.5 mb-1">
            <Icon name="checklist" className="text-[14px] text-tertiary" />
            <span>{Q.checklistTitle}</span>
          </div>
          {Q.checklist.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p>{Q.closing}</p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-space-xs">
        {Q.tags.map((tag) => (
          <TagChip key={tag} label={tag} to={tagLinkTo(tag)} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-space-sm border-t border-hairline">
        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            onClick={() => requireLogin() && vote.toggle()}
            aria-pressed={vote.voted}
            className={`flex items-center gap-2 px-space-sm py-1.5 rounded-lg border text-ink transition-colors group ${
              vote.voted ? 'bg-primary-container/20 border-primary-container/50' : 'bg-surface-2 hover:bg-surface-3 border-hairline'
            }`}
          >
            <Icon name="thumb_up" className="text-[18px] text-ink-subtle group-hover:text-primary transition-colors" />
            <span className="font-label-md text-label-md">{L.vote}</span>
            <span className="font-code-inline text-code-inline text-primary-hover font-semibold">{vote.count}</span>
          </button>
          <div className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-2 border border-hairline text-ink-subtle font-label-md text-label-md">
            <Icon name="check_circle" className="text-[18px] text-secondary" />
            <span className="text-ink">{L.answers}</span>
            <span className="font-code-inline text-code-inline text-ink font-semibold">{Q.answerCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-ink-tertiary">
          <button type="button" title={L.share} aria-label={L.share} className="p-1.5 rounded hover:text-ink hover:bg-surface-2 transition-colors">
            <Icon name="share" className="text-[18px]" />
          </button>
        </div>
      </div>
      {historyOpen && (
        // TODO: GET /api/questions/:questionId/edit-histories 연동
        <EditHistoryModal target={editHistoryLabels.question} histories={questionEditHistories} onClose={() => setHistoryOpen(false)} />
      )}
    </Card>
  );
};

export default QuestionArticle;
