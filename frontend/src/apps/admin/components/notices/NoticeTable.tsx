import React from 'react';
import { noticesCopy, ui } from '../../data/mockData';
import { formatDate } from '../../sanction';
import type { Notice } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';

interface NoticeTableProps {
  readonly notices: readonly Notice[];
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
  readonly editingId: number | null;
  readonly onEdit: (id: number) => void;
  readonly onRemove: (id: number) => void;
}

export const NoticeTable: React.FC<NoticeTableProps> = ({
  notices,
  message,
  editingId,
  onEdit,
  onRemove,
}) => {
  const cols = noticesCopy.columns;
  return (
    <Card padding="none" className="min-w-0 flex-1 self-start overflow-hidden">
      <Table>
        <TableHead>
          <Th align="center" className="w-20">
            {cols.pinned}
          </Th>
          <Th>{cols.title}</Th>
          <Th>{cols.author}</Th>
          <Th>{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {message !== undefined && <EmptyRow colSpan={5} message={message} />}
          {message === undefined && notices.length === 0 && <EmptyRow colSpan={5} />}
          {(message === undefined ? notices : []).map((n) => (
            <Tr key={n.id} selected={n.id === editingId}>
              <Td align="center">
                {n.isPinned ? (
                  <Badge tone="primary" shape="chip">
                    {noticesCopy.pinnedBadge}
                  </Badge>
                ) : (
                  <span className="text-ink-tertiary">-</span>
                )}
              </Td>
              <Td className={`text-ink ${n.isPinned ? 'font-bold' : 'font-medium'}`}>{n.title}</Td>
              <Td className="whitespace-nowrap text-body-lg text-ink-muted">{n.author.nickname}</Td>
              <Td className="font-mono text-ink-subtle">{formatDate(n.createdAt)}</Td>
              <Td>
                <div className="flex justify-end gap-2">
                  <Button size="sm" onClick={() => onEdit(n.id)}>
                    {ui.edit}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onRemove(n.id)}>
                    {ui.remove}
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};
