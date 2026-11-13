import React from 'react';
import { qnaCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import { formatDate } from '../../sanction';
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
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
  readonly onToggleHidden: (row: Answer) => void;
  readonly onRemove: (answer: Answer) => void;
}

export const AnswerTable: React.FC<AnswerTableProps> = ({
  rows,
  pagination,
  onToggleHidden,
  onRemove,
  message,
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
          {message !== undefined && <EmptyRow colSpan={8} message={message} />}
          {message === undefined && rows.length === 0 && <EmptyRow colSpan={8} />}
          {(message === undefined ? rows : []).map((a) => (
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
                <span className="font-mono text-ink-subtle">#{a.question.id}</span>{' '}
                {a.question.title}
              </Td>
              <Td className={a.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>
                {a.author.nickname}
              </Td>
              <Td align="center">
                {a.isAccepted ? (
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
              <Td className="font-mono text-ink-subtle">{formatDate(a.createdAt)}</Td>
              <Td>
                <ModerationActions
                  status={a.status}
                  onToggleHidden={() => onToggleHidden(a)}
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
