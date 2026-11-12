import { qnaCopy, ui } from '../../data/mockData';
import type { Question } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { TagChip } from '../ui/TagChip';
import { VisibilityBadge } from '../ui/VisibilityBadge';
import type { PaginationState } from '../../hooks/usePagination';

interface QuestionTableProps {
  readonly rows: readonly Question[];
  readonly pagination: PaginationState;
  readonly onToggleHidden: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

export function QuestionTable({ rows, pagination, onToggleHidden, onRemove }: QuestionTableProps) {
  const cols = qnaCopy.columns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.id}</Th>
          <Th>{cols.title}</Th>
          <Th>{cols.author}</Th>
          <Th>{cols.tag}</Th>
          <Th align="center">{cols.answers}</Th>
          <Th align="center">{cols.resolved}</Th>
          <Th align="center">{cols.status}</Th>
          <Th>{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={9} />}
          {rows.map((q) => (
            <Tr key={q.id} dimmed={q.status !== 'active'}>
              <Td className={`font-mono ${q.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}>#{q.id}</Td>
              <Td className={`max-w-[360px] truncate text-body-lg font-semibold ${q.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}>
                {q.title}
              </Td>
              <Td className={q.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>{q.author}</Td>
              <Td>
                <TagChip name={q.tag} tone={q.status !== 'active' ? 'muted' : 'primary'} className={q.status !== 'active' ? '' : '!text-ink-muted'} />
              </Td>
              <Td align="center" className={`font-mono font-semibold ${q.status !== 'active' ? 'text-ink-tertiary' : 'text-ink'}`}>
                {q.answers}
              </Td>
              <Td align="center">
                {q.resolved ? (
                  <Badge tone="success" shape="chip">
                    {ui.resolved}
                  </Badge>
                ) : (
                  <span className="text-ink-tertiary">-</span>
                )}
              </Td>
              <Td align="center">
                <VisibilityBadge status={q.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{q.createdAt}</Td>
              <Td>
                <ModerationActions status={q.status} onToggleHidden={() => onToggleHidden(q.id)} onRemove={() => onRemove(q.id)} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} className="border-t border-hairline" />
    </Card>
  );
}

export default QuestionTable;
