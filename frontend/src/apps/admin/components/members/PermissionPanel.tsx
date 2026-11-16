import React from 'react';
import { memberDetailCopy, permissionLabels, ui } from '../../data/mockData';
import type { PermissionFormState } from '../../hooks/usePermissionForm';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { TextArea } from '../ui/FormControls';

interface PermissionPanelProps {
  readonly form: PermissionFormState;
}

/** 관리자가 줄 수 있는 추가 권한(지금은 content_manage)을 부여·회수한다 (API_SPEC 10.2, REQ-ADMIN-004). */
export const PermissionPanel: React.FC<PermissionPanelProps> = ({ form }) => {
  const c = memberDetailCopy;
  const disabledTitle = form.blockedReason ?? (form.canSubmit ? undefined : c.reasonRequired);

  return (
    <Card className="mt-6">
      <CardHeader icon="shield_person" title={c.permissionTitle} subtitle={c.permissionSubtitle} />

      <ul className="mt-5 space-y-2 rounded-lg border border-hairline bg-surface-2/60 p-4">
        {Object.entries(permissionLabels).map(([permission, label]) => {
          const isGranted = form.hasPermission(permission);
          return (
            <li key={permission} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-3">
                <span className="text-body-lg font-semibold text-ink">{label}</span>
                <Badge tone={isGranted ? 'success' : 'muted'} dot={isGranted}>
                  {isGranted ? c.permissionGranted : c.permissionNone}
                </Badge>
              </span>
              {isGranted ? (
                <Button
                  size="sm"
                  variant="danger"
                  icon="remove_moderator"
                  disabled={!form.canSubmit}
                  title={disabledTitle}
                  onClick={() => form.revoke(permission)}
                >
                  {c.permissionRevoke}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  icon="add_moderator"
                  disabled={!form.canSubmit}
                  title={disabledTitle}
                  onClick={() => form.grant(permission)}
                >
                  {c.permissionGrant}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5">
        <label htmlFor="permission-reason" className="mb-2 block text-body-lg text-ink-muted">
          {c.permissionReasonLabel}
        </label>
        <TextArea
          id="permission-reason"
          rows={2}
          maxLength={c.reasonMax}
          placeholder={c.permissionReasonPlaceholder}
          value={form.reason}
          disabled={form.blockedReason !== null}
          onChange={(event) => form.setReason(event.target.value)}
          className="bg-surface-2"
        />
        <div className="mt-2 flex items-center justify-end gap-3">
          {form.errorMessage && (
            <span role="alert" className="text-body-sm text-error">
              {form.errorMessage}
            </span>
          )}
          {form.blockedReason && (
            <span className="text-body-sm text-ink-subtle">{form.blockedReason}</span>
          )}
          <span className="font-mono text-code-sm text-ink-tertiary">
            {form.reason.length} / {c.reasonMax}
            {ui.charUnit}
          </span>
        </div>
      </div>
    </Card>
  );
};
