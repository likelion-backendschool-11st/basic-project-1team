import { Link } from 'react-router-dom';
import { activityLogCopy } from '../../data/mockData';
import type { ActivityLog } from '../../types';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { LogActionBadge } from './LogActionBadge';

interface ActivityLogTableProps {
  readonly logs: readonly ActivityLog[];
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
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
          {logs.length === 0 && <EmptyRow colSpan={5} />}
          {logs.map((log) => (
            <Tr key={log.id} className="!h-[58px]">
              <Td className="whitespace-nowrap font-mono text-code-sm text-ink-subtle">{log.at}</Td>
              <Td className="whitespace-nowrap font-semibold text-ink">{log.admin}</Td>
              <Td>
                <LogActionBadge action={log.action} />
              </Td>
              <Td>
                <Link to={log.targetHref} className="whitespace-nowrap font-medium text-primary hover:underline">
                  {log.targetLabel}
                </Link>
              </Td>
              <Td className="text-ink-muted">{log.detail}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
