import React from 'react';
import { boardCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import type { Comment } from '../../types';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface CommentTableProps {
  readonly rows: readonly Comment[];
  readonly pagination: PaginationState;
  readonly onToggleHidden: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

export const CommentTable: React.FC<CommentTableProps> = ({ rows, pagination, onToggleHidden, onRemove }) => {
  const cols = boardCopy.commentColumns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.id}</Th>
          <Th>{cols.preview}</Th>
          <Th>{cols.post}</Th>
          <Th>{cols.author}</Th>
          <Th align="center">{cols.status}</Th>
          <Th>{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={7} />}
          {rows.map((c) => (
            <Tr key={c.id} dimmed={c.status !== 'active'}>
              <Td className={`font-mono ${c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}>#{c.id}</Td>
              <Td className={`max-w-[360px] truncate text-body-lg font-semibold ${c.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}>
                {c.preview}
              </Td>
              <Td className={`max-w-[240px] truncate ${c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}`}>
                <span className="font-mono text-ink-subtle">#{c.postId}</span> {c.postTitle}
              </Td>
              <Td className={c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>{c.author}</Td>
              <Td align="center">
                <VisibilityBadge status={c.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{c.createdAt}</Td>
              <Td>
                <ModerationActions status={c.status} onToggleHidden={() => onToggleHidden(c.id)} onRemove={() => onRemove(c.id)} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} className="border-t border-hairline" />
    </Card>
  );
};
