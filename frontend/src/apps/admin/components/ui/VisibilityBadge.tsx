import { ui } from '../../data/mockData';
import type { ContentStatus } from '../../types';
import { Badge } from './Badge';

interface VisibilityBadgeProps {
  readonly status: ContentStatus;
}

export function VisibilityBadge({ status }: VisibilityBadgeProps) {
  if (status === 'deleted') {
    return (
      <Badge tone="muted" shape="chip">
        {ui.deleted}
      </Badge>
    );
  }
  return status === 'hidden' ? (
    <Badge tone="danger" shape="chip">
      {ui.hidden}
    </Badge>
  ) : (
    <Badge tone="neutral" shape="chip">
      {ui.public}
    </Badge>
  );
}

export default VisibilityBadge;
