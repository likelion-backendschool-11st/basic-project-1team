import React from 'react';
import { PageShell } from '../components/ui/PageShell';
import { GlowCard } from '../components/ui/GlowCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Stepper } from '../components/ui/Stepper';
import { PasswordField } from '../components/ui/PasswordField';
import { StrengthMeter } from '../components/ui/StrengthMeter';
import { StatusMessage } from '../components/ui/StatusMessage';
import { InfoNote } from '../components/ui/InfoNote';
import { Button } from '../components/ui/Button';
import { IconTile } from '../components/auth/IconTile';
import { useChangePassword } from '../hooks/useChangePassword';
import { changePasswordContent as c, common, passwordResetSteps } from '../data/mockData';

export const ChangePasswordPage: React.FC = () => {
  const form = useChangePassword();

  return (
    <PageShell>
      <GlowCard className="flex flex-col gap-6 p-6 sm:p-8">
        {form.mode === 'reset' && <Stepper steps={passwordResetSteps} current={1} />}

        <PageHeader align="center" media={<IconTile icon="lock_reset" />} title={c.title} description={c.description} className="pt-2" />

        <form className="mt-2 flex flex-col gap-4" onSubmit={form.submit} noValidate>
          {form.mode === 'loggedIn' && (
            <div className="flex flex-col gap-1.5">
              <PasswordField
                id="current-password"
                label={c.fields.current.label}
                placeholder={c.fields.current.placeholder}
                leftIcon="lock"
                autoComplete="current-password"
                value={form.current}
                onChange={(e) => form.setCurrent(e.target.value)}
                invalid={form.currentError !== null}
              />
              {form.currentError && (
                <div className="px-1" aria-live="polite">
                  <StatusMessage tone="danger" text={form.currentError} />
                </div>
              )}
            </div>
          )}

          <PasswordField
            id="new-password"
            label={c.fields.password.label}
            hint={c.fields.password.hint}
            placeholder={c.fields.password.placeholder}
            leftIcon="key"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => form.setPassword(e.target.value)}
          >
            <StrengthMeter score={form.strength} labels={c.strength.labels} />
          </PasswordField>

          <PasswordField
            id="confirm-password"
            label={c.fields.confirm.label}
            placeholder={c.fields.confirm.placeholder}
            leftIcon="check_circle"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => form.setConfirm(e.target.value)}
            invalid={form.confirmState === 'mismatch'}
          />

          <div className="flex min-h-[22px] items-center px-1" aria-live="polite">
            {form.confirmState === 'mismatch' && <StatusMessage tone="danger" text={common.passwordMismatch} />}
            {form.confirmState === 'match' && <StatusMessage tone="success" text={common.passwordMatch} />}
            {form.confirmState === 'hint' && <StatusMessage text={c.messages.hint} />}
          </div>

          <InfoNote icon="shield" primary={c.notice.primary} secondary={c.notice.secondary} />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" size="lg" icon="arrow_back" iconPosition="left" onClick={form.cancel}>
              {common.cancel}
            </Button>
            <Button type="submit" size="lg" icon="arrow_forward" loading={form.submitting}>
              {form.submitting ? c.submitting : c.submit}
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between pt-2 font-label-code text-[11px] text-ink-tertiary">
          <span>{c.footer.code}</span>
          <span>{c.footer.support}</span>
        </div>
      </GlowCard>
    </PageShell>
  );
};
