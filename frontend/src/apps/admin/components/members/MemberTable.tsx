import React from 'react';
import { useNavigate } from 'react-router-dom';
import { membersCopy, ui } from '../../data/mockData';
import type { Member } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberTableProps {
  readonly members: readonly Member[];
}

export const MemberTable: React.FC<MemberTableProps> = ({ members }) => {
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
          {members.length === 0 && <EmptyRow colSpan={7} />}
          {members.map((m) => (
            <Tr key={m.id}>
              <Td className="font-mono text-ink-subtle">#{m.id}</Td>
              <Td className="font-mono font-semibold text-ink">{m.username}</Td>
              <Td className="text-ink">{m.nickname}</Td>
              <Td>
                <Badge shape="code" tone={m.role === 'ADMIN' ? 'primary' : 'neutral'}>
                  {m.role}
                </Badge>
              </Td>
              <Td>
                <MemberStatusBadge sanctions={m.sanctions} />
              </Td>
              <Td className="font-mono text-ink-subtle">{m.joinedAt}</Td>
              <Td align="right">
                <Button size="sm" onClick={() => navigate(`/members/${m.id}`)}>
                  {ui.detail}
                </Button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};
