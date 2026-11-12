import { memberDetailCopy, suspensionDurations } from '../../data/mockData';
import type { SanctionFormState } from '../../hooks/useSanctionForm';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { TextArea } from '../ui/FormControls';

interface SanctionPanelProps {
  readonly form: SanctionFormState;
}

export function SanctionPanel({ form }: SanctionPanelProps) {
  const c = memberDetailCopy;
  const suspended = form.status === 'suspended';

  return (
    <Card className="mt-6">
      <CardHeader
        icon="gavel"
        title={c.sanctionTitle}
        aside={
          <span className="text-body-sm text-ink-subtle">
            {c.currentStatus}:{' '}
            <strong className={suspended ? 'text-error' : 'text-tertiary'}>{suspended ? c.statusSuspended : c.statusActive}</strong>
          </span>
        }
      />

      <form onSubmit={form.suspend} className="mt-5 space-y-5">
        <fieldset disabled={suspended} className="disabled:opacity-50">
          <legend className="mb-2 text-body-lg text-ink-muted">{c.durationLabel}</legend>
          <div className="flex gap-6">
            {suspensionDurations.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-body-lg text-ink">
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={form.duration === option.value}
                  onChange={() => form.setDuration(option.value)}
                  className="h-4 w-4 border-hairline-strong bg-canvas text-primary-container focus:ring-primary-focus/50 focus:ring-offset-0"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="sanction-reason" className="mb-2 block text-body-lg text-ink-muted">
            {c.reasonLabel}
          </label>
          <TextArea
            id="sanction-reason"
            rows={3}
            maxLength={c.reasonMax}
            placeholder={c.reasonPlaceholder}
            value={form.reason}
            onChange={(event) => form.setReason(event.target.value)}
            className="bg-surface-2"
          />
          <p className="mt-2 text-right font-mono text-code-sm text-ink-tertiary">
            {form.reason.length} / {c.reasonMax}
            {c.charUnit}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" variant="danger" icon="block" disabled={!form.canSuspend} title={suspended ? c.alreadySuspended : undefined}>
            {c.suspend}
          </Button>
          <Button variant="secondary" icon="lock_open" disabled={!form.canUnsuspend} title={!suspended ? c.notSuspended : undefined} onClick={form.unsuspend}>
            {c.unsuspend}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default SanctionPanel;
