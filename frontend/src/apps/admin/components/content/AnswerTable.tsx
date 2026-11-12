import React from 'react';
import { qnaCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import type { Answer } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface AnswerTableProps {
  readonly rows: readonly Answer[];
  readonly pagination: PaginationState;
  readonly onToggleHidden: (id: number) => void;
  readonly onRemove: (answer: Answer) => void;
}

export const AnswerTable: React.FC<AnswerTableProps> = ({
  rows,
  pagination,
  onToggleHidden,
  onRemove,
}) => {
  const cols = qnaCopy.answerColumns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.id}</Th>
          <Th>{cols.preview}</Th>
          <Th>{cols.question}</Th>
          <Th>{cols.author}</Th>
          <Th align="center">{cols.accepted}</Th>
          <Th align="center">{cols.status}</Th>
          <Th>{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={8} />}
          {rows.map((a) => (
            <Tr key={a.id} dimmed={a.status !== 'active'}>
              <Td
                className={`font-mono ${a.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}
              >
                #{a.id}
              </Td>
              <Td
                className={`max-w-[320px] truncate text-body-lg font-semibold ${a.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}
              >
                {a.preview}
              </Td>
              <Td
                className={`max-w-[240px] truncate ${a.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}`}
              >
                <span className="font-mono text-ink-subtle">#{a.questionId}</span> {a.questionTitle}
              </Td>
              <Td className={a.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>
                {a.author}
              </Td>
              <Td align="center">
                {a.accepted ? (
                  <Badge tone="success" shape="chip">
                    {qnaCopy.accepted}
                  </Badge>
                ) : (
                  <span className="text-ink-tertiary">-</span>
                )}
              </Td>
              <Td align="center">
                <VisibilityBadge status={a.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{a.createdAt}</Td>
              <Td>
                <ModerationActions
                  status={a.status}
                  onToggleHidden={() => onToggleHidden(a.id)}
                  onRemove={() => onRemove(a)}
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
