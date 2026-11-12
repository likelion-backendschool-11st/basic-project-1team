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
}

/** 댓글은 숨김/복구만 가능하고 관리자 삭제는 없다 (API_SPEC 10.4). */
export function CommentTable({ rows, pagination, onToggleHidden }: CommentTableProps) {
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
            <Tr key={c.id} dimmed={c.hidden}>
              <Td className={`font-mono ${c.hidden ? 'text-ink-tertiary' : 'text-ink-subtle'}`}>#{c.id}</Td>
              <Td className={`max-w-[360px] truncate text-body-lg font-semibold ${c.hidden ? 'text-ink-tertiary line-through' : 'text-ink'}`}>
                {c.preview}
              </Td>
              <Td className={`max-w-[240px] truncate ${c.hidden ? 'text-ink-tertiary' : 'text-ink-muted'}`}>
                <span className="font-mono text-ink-subtle">#{c.postId}</span> {c.postTitle}
              </Td>
              <Td className={c.hidden ? 'text-ink-tertiary' : 'text-ink-muted'}>{c.author}</Td>
              <Td align="center">
                <VisibilityBadge hidden={c.hidden} />
              </Td>
              <Td className="font-mono text-ink-subtle">{c.createdAt}</Td>
              <Td>
                <ModerationActions hidden={c.hidden} onToggleHidden={() => onToggleHidden(c.id)} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={pagination.goTo} className="border-t border-hairline" />
    </Card>
  );
}

export default CommentTable;
