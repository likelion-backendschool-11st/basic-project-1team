import React from 'react';
import { useNavigate } from 'react-router-dom';
import { membersCopy, ui } from '../../data/mockData';
import { formatDate } from '../../sanction';
import type { Member } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberTableProps {
  readonly members: readonly Member[];
  /** 불러오는 중·오류 안내. 있으면 목록 대신 이 문구를 보여 준다 */
  readonly message?: string;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, message }) => {
  const navigate = useNavigate();
  const cols = membersCopy.columns;

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.id}</Th>
          <Th>{cols.username}</Th>
          <Th>{cols.nickname}</Th>
          <Th>{cols.role}</Th>
          <Th>{cols.status}</Th>
          <Th>{cols.joinedAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {message !== undefined && <EmptyRow colSpan={7} message={message} />}
          {message === undefined && members.length === 0 && <EmptyRow colSpan={7} />}
          {(message === undefined ? members : []).map((m) => {
            const withdrawn = m.status === 'withdrawn';
            const nameTone = withdrawn ? 'text-ink-tertiary' : 'text-ink';
            return (
              <Tr key={m.id}>
                <Td className="font-mono text-ink-subtle">#{m.id}</Td>
                <Td className={`font-mono font-semibold ${nameTone}`}>
                  {m.username ?? membersCopy.emptyValue}
                </Td>
                <Td className={nameTone}>{m.nickname ?? membersCopy.withdrawnName}</Td>
                <Td>
                  <Badge shape="code" tone={m.role === 'ADMIN' ? 'primary' : 'neutral'}>
                    {m.role}
                  </Badge>
                </Td>
                <Td>
                  <MemberStatusBadge status={m.status} sanctions={m.sanctions} />
                </Td>
                <Td className="font-mono text-ink-subtle">{formatDate(m.createdAt)}</Td>
                <Td align="right">
                  <Button size="sm" onClick={() => navigate(`/members/${m.id}`)}>
                    {ui.detail}
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
};
