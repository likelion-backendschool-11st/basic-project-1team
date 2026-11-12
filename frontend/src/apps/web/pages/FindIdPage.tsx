import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { TextField } from '../components/ui/TextField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { AuthLinks } from '../components/auth/AuthLinks';
import { useFindId } from '../hooks/useFindId';
import { common, findIdContent as c } from '../data/mockData';

export const FindIdPage: React.FC = () => {
  const { name, setName, email, setEmail, result, submit, reset } = useFindId();

  return (
    <PageShell>
      <GlowCard className="space-y-6 p-6 sm:p-8">
        <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

        <form className="space-y-6" onSubmit={submit} noValidate>
          <div className="space-y-4">
            <TextField
              id="find-name"
              label={c.fields.name.label}
              hint={c.fields.name.hint}
              placeholder={c.fields.name.placeholder}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              id="find-email"
              type="email"
              label={c.fields.email.label}
              hint={c.fields.email.hint}
              placeholder={c.fields.email.placeholder}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {result.status === 'found' && (
            <Alert tone="neutral">
              <span className="flex flex-col gap-1 text-ink-muted sm:flex-row sm:items-center sm:gap-1.5">
                <span>{c.result.prefix}</span>
                <span className="w-fit rounded bg-surface-3 px-2 py-0.5 font-label-code text-label-code font-semibold tracking-wide text-secondary">
                  {result.maskedUsername}
                </span>
                <span>{c.result.suffix}</span>
              </span>
            </Alert>
          )}
          {result.status === 'notFound' && <Alert icon="cancel">{c.notFound}</Alert>}

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
            <Button variant="secondary" onClick={reset} className="order-2 sm:order-1 sm:flex-1">
              {common.cancel}
            </Button>
            <Button type="submit" icon="arrow_forward" className="order-1 sm:order-2 sm:flex-1">
              {c.submit}
            </Button>
          </div>
        </form>

        <div className="pt-4">
          <AuthLinks items={c.links} layout="between" />
        </div>
      </GlowCard>
    </PageShell>
  );
};

export default FindIdPage;
