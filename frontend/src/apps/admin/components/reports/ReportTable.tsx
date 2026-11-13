import React from 'react';
import { reportReasonLabels, reportTargetLabels, reportsCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import { formatDate } from '../../sanction';
import type { Report } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';

interface ReportTableProps {
  readonly rows: readonly Report[];
  readonly selectedId: number | null;
  readonly onSelect: (id: number) => void;
  readonly pagination: PaginationState;
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  rows,
  selectedId,
  onSelect,
  pagination,
  message,
}) => {
  const cols = reportsCopy.columns;
  return (
    <Card padding="none" className="min-w-0 flex-1 overflow-hidden">
      <Table>
        <TableHead>
          <Th className="!px-4">{cols.id}</Th>
          <Th className="!px-4">{cols.target}</Th>
          <Th className="!px-4">{cols.preview}</Th>
          <Th className="!px-4" align="center">
            {cols.reason}
          </Th>
          <Th className="!px-4">{cols.reporter}</Th>
          <Th className="!px-4" align="right">
            {cols.reportedAt}
          </Th>
        </TableHead>
        <tbody>
          {message !== undefined && <EmptyRow colSpan={6} message={message} />}
          {message === undefined && rows.length === 0 && <EmptyRow colSpan={6} />}
          {(message === undefined ? rows : []).map((r) => {
            const selected = r.id === selectedId;
            return (
              <Tr
                key={r.id}
                selected={selected}
                onClick={() => onSelect(r.id)}
                aria-selected={selected}
                className="!h-[60px] cursor-pointer"
              >
                <Td
                  className={`!px-4 font-mono ${selected ? 'font-bold text-primary' : 'text-ink-subtle'}`}
                >
                  #{r.id}
                </Td>
                <Td className="!px-4 whitespace-nowrap">
                  <Badge shape="chip" tone={selected ? 'primary' : 'neutral'}>
                    {reportTargetLabels[r.targetType]}
                  </Badge>
                  <span className="ml-1.5 font-mono text-code-sm text-ink-subtle">
                    #{r.targetId}
                  </span>
                </Td>
                <Td
                  className={`!px-4 max-w-[260px] truncate font-semibold ${r.preview === null ? 'text-ink-tertiary' : 'text-ink'}`}
                >
                  {r.preview ?? reportsCopy.deletedTarget}
                  {r.targetStatus === 'hidden' && (
                    <span className="ml-2 text-code-sm font-normal text-ink-subtle">
                      {reportsCopy.hiddenMark}
                    </span>
                  )}
                </Td>
                <Td className="!px-4" align="center">
                  <Badge shape="chip">{reportReasonLabels[r.reason]}</Badge>
                </Td>
                <Td className="!px-4 text-ink-muted">{r.reporter.nickname}</Td>
                <Td className="!px-4 font-mono text-ink-subtle" align="right">
                  {formatDate(r.createdAt)}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onChange={pagination.goTo}
        className="border-t border-hairline"
      />
    </Card>
  );
};
