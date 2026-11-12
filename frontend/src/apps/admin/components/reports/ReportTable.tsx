import { reportReasonLabels, reportTargetLabels, reportsCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
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
}

export function ReportTable({ rows, selectedId, onSelect, pagination }: ReportTableProps) {
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
          {rows.length === 0 && <EmptyRow colSpan={6} />}
          {rows.map((r) => {
            const selected = r.id === selectedId;
            return (
              <Tr
                key={r.id}
                selected={selected}
                onClick={() => onSelect(r.id)}
                aria-selected={selected}
                className="!h-[60px] cursor-pointer"
              >
                <Td className={`!px-4 font-mono ${selected ? 'font-bold text-primary' : 'text-ink-subtle'}`}>#{r.id}</Td>
                <Td className="!px-4 whitespace-nowrap">
                  <Badge shape="chip" tone={selected ? 'primary' : 'neutral'}>
                    {reportTargetLabels[r.target]}
                  </Badge>
                  <span className="ml-1.5 font-mono text-code-sm text-ink-subtle">#{r.targetId}</span>
                </Td>
                <Td className={`!px-4 max-w-[260px] truncate font-semibold ${r.preview === null ? 'text-ink-tertiary' : 'text-ink'}`}>
                  {r.preview ?? reportsCopy.deletedTarget}
                </Td>
                <Td className="!px-4" align="center">
                  <Badge shape="chip">{reportReasonLabels[r.reason]}</Badge>
                </Td>
                <Td className="!px-4 text-ink-muted">{r.reporter}</Td>
                <Td className="!px-4 font-mono text-ink-subtle" align="right">
                  {r.reportedAt}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} className="border-t border-hairline" />
    </Card>
  );
}
