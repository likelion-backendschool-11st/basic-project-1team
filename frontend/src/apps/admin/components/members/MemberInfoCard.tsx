import type { ReactNode } from 'react';
import { memberDetailCopy } from '../../data/mockData';
import { activeSanctionLabel } from '../../sanction';
import type { ActiveSanction, Member } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberInfoCardProps {
  readonly member: Member;
  /** 제재 적용·해제가 바로 보이도록 폼의 현재 값을 받는다 */
  readonly sanctions: readonly ActiveSanction[];
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

export function MemberInfoCard({ member, sanctions }: MemberInfoCardProps) {
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
          <MemberStatusBadge sanctions={sanctions} />
        </InfoRow>
        {sanctions.length > 0 && (
          <InfoRow label={memberDetailCopy.activeSanctionsLabel}>
            <span className="flex flex-col items-end gap-1">
              {sanctions.map((s) => (
                <span key={s.type} className={`whitespace-nowrap text-body-md font-medium ${s.type === 'suspend' ? 'text-error' : 'text-amber-400'}`}>
                  {activeSanctionLabel(s)}
                  {s.until && memberDetailCopy.untilSuffix}
                </span>
              ))}
            </span>
          </InfoRow>
        )}
        <InfoRow label={f.joinedAt}>
          <span className="font-mono text-body-md text-ink">{member.joinedAt}</span>
        </InfoRow>
      </dl>
    </Card>
  );
}
