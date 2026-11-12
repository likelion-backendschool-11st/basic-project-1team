import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityStatsCard } from '../components/members/ActivityStatsCard';
import { MemberInfoCard } from '../components/members/MemberInfoCard';
import { SanctionHistoryCard } from '../components/members/SanctionHistoryCard';
import { SanctionPanel } from '../components/members/SanctionPanel';
import { Icon } from '../components/ui/Icon';
import { defaultMemberActivity, memberActivity, memberDetailCopy, members, sanctionHistory } from '../data/mockData';
import { useSanctionForm } from '../hooks/useSanctionForm';
import type { Member } from '../types';

interface MemberDetailContentProps {
  readonly member: Member;
}

const BackLink: React.FC = () => {
  return (
    <Link to="/members" className="mb-3 inline-flex items-center gap-1 text-body-lg text-ink-subtle transition-colors hover:text-ink">
      <Icon name="arrow_back" />
      {memberDetailCopy.back}
    </Link>
  );
};

const MemberDetailContent: React.FC<MemberDetailContentProps> = ({ member }) => {
  const form = useSanctionForm(member, sanctionHistory[member.id] ?? []);
  return (
    <>
      <BackLink />
      <h1 className="mb-6 flex items-center gap-3 text-[28px] font-bold tracking-tight text-ink">
        {memberDetailCopy.title}
        <span className="text-ink-tertiary">|</span>
        <span className="text-headline-md font-medium text-ink-muted">{member.nickname}</span>
      </h1>

      <div className="grid grid-cols-12 gap-6">
        <MemberInfoCard member={member} sanctions={form.sanctions} />
        <ActivityStatsCard activity={memberActivity[member.id] ?? defaultMemberActivity} />
      </div>

      <SanctionPanel form={form} />
      <SanctionHistoryCard history={form.history} />
    </>
  );
};

export const MemberDetailPage: React.FC = () => {
  const { id } = useParams();
  const member = members.find((m) => String(m.id) === id);

  if (!member) {
    return (
      <>
        <BackLink />
        <p className="py-20 text-center text-body-lg text-ink-subtle">{memberDetailCopy.notFound}</p>
      </>
    );
  }

  // key resets the sanction form when navigating between members.
  return <MemberDetailContent key={member.id} member={member} />;
};
