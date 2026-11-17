import React from 'react';
import { SITE_URL } from '../adminSite';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Checkbox, FieldLabel, TextInput } from '../components/ui/FormControls';
import { Icon } from '../components/ui/Icon';
import { adminLoginCopy as c, brand } from '../data/mockData';
import { useAdminLogin } from '../hooks/useAdminLogin';

/**
 * 관리자 사이트 로그인 (REQ-ADMIN-001). 사용자 사이트와 로그인을 공유하지 않으므로 여기서 따로 로그인한다.
 * 회원가입·아이디/비밀번호 찾기는 사용자 사이트에서 한다.
 */
export const LoginPage: React.FC = () => {
  const form = useAdminLogin();

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-ink">
      <Card className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <Icon name={brand.logoIcon} />
          </span>
          <div>
            <h1 className="text-headline-md font-bold text-ink">
              {brand.name} <span className="text-primary">{brand.badge}</span>
            </h1>
            <p className="mt-1 text-body-md text-ink-subtle">{c.description}</p>
          </div>
        </div>

        <form onSubmit={form.submit} className="space-y-4" noValidate>
          <div>
            <FieldLabel htmlFor="admin-login-id">{c.loginIdLabel}</FieldLabel>
            <TextInput
              id="admin-login-id"
              leadingIcon="person"
              placeholder={c.loginIdPlaceholder}
              autoComplete="username"
              autoFocus
              value={form.loginId}
              onChange={(event) => form.setLoginId(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="admin-password">{c.passwordLabel}</FieldLabel>
            <TextInput
              id="admin-password"
              type="password"
              leadingIcon="lock"
              placeholder={c.passwordPlaceholder}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => form.setPassword(event.target.value)}
            />
          </div>
          <Checkbox label={c.remember} checked={form.remember} onChange={form.setRemember} />

          {form.errorMessage && (
            <p role="alert" className="text-body-md text-error">
              {form.errorMessage}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={!form.canSubmit}>
            {c.submit}
          </Button>
        </form>

        <a
          href={SITE_URL}
          className="mt-6 flex items-center justify-center gap-1 text-body-sm text-ink-subtle hover:text-ink"
        >
          {c.toSite}
          <Icon name="arrow_forward" className="!text-[16px]" />
        </a>
      </Card>
    </main>
  );
};
