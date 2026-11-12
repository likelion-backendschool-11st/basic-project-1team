import { ui } from '../../data/mockData';
import type { ContentStatus } from '../../types';
import { Button } from './Button';

interface ModerationActionsProps {
  readonly status: ContentStatus;
  readonly onToggleHidden: () => void;
  readonly onRemove: () => void;
}

/** 숨김/복구 + 삭제 button pair used in the Q&A and free-board tables. 삭제된 항목은 되돌릴 수 없어 버튼이 없다. */
export function ModerationActions({ status, onToggleHidden, onRemove }: ModerationActionsProps) {
  if (status === 'deleted') {
    return <div className="text-right text-ink-tertiary">-</div>;
  }
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="secondary" onClick={onToggleHidden}>
        {status === 'hidden' ? ui.restore : ui.hide}
      </Button>
      <Button size="sm" variant="danger" icon="delete" onClick={onRemove}>
        {ui.remove}
      </Button>
    </div>
  );
}
