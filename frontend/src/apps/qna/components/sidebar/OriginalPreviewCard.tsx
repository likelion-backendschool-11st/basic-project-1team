import React from 'react';
import { Link } from 'react-router-dom';
import { htmlToText } from '../../../../shared/editor/richText';
import { originalPreview as P } from '../../data/mockData';
import type { Question } from '../../data/types';
import { formatCount } from '../../display';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface OriginalPreviewCardProps {
  readonly to: string;
  /** 수정 전 원본. 저장하기 전 서버 값을 보여 준다 */
  readonly question: Question;
}

export const OriginalPreviewCard: React.FC<OriginalPreviewCardProps> = ({ to, question: q }) => (
  <Card bordered={false} className="p-space-md flex flex-col gap-space-xs">
    <div className="flex items-center justify-between">
      <span className="font-caption text-caption text-ink-tertiary">{P.label}</span>
      <Link
        to={to}
        target="_blank"
        className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5"
      >
        {P.open}
        <Icon name="open_in_new" className="text-[13px]" />
      </Link>
    </div>
    <Link to={to} className="p-space-sm rounded-lg bg-surface-2 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${q.isAccepted ? 'bg-semantic-success' : 'bg-tertiary'}`}
        />
        <span className="font-label-sm text-label-sm text-ink truncate">{q.title}</span>
      </div>
      <p className="font-caption text-caption text-ink-subtle line-clamp-2">{htmlToText(q.body)}</p>
      <div className="flex items-center gap-2 pt-1 font-caption text-caption text-ink-tertiary">
        <span>{P.answers(formatCount(q.answerCount))}</span>
        <span>•</span>
        <span>{q.isEdited ? P.edited : P.notEdited}</span>
      </div>
    </Link>
  </Card>
);
