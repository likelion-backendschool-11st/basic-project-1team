import { membersCopy } from '../../data/mockData';
import type { MemberStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface MemberStatusBadgeProps {
  readonly status: MemberStatus;
  readonly suspendedUntil?: string;
}

export function MemberStatusBadge({ status, suspendedUntil }: MemberStatusBadgeProps) {
  if (status === 'suspended') {
    return (
      <Badge tone="danger" dot>
        {membersCopy.statusLabels.suspended}
        {suspendedUntil && <span className="font-mono text-code-xs opacity-80">~{suspendedUntil}</span>}
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" dot className="[&>span:first-child]:text-tertiary">
      {membersCopy.statusLabels.active}
    </Badge>
  );
}

export default MemberStatusBadge;
