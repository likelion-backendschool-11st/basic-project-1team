import React from 'react';
import { Link } from 'react-router-dom';
import { activityLogCopy } from '../../data/mockData';
import { formatLogTime, logTargetPath } from '../../activityLog';
import type { ActivityLog } from '../../types';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { LogActionBadge } from './LogActionBadge';

interface ActivityLogTableProps {
  readonly logs: readonly ActivityLog[];
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({ logs, message }) => {
  const cols = activityLogCopy.columns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th className="w-44">{cols.at}</Th>
          <Th className="w-40">{cols.admin}</Th>
          <Th className="w-60">{cols.action}</Th>
          <Th className="w-56">{cols.target}</Th>
          <Th>{cols.detail}</Th>
        </TableHead>
        <tbody>
          {message !== undefined && <EmptyRow colSpan={5} message={message} />}
          {message === undefined && logs.length === 0 && <EmptyRow colSpan={5} />}
          {message === undefined &&
            logs.map((log) => (
              <Tr key={log.id} className="!h-[58px]">
                <Td className="whitespace-nowrap font-mono text-code-sm text-ink-subtle">
                  {formatLogTime(log.createdAt)}
                </Td>
                <Td className="whitespace-nowrap font-semibold text-ink">{log.admin.nickname}</Td>
                <Td>
                  <LogActionBadge action={log.action} />
                </Td>
                <Td>
                  <Link
                    to={logTargetPath(log.targetType, log.targetId)}
                    className="whitespace-nowrap font-medium text-primary hover:underline"
                  >
                    {log.targetLabel}
                  </Link>
                </Td>
                <Td className="text-ink-muted">{log.detail ?? '-'}</Td>
              </Tr>
            ))}
        </tbody>
      </Table>
    </Card>
  );
};
