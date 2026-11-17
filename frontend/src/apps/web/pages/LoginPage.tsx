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
import { StatusMessage } from '../components/ui/StatusMessage';
import { Toast } from '../components/ui/Toast';
import { AuthLinks } from '../components/auth/AuthLinks';
import { useFlashToast } from '../hooks/useFlashToast';
import { useLoginForm } from '../hooks/useLoginForm';
import { common, loginContent as c } from '../data/mockData';

export const LoginPage: React.FC = () => {
  const form = useLoginForm();
  const toast = useFlashToast();

  return (
    <PageShell>
      {toast.message && (
        <Toast message={toast.message} closeLabel={common.dismissLabel} onClose={toast.dismiss} />
      )}
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
          <div className="flex flex-col gap-1.5">
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
              invalid={form.hasError || form.usernameError !== null}
            />
            {form.usernameError && (
              <div className="px-1" aria-live="polite">
                <StatusMessage tone="danger" text={form.usernameError} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
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
              invalid={form.hasError || form.passwordError !== null}
            />
            {form.passwordError && (
              <div className="px-1" aria-live="polite">
                <StatusMessage tone="danger" text={form.passwordError} />
              </div>
            )}
          </div>

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
        </div>
      </GlowCard>
    </PageShell>
  );
};
