import { tagsCopy, ui } from '../../data/mockData';
import type { Tag } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyRow, Table, TableHead, Td, Th, Tr } from '../ui/Table';
import { TagChip } from '../ui/TagChip';

interface TagTableProps {
  readonly tags: readonly Tag[];
  readonly onEdit: (tag: Tag) => void;
  readonly onMerge: (tag: Tag) => void;
  readonly onRemove: (tag: Tag) => void;
}

export function TagTable({ tags, onEdit, onMerge, onRemove }: TagTableProps) {
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
          {tags.map((tag) => (
            <Tr key={tag.name} className="!h-[84px]">
              <Td>
                <TagChip name={tag.name} />
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
                  <Button size="sm" onClick={() => onEdit(tag)}>
                    {ui.edit}
                  </Button>
                  <Button size="sm" onClick={() => onMerge(tag)}>
                    {ui.merge}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onRemove(tag)}>
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
}

export default TagTable;
