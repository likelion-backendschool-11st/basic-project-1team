import React from 'react';
import { boardCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import type { Post } from '../../types';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface PostTableProps {
  readonly rows: readonly Post[];
  readonly pagination: PaginationState;
  readonly onToggleHidden: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

export const PostTable: React.FC<PostTableProps> = ({
  rows,
  pagination,
  onToggleHidden,
  onRemove,
}) => {
  const cols = boardCopy.columns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.id}</Th>
          <Th>{cols.title}</Th>
          <Th>{cols.author}</Th>
          <Th align="center">{cols.comments}</Th>
          <Th align="center">{cols.status}</Th>
          <Th>{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={7} />}
          {rows.map((p) => (
            <Tr key={p.id} dimmed={p.status !== 'active'}>
              <Td
                className={`font-mono ${p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}
              >
                #{p.id}
              </Td>
              <Td
                className={`text-body-lg font-semibold ${p.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}
              >
                {p.title}
              </Td>
              <Td className={p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>
                {p.author}
              </Td>
              <Td
                align="center"
                className={`font-mono font-semibold ${p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink'}`}
              >
                {p.comments}
              </Td>
              <Td align="center">
                <VisibilityBadge status={p.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{p.createdAt}</Td>
              <Td>
                <ModerationActions
                  status={p.status}
                  onToggleHidden={() => onToggleHidden(p.id)}
                  onRemove={() => onRemove(p.id)}
                />
              </Td>
            </Tr>
          ))}
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
