import React from 'react';
import { Link } from 'react-router-dom';
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
  readonly to: string;
  readonly danger?: boolean;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, icon, to, danger = false }) => {
  return (
    <Link
      to={to}
      className={`flex flex-col gap-4 rounded-lg border border-hairline bg-surface-2/60 p-5 transition-colors hover:bg-surface-2 ${
        danger ? 'hover:border-error/40' : 'hover:border-hairline-strong'
      }`}
    >
      <span className="flex items-center justify-between">
        <span className={`text-body-lg font-medium ${danger ? 'text-error' : 'text-ink-subtle'}`}>{label}</span>
        <Icon name={icon} className={`!text-[22px] ${danger ? 'text-error' : 'text-ink-subtle'}`} />
      </span>
      <span className={`text-headline-lg font-bold ${danger ? 'text-error' : 'text-ink'}`}>
        {value}
        <span className="ml-1 text-body-sm font-normal text-ink-subtle">{ui.countUnit}</span>
      </span>
    </Link>
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
        <StatTile label={a.questions} value={activity.questions} icon="help" to="/qna" />
        <StatTile label={a.answers} value={activity.answers} icon="chat_bubble" to="/qna" />
        <StatTile label={a.reportsReceived} value={activity.reportsReceived} icon="warning" to="/reports" danger />
      </div>
    </Card>
  );
};
