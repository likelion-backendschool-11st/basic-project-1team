import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { WarningBadge } from '../components/auth/WarningBadge';
import { NoticeList } from '../components/auth/NoticeList';
import { useWithdraw } from '../hooks/useWithdraw';
import { common, withdrawContent as c } from '../data/mockData';

export const WithdrawPage: React.FC = () => {
  const { agreed, setAgreed, confirm, cancel } = useWithdraw();

  return (
    <PageShell>
      <GlowCard
        glow="danger"
        className="flex flex-col items-center p-space-lg text-center md:p-space-xl"
      >
        <div className="mb-space-lg">
          <WarningBadge />
        </div>
        <h1 className="mb-space-xs font-headline-md text-headline-md tracking-tight text-ink">
          {c.title}
        </h1>
        <p className="mb-space-lg font-body-md text-body-md text-semantic-danger">{c.warning}</p>

        <div className="mb-space-lg w-full">
          <NoticeList title={c.notice.title} meta={c.notice.meta} items={c.notice.items} />
        </div>

        <div className="mb-space-lg w-full text-left">
          <Checkbox
            id="confirm-check"
            variant="card"
            tone="danger"
            label={c.agreement}
            checked={agreed}
            onChange={setAgreed}
          />
        </div>

        <div className="flex w-full flex-col gap-space-sm sm:flex-row-reverse">
          <Button
            variant="danger"
            size="lg"
            icon="person_remove"
            iconPosition="left"
            disabled={!agreed}
            onClick={confirm}
          >
            {c.confirm}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon="arrow_back"
            iconPosition="left"
            onClick={cancel}
            className="text-ink"
          >
            {common.cancel}
          </Button>
        </div>
      </GlowCard>
    </PageShell>
  );
};
