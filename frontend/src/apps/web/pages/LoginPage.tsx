import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Alert } from '../components/ui/Alert';
import { TextField } from '../components/ui/TextField';
import { PasswordField } from '../components/ui/PasswordField';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { AuthLinks } from '../components/auth/AuthLinks';
import { HighlightRow } from '../components/auth/HighlightRow';
import { useLoginForm } from '../hooks/useLoginForm';
import { loginContent as c } from '../data/mockData';

export const LoginPage: React.FC = () => {
  const form = useLoginForm();

  return (
    <PageShell>
      <GlowCard
        accentLine
        glow="single"
        className="flex flex-col gap-space-lg p-space-lg sm:p-space-xl"
      >
        <PageHeader align="center" media={<BrandLogo />} title={c.title} description={c.subtitle} />

        {form.errorMessage !== null && (
          <Alert title={c.error.title} onDismiss={form.dismissError}>
            {form.errorMessage}
          </Alert>
        )}

        <form className="flex flex-col gap-space-md" onSubmit={form.submit} noValidate>
          <TextField
            id="username"
            name="username"
            label={c.fields.username.label}
            hint={c.fields.username.hint}
            placeholder={c.fields.username.placeholder}
            leftIcon="person"
            autoComplete="username"
            value={form.username}
            onChange={(e) => form.setUsername(e.target.value)}
            invalid={form.hasError}
          />
          <PasswordField
            id="password"
            name="password"
            label={c.fields.password.label}
            hint={c.fields.password.hint}
            placeholder={c.fields.password.placeholder}
            leftIcon="lock"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
            invalid={form.hasError}
          />

          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              id="remember-me"
              label={c.remember}
              checked={form.remember}
              onChange={form.setRemember}
            />
          </div>

          <Button type="submit" icon="arrow_forward" className="mt-2" disabled={form.submitting}>
            {c.submit}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-space-md pt-space-xs">
          <AuthLinks items={c.links} />
          <HighlightRow icon={c.teaser.icon} label={c.teaser.label} value={c.teaser.value} />
        </div>
      </GlowCard>
    </PageShell>
  );
};
