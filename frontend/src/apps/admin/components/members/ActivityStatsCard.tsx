import React from 'react';
import { memberDetailCopy, ui } from '../../data/mockData';
import type { MemberActivity } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';

interface ActivityStatsCardProps {
  readonly activity: MemberActivity;
}

interface StatTileProps {
  readonly label: string;
  readonly value: number;
  readonly icon: string;
  readonly danger?: boolean;
}

/**
 * 숫자만 보여 준다.
 * TODO: 질문·답변 관리(#58)와 신고 관리(#60) 목록을 API 와 연동하면, 누르면 이 회원 것만 보이도록
 *   authorId·targetAuthorId 필터를 붙인 목록으로 이동하게 한다 (API_SPEC 10.3·10.6)
 */
const StatTile: React.FC<StatTileProps> = ({ label, value, icon, danger = false }) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-surface-2/60 p-5">
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
    </div>
  );
};

export const ActivityStatsCard: React.FC<ActivityStatsCardProps> = ({ activity }) => {
  const a = memberDetailCopy.activity;
  return (
    <Card className="col-span-7">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <h2 className="text-label-sm text-ink-muted">{memberDetailCopy.activityTitle}</h2>
        <span className="text-body-sm text-ink-tertiary">{memberDetailCopy.activityHint}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-5">
        <StatTile label={a.questions} value={activity.questionCount} icon="help" />
        <StatTile label={a.answers} value={activity.answerCount} icon="chat_bubble" />
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
