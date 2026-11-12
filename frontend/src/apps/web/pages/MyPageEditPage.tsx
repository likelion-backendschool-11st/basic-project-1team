import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusPill } from '../components/ui/StatusPill';
import { StatusMessage } from '../components/ui/StatusMessage';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { LinkButton } from '../components/ui/LinkButton';
import { PhotoUploader } from '../components/profile/PhotoUploader';
import { BioEditor } from '../components/profile/BioEditor';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { mypageEditContent as c, ROUTES } from '../data/mockData';

export const MyPageEditPage: React.FC = () => {
  const edit = useProfileEdit();

  return (
    <PageShell>
      <GlowCard className="flex flex-col gap-space-lg p-space-md sm:p-space-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <StatusPill label={c.meta} className="!px-2 !py-0.5" />
            <StatusPill label={c.synced} dot="success" textTone="success" background="none" />
          </div>
          <Link
            to={ROUTES.mypage}
            aria-label={c.closeLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <Icon name="close" className="text-[18px]" />
          </Link>
        </div>

        <PageHeader title={c.title} titleIcon="manage_accounts" description={c.description} />

        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-ink-muted">{c.photo.label}</span>
            <span className="font-label-code text-label-code text-ink-tertiary">{c.photo.hint}</span>
          </div>
          <PhotoUploader
            id="profile-upload"
            backgroundUrl={c.photo.backgroundUrl}
            previewUrl={edit.photoUrl}
            accept={c.photo.accept}
            emptyTitle={c.photo.emptyTitle}
            emptyDescription={c.photo.emptyDescription}
            hoverTitle={c.photo.hoverTitle}
            hoverDescription={c.photo.hoverDescription}
            onSelect={edit.selectPhoto}
          />
          {edit.photoError && <StatusMessage tone="danger" text={edit.photoError} />}
        </div>

        <BioEditor
          id="bio-input"
          label={c.bio.label}
          value={edit.bio}
          count={edit.bioCount}
          max={c.bio.max}
          unit={c.bio.unit}
          placeholder={c.bio.placeholder}
          help={c.bio.help}
          onChange={edit.setBio}
        />

        <div className="flex flex-col gap-space-sm pt-space-xs">
          <Button
            size="lg"
            icon="check"
            iconPosition="left"
            loading={edit.saving}
            onClick={edit.save}
            className="h-11 font-headline-sm text-headline-sm font-semibold"
          >
            {edit.saving ? c.saving : c.save}
          </Button>
          <LinkButton to={c.changePassword.to} icon="lock_reset" className="h-10 font-body-md text-body-md text-ink">
            {c.changePassword.label}
          </LinkButton>
          <div className="flex items-center justify-center pt-space-xs">
            <Link
              to={c.withdraw.to}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-body-sm text-body-sm text-ink-tertiary transition-colors hover:text-semantic-danger"
            >
              <Icon name="person_off" className="text-[16px]" />
              <span>{c.withdraw.label}</span>
            </Link>
          </div>
        </div>
      </GlowCard>
    </PageShell>
  );
};

export default MyPageEditPage;
