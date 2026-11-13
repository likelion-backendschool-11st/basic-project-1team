import React from 'react';
import { Link } from 'react-router-dom';
import { memberDetailCopy, ui } from '../../data/mockData';
import type { MemberActivity } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface ActivityStatsCardProps {
  readonly userId: number;
  readonly activity: MemberActivity;
}

interface StatTileProps {
  readonly label: string;
  readonly value: number;
  readonly icon: string;
  /** 누르면 이 회원 것만 걸러 보여 주는 목록. 없으면 숫자만 보여 준다 */
  readonly to?: string;
  readonly danger?: boolean;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, icon, to, danger = false }) => {
  const hover = danger ? 'hover:border-error/40' : 'hover:border-hairline-strong';
  const className = `flex flex-col gap-4 rounded-lg border border-hairline bg-surface-2/60 p-5 ${
    to ? `transition-colors hover:bg-surface-2 ${hover}` : ''
  }`;
  const content = (
    <>
      <span className="flex items-center justify-between">
        <span className={`text-body-lg font-medium ${danger ? 'text-error' : 'text-ink-subtle'}`}>
          {label}
        </span>
        <Icon name={icon} className={`!text-[22px] ${danger ? 'text-error' : 'text-ink-subtle'}`} />
      </span>
      <span className={`text-headline-lg font-bold ${danger ? 'text-error' : 'text-ink'}`}>
        {value.toLocaleString()}
        <span className="ml-1 text-body-sm font-normal text-ink-subtle">{ui.countUnit}</span>
      </span>
    </>
  );

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export const ActivityStatsCard: React.FC<ActivityStatsCardProps> = ({ userId, activity }) => {
  const a = memberDetailCopy.activity;
  return (
    <Card className="col-span-7">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <h2 className="text-label-sm text-ink-muted">{memberDetailCopy.activityTitle}</h2>
        <span className="text-body-sm text-ink-tertiary">{memberDetailCopy.activityHint}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-5">
        {/* 이 회원 글만 걸러 보여 준다 (API_SPEC 10.3 authorId) */}
        <StatTile
          label={a.questions}
          value={activity.questionCount}
          icon="help"
          to={`/qna?tab=questions&authorId=${userId}`}
        />
        <StatTile
          label={a.answers}
          value={activity.answerCount}
          icon="chat_bubble"
          to={`/qna?tab=answers&authorId=${userId}`}
        />
        {/* TODO: 신고 관리 목록을 API 와 연동하면 targetAuthorId 로 연결한다 (#60, API_SPEC 10.6) */}
        <StatTile
          label={a.reportsReceived}
          value={activity.reportsReceivedCount}
          icon="warning"
          danger
        />
      </div>
    </Card>
  );
};
