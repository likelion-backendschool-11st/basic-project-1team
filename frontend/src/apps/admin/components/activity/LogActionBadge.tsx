import { logActionTones } from '../../data/mockData';
import type { LogAction } from '../../types';
import { Badge } from '../ui/Badge';

interface LogActionBadgeProps {
  readonly action: LogAction;
}

export function LogActionBadge({ action }: LogActionBadgeProps) {
  const tone = logActionTones[action];
  return (
    <Badge shape="code" tone={tone === 'neutral' ? 'muted' : tone} className={tone === 'neutral' ? '!text-ink-subtle !border-hairline-strong' : ''}>
      {action}
    </Badge>
  );
}
