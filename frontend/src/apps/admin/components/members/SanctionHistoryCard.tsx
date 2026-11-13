import React from 'react';
import { memberDetailCopy, ui } from '../../data/mockData';
import { formatDateTime, sanctionRecordLabel } from '../../sanction';
import type { SanctionRecord } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { EmptyRow } from '../ui/Table';

interface SanctionHistoryCardProps {
  readonly history: readonly SanctionRecord[];
}

export const SanctionHistoryCard: React.FC<SanctionHistoryCardProps> = ({ history }) => {
  const cols = memberDetailCopy.historyColumns;
  return (
    <Card className="mt-6">
      <CardHeader
        icon="history"
        title={memberDetailCopy.historyTitle}
        aside={
          <span className="text-body-sm text-ink-subtle">
            {memberDetailCopy.historyTotal} {history.length}
            {ui.countUnit}
          </span>
        }
      />
      <table className="mt-3 w-full border-collapse text-left">
        <thead>
          <tr className="h-11 border-b border-hairline text-label-sm text-ink-subtle">
            <th className="w-56 pl-4 font-medium">{cols.at}</th>
            <th className="w-40 font-medium">{cols.admin}</th>
            <th className="w-44 font-medium">{cols.label}</th>
            <th className="font-medium">{cols.reason}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {history.length === 0 && <EmptyRow colSpan={4} />}
          {history.map((h) => (
            <tr key={`${h.createdAt}-${h.action}-${h.type}`} className="h-16">
              <td className="pl-4 font-mono text-body-md text-ink-muted">
                {formatDateTime(h.createdAt)}
              </td>
              <td className="text-body-lg font-semibold text-ink">{h.admin.nickname}</td>
              <td>
                <Badge
                  tone={
                    h.action === 'release' ? 'success' : h.type === 'suspend' ? 'danger' : 'warning'
                  }
                  shape="chip"
                >
                  {sanctionRecordLabel(h)}
                </Badge>
              </td>
              <td className="text-body-lg text-ink">{h.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
