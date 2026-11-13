import React, { type ReactNode } from 'react';
import { memberDetailCopy, membersCopy, permissionLabels } from '../../data/mockData';
import { activeSanctionLabel, formatDate, formatDateTime } from '../../sanction';
import type { MemberDetail } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberInfoCardProps {
  readonly member: MemberDetail;
}

interface InfoRowProps {
  readonly label: string;
  readonly children: ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, children }) => {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-4">
      <dt className="text-body-lg text-ink-subtle">{label}</dt>
      <dd className="flex items-center gap-2 text-right">{children}</dd>
    </div>
  );
};

export const MemberInfoCard: React.FC<MemberInfoCardProps> = ({ member }) => {
  const f = memberDetailCopy.fields;
  const { sanctions } = member;
  return (
    <Card className="col-span-5">
      <h2 className="border-b border-hairline pb-3 text-label-sm text-ink-muted">
        {memberDetailCopy.basicInfo}
      </h2>
      <dl className="mt-3 space-y-1">
        <InfoRow label={f.username}>
          <Badge shape="code">{member.username ?? membersCopy.emptyValue}</Badge>
        </InfoRow>
        <InfoRow label={f.nickname}>
          <span className="font-semibold text-ink">
            {member.nickname ?? membersCopy.withdrawnName}
          </span>
        </InfoRow>
        <InfoRow label={f.name}>
          <span className="text-body-md text-ink">{member.name ?? membersCopy.emptyValue}</span>
        </InfoRow>
        <InfoRow label={f.email}>
          <span className="font-mono text-body-md text-ink">
            {member.email ?? membersCopy.emptyValue}
          </span>
        </InfoRow>
        <InfoRow label={f.role}>
          <Badge shape="code">{member.role}</Badge>
        </InfoRow>
        <InfoRow label={f.permissions}>
          <span className="text-body-md text-ink">
            {member.permissions.length === 0
              ? membersCopy.emptyValue
              : member.permissions.map((p) => permissionLabels[p] ?? p).join(', ')}
          </span>
        </InfoRow>
        <InfoRow label={f.status}>
          <MemberStatusBadge status={member.status} sanctions={sanctions} />
        </InfoRow>
        {member.withdrawnAt && (
          <InfoRow label={f.withdrawnAt}>
            <span className="font-mono text-body-md text-ink-muted">
              {formatDateTime(member.withdrawnAt)}
            </span>
          </InfoRow>
        )}
        {sanctions.length > 0 && (
          <InfoRow label={memberDetailCopy.activeSanctionsLabel}>
            <span className="flex flex-col items-end gap-1">
              {sanctions.map((s) => (
                <span
                  key={s.type}
                  className={`whitespace-nowrap text-body-md font-medium ${s.type === 'suspend' ? 'text-error' : 'text-amber-400'}`}
                >
                  {activeSanctionLabel(s)}
                </span>
              ))}
            </span>
          </InfoRow>
        )}
        <InfoRow label={f.joinedAt}>
          <span className="font-mono text-body-md text-ink">{formatDate(member.createdAt)}</span>
        </InfoRow>
      </dl>
    </Card>
  );
};
