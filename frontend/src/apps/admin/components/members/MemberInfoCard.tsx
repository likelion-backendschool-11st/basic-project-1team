import type { ReactNode } from 'react';
import { memberDetailCopy } from '../../data/mockData';
import type { Member, MemberStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberInfoCardProps {
  readonly member: Member;
  readonly status: MemberStatus;
  readonly suspendedUntil?: string;
}

interface InfoRowProps {
  readonly label: string;
  readonly children: ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-4">
      <dt className="text-body-lg text-ink-subtle">{label}</dt>
      <dd className="flex items-center gap-2 text-right">{children}</dd>
    </div>
  );
}

export function MemberInfoCard({ member, status, suspendedUntil }: MemberInfoCardProps) {
  const f = memberDetailCopy.fields;
  return (
    <Card className="col-span-5">
      <h2 className="border-b border-hairline pb-3 text-label-sm text-ink-muted">{memberDetailCopy.basicInfo}</h2>
      <dl className="mt-3 space-y-1">
        <InfoRow label={f.username}>
          <Badge shape="code">{member.username}</Badge>
        </InfoRow>
        <InfoRow label={f.nickname}>
          <span className="font-semibold text-ink">{member.nickname}</span>
        </InfoRow>
        <InfoRow label={f.role}>
          <Badge shape="code">{member.role}</Badge>
        </InfoRow>
        <InfoRow label={f.status}>
          <MemberStatusBadge status={status} />
          {status === 'suspended' && suspendedUntil && (
            <span className="whitespace-nowrap text-body-md font-medium text-error">
              ({suspendedUntil} {memberDetailCopy.releaseSuffix})
            </span>
          )}
        </InfoRow>
        <InfoRow label={f.joinedAt}>
          <span className="font-mono text-body-md text-ink">{member.joinedAt}</span>
        </InfoRow>
      </dl>
    </Card>
  );
}

export default MemberInfoCard;
