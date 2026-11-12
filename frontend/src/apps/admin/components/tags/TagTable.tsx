import React from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import type { Tag } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { TagChip } from '../ui/TagChip';

interface TagTableProps {
  readonly tags: readonly Tag[];
  readonly onEdit: (tag: Tag) => void;
  readonly onMerge: (tag: Tag) => void;
  readonly onRemove: (tag: Tag) => void;
  readonly onRestore: (tag: Tag) => void;
}

export const TagTable: React.FC<TagTableProps> = ({ tags, onEdit, onMerge, onRemove, onRestore }) => {
  const cols = tagsCopy.columns;
  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <TableHead>
          <Th>{cols.name}</Th>
          <Th>{cols.description}</Th>
          <Th align="right">{cols.usage}</Th>
          <Th align="center">{cols.createdAt}</Th>
          <Th align="right">{cols.actions}</Th>
        </TableHead>
        <tbody>
          {tags.length === 0 && <EmptyRow colSpan={5} />}
          {tags.map((tag) => {
            const blocked = tag.status === 'blocked';
            return (
              <Tr key={tag.name} dimmed={blocked} className="!h-[84px]">
                <Td>
                  <span className="flex items-center gap-2">
                    <TagChip name={tag.name} tone={blocked ? 'muted' : undefined} className={blocked ? 'line-through' : ''} />
                    {blocked && (
                      <Badge tone="danger" shape="chip">
                        {tagsCopy.blockedBadge}
                      </Badge>
                    )}
                  </span>
                </Td>
                <Td className={`text-body-lg ${tag.description ? 'text-ink' : 'italic text-ink-tertiary'}`}>
                  {tag.description || tagsCopy.noDescription}
                </Td>
                <Td align="right" className="whitespace-nowrap text-body-lg font-bold text-ink">
                  {tag.usage.toLocaleString()}
                  {ui.countUnit}
                </Td>
                <Td align="center" className="font-mono text-ink-subtle">
                  {tag.createdAt}
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    {blocked ? (
                      <Button size="sm" icon="lock_open" onClick={() => onRestore(tag)}>
                        {tagsCopy.restore}
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => onEdit(tag)}>
                          {ui.edit}
                        </Button>
                        <Button size="sm" onClick={() => onMerge(tag)}>
                          {ui.merge}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onRemove(tag)}>
                          {ui.remove}
                        </Button>
                      </>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
};
