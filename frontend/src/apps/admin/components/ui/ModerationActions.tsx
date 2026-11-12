import { ui } from '../../data/mockData';
import { Button } from './Button';

interface ModerationActionsProps {
  readonly hidden: boolean;
  readonly onToggleHidden: () => void;
  /** 없으면 삭제 버튼을 숨긴다 (댓글은 숨김/복구만 가능). */
  readonly onRemove?: () => void;
}

/** 숨김/복구 + 삭제 button pair used in the Q&A and free-board tables. */
export function ModerationActions({ hidden, onToggleHidden, onRemove }: ModerationActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="secondary" onClick={onToggleHidden}>
        {hidden ? ui.restore : ui.hide}
      </Button>
      {onRemove && (
        <Button size="sm" variant="danger" onClick={onRemove}>
          {ui.remove}
        </Button>
      )}
    </div>
  );
}

export default ModerationActions;
