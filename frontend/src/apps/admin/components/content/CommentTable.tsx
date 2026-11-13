import React from 'react';
import { boardCopy, contentDetailCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import { formatDate } from '../../sanction';
import type { Comment } from '../../types';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface CommentTableProps {
  readonly rows: readonly Comment[];
  readonly pagination: PaginationState;
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
  /** 제목(미리보기)을 누르면 본문 상세를 연다 */
  readonly onOpen: (row: Comment) => void;
  readonly onToggleHidden: (row: Comment) => void;
  readonly onRemove: (row: Comment) => void;
}

export const CommentTable: React.FC<CommentTableProps> = ({
  rows,
  pagination,
  onOpen,
  onToggleHidden,
  onRemove,
  message,
}) => {
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
          {message !== undefined && <EmptyRow colSpan={7} message={message} />}
          {message === undefined && rows.length === 0 && <EmptyRow colSpan={7} />}
          {(message === undefined ? rows : []).map((c) => (
            <Tr key={c.id} dimmed={c.status !== 'active'}>
              <Td
                className={`font-mono ${c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}
              >
                #{c.id}
              </Td>
              <Td
                className={`max-w-[360px] truncate text-body-lg font-semibold ${c.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}
              >
                <button
                  type="button"
                  title={contentDetailCopy.openDetail}
                  onClick={() => onOpen(c)}
                  className="max-w-full truncate text-left hover:text-primary hover:underline"
                >
                  {c.preview}
                </button>
              </Td>
              <Td
                className={`max-w-[240px] truncate ${c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}`}
              >
                <span className="font-mono text-ink-subtle">#{c.post.id}</span> {c.post.title}
              </Td>
              <Td className={c.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>
                {c.author.nickname}
              </Td>
              <Td align="center">
                <VisibilityBadge status={c.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{formatDate(c.createdAt)}</Td>
              <Td>
                <ModerationActions
                  status={c.status}
                  onToggleHidden={() => onToggleHidden(c)}
                  onRemove={() => onRemove(c)}
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
