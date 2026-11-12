import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { BrandLogo } from '../components/ui/BrandLogo';
import { TextField } from '../components/ui/TextField';
import { PasswordField } from '../components/ui/PasswordField';
import { StatusMessage } from '../components/ui/StatusMessage';
import { Button } from '../components/ui/Button';
import { DuplicateCheckField } from '../components/auth/DuplicateCheckField';
import { useSignupForm } from '../hooks/useSignupForm';
import { common, signupContent as c } from '../data/mockData';

export const SignupPage: React.FC = () => {
  const form = useSignupForm();
  const f = c.fields;

  return (
    <PageShell>
      <GlowCard className="p-space-md sm:p-space-xl">
        <PageHeader align="center" media={<BrandLogo />} title={c.title} description={c.subtitle} className="mb-space-lg" />

        <form className="space-y-space-md" onSubmit={form.submit} noValidate>
          <TextField
            id="user-name"
            name="name"
            label={f.name.label}
            required
            autoComplete="name"
            placeholder={f.name.placeholder}
            value={form.name}
            onChange={(e) => form.setName(e.target.value)}
            invalid={form.nameError !== null}
          >
            {form.nameError && <StatusMessage tone="danger" text={form.nameError} />}
          </TextField>

          <DuplicateCheckField
            id="user-id"
            label={f.username.label}
            placeholder={f.username.placeholder}
            buttonLabel={c.checkButton}
            autoComplete="username"
            field={form.username}
          />

          <DuplicateCheckField
            id="user-nickname"
            label={f.nickname.label}
            placeholder={f.nickname.placeholder}
            buttonLabel={c.checkButton}
            autoComplete="nickname"
            field={form.nickname}
          />

          <PasswordField
            id="user-password"
            name="password"
            label={f.password.label}
            required
            autoComplete="new-password"
            placeholder={f.password.placeholder}
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
            invalid={form.passwordError !== null}
          >
            {form.passwordError && <StatusMessage tone="danger" text={form.passwordError} />}
          </PasswordField>

          <PasswordField
            id="user-password-confirm"
            name="passwordConfirm"
            label={f.passwordConfirm.label}
            required
            autoComplete="new-password"
            placeholder={f.passwordConfirm.placeholder}
            value={form.passwordConfirm}
            onChange={(e) => form.setPasswordConfirm(e.target.value)}
            invalid={form.matchState === 'mismatch'}
          >
            {form.matchState !== 'idle' && (
              <StatusMessage
                tone={form.matchState === 'match' ? 'success' : 'danger'}
                text={form.matchState === 'match' ? common.passwordMatch : common.passwordMismatch}
              />
            )}
          </PasswordField>

          <DuplicateCheckField
            id="user-email"
            type="email"
            label={f.email.label}
            placeholder={f.email.placeholder}
            buttonLabel={c.checkButton}
            autoComplete="email"
            field={form.email}
          />

          <div className="space-y-2.5 pt-space-sm">
            <Button type="submit" size="lg" icon="arrow_forward">
              {c.submit}
            </Button>
            <Button variant="secondary" onClick={form.cancel}>
              {common.cancel}
            </Button>
          </div>
        </form>

        <p className="mt-space-md pt-space-sm text-center font-body-sm text-body-sm text-ink-subtle">
          {c.footerPrompt}
          <Link to={c.footerLink.to} className="ml-1 font-medium text-primary hover:underline">
            {c.footerLink.label}
          </Link>
        </p>
      </GlowCard>
    </PageShell>
  );
};

export default SignupPage;
