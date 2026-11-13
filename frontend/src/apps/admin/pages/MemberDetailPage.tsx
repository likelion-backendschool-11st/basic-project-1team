import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityStatsCard } from '../components/members/ActivityStatsCard';
import { MemberInfoCard } from '../components/members/MemberInfoCard';
import { SanctionHistoryCard } from '../components/members/SanctionHistoryCard';
import { SanctionPanel } from '../components/members/SanctionPanel';
import { Icon } from '../components/ui/Icon';
import { memberDetailCopy, membersCopy, ui } from '../data/mockData';
import { useMemberDetail } from '../hooks/useMemberDetail';
import { useSanctionForm } from '../hooks/useSanctionForm';
import type { MemberDetail } from '../types';

interface MemberDetailContentProps {
  readonly member: MemberDetail;
  readonly onUpdated: (member: MemberDetail) => void;
}

const BackLink: React.FC = () => {
  return (
    <Link
      to="/members"
      className="mb-3 inline-flex items-center gap-1 text-body-lg text-ink-subtle transition-colors hover:text-ink"
    >
      <Icon name="arrow_back" />
      {memberDetailCopy.back}
    </Link>
  );
};

const Message: React.FC<{ readonly children: string }> = ({ children }) => {
  return (
    <>
      <BackLink />
      <p className="py-20 text-center text-body-lg text-ink-subtle">{children}</p>
    </>
  );
};

const MemberDetailContent: React.FC<MemberDetailContentProps> = ({ member, onUpdated }) => {
  const form = useSanctionForm(member, onUpdated);
  return (
    <>
      <BackLink />
      <h1 className="mb-6 flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink">
        {memberDetailCopy.title}
        <span className="text-ink-tertiary">|</span>
        <span className="text-headline-md font-medium text-ink-muted">
          {member.nickname ?? membersCopy.withdrawnName}
        </span>
      </h1>

      <div className="grid grid-cols-12 gap-6">
        <MemberInfoCard member={member} />
        <ActivityStatsCard activity={member.activity} />
      </div>

      <SanctionPanel member={member} form={form} />
      <SanctionHistoryCard history={member.sanctionHistory} />
    </>
  );
};

/** 주소의 id 가 1 이상의 정수가 아니면 서버에 묻지 않고 없는 회원으로 본다 (API_SPEC 1.3) */
const toUserId = (id: string | undefined): number | null =>
  id !== undefined && /^[1-9]\d*$/.test(id) ? Number(id) : null;

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams();
  const detail = useMemberDetail(toUserId(id));

  if (detail.notFound) return <Message>{memberDetailCopy.notFound}</Message>;
  if (detail.errorMessage) return <Message>{detail.errorMessage}</Message>;
  if (detail.loading || !detail.member) return <Message>{ui.loading}</Message>;

  // key resets the sanction form when navigating between members.
  return (
    <MemberDetailContent key={detail.member.id} member={detail.member} onUpdated={detail.replace} />
  );
};
