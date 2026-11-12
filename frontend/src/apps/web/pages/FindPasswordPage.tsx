import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Stepper } from '../components/ui/Stepper';
import { TextField } from '../components/ui/TextField';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { useFindPassword } from '../hooks/useFindPassword';
import { common, findPasswordContent as c, passwordResetSteps } from '../data/mockData';

export interface FindPasswordPageProps {}

export const FindPasswordPage: React.FC<FindPasswordPageProps> = () => {
  const form = useFindPassword();
  const invalid = form.error !== null;

  return (
    <PageShell>
      <GlowCard glow="single" className="p-6 sm:p-8">
        <div className="mb-8 border-b border-hairline/40 pb-2">
          <Stepper steps={passwordResetSteps} current={0} />
        </div>

        <PageHeader eyebrow={c.eyebrow} eyebrowTone="primary" title={c.title} description={c.description} className="mb-6" />

        <form className="space-y-5" onSubmit={form.submit} noValidate>
          <TextField
            id="reset-username"
            label={c.fields.username.label}
            hint={c.fields.username.hint}
            placeholder={c.fields.username.placeholder}
            rightIcon="person"
            autoComplete="username"
            value={form.username}
            onChange={(e) => form.setUsername(e.target.value)}
            invalid={invalid}
          />
          <TextField
            id="reset-email"
            type="email"
            label={c.fields.email.label}
            hint={c.fields.email.hint}
            placeholder={c.fields.email.placeholder}
            rightIcon="mail"
            autoComplete="email"
            value={form.email}
            onChange={(e) => form.setEmail(e.target.value)}
            invalid={invalid}
          />

          {form.error && <Alert>{form.error}</Alert>}

          <div className="flex items-center gap-3 pt-3">
            <Button variant="secondary" size="lg" onClick={form.cancel} className="!w-1/3">
              {common.cancel}
            </Button>
            <Button type="submit" size="lg" icon="arrow_forward" className="!w-2/3">
              {c.submit}
            </Button>
          </div>
        </form>
      </GlowCard>
    </PageShell>
  );
};

export default FindPasswordPage;
