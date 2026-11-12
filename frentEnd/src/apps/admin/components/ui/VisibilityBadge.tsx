import { ui } from '../../data/mockData';
import { Badge } from './Badge';

interface VisibilityBadgeProps {
  readonly hidden: boolean;
}

export function VisibilityBadge({ hidden }: VisibilityBadgeProps) {
  return hidden ? (
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
