import React from 'react';
import { boardCopy, contentDetailCopy } from '../../data/mockData';
import type { PaginationState } from '../../hooks/usePagination';
import { formatDate } from '../../sanction';
import type { Post } from '../../types';
import { Card } from '../ui/Card';
import { ModerationActions } from '../ui/ModerationActions';
import { Pagination } from '../ui/Pagination';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface PostTableProps {
  readonly rows: readonly Post[];
  readonly pagination: PaginationState;
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
  /** 제목(미리보기)을 누르면 본문 상세를 연다 */
  readonly onOpen: (row: Post) => void;
  readonly onToggleHidden: (row: Post) => void;
  readonly onRemove: (row: Post) => void;
}

export const PostTable: React.FC<PostTableProps> = ({
  rows,
  pagination,
  onOpen,
  onToggleHidden,
  onRemove,
  message,
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
          {message !== undefined && <EmptyRow colSpan={7} message={message} />}
          {message === undefined && rows.length === 0 && <EmptyRow colSpan={7} />}
          {(message === undefined ? rows : []).map((p) => (
            <Tr key={p.id} dimmed={p.status !== 'active'}>
              <Td
                className={`font-mono ${p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-subtle'}`}
              >
                #{p.id}
              </Td>
              <Td
                className={`text-body-lg font-semibold ${p.status !== 'active' ? 'text-ink-tertiary line-through' : 'text-ink'}`}
              >
                <button
                  type="button"
                  title={contentDetailCopy.openDetail}
                  onClick={() => onOpen(p)}
                  className="max-w-full truncate text-left hover:text-primary hover:underline"
                >
                  {p.title}
                </button>
              </Td>
              <Td className={p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink-muted'}>
                {p.author.nickname}
              </Td>
              <Td
                align="center"
                className={`font-mono font-semibold ${p.status !== 'active' ? 'text-ink-tertiary' : 'text-ink'}`}
              >
                {p.commentCount}
              </Td>
              <Td align="center">
                <VisibilityBadge status={p.status} />
              </Td>
              <Td className="font-mono text-ink-subtle">{formatDate(p.createdAt)}</Td>
              <Td>
                <ModerationActions
                  status={p.status}
                  onToggleHidden={() => onToggleHidden(p)}
                  onRemove={() => onRemove(p)}
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
