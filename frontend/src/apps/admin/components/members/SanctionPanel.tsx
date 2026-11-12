import { memberDetailCopy, sanctionDurations, sanctionTypeHints, sanctionTypeOptions } from '../../data/mockData';
import type { SanctionFormState } from '../../hooks/useSanctionForm';
import { activeSanctionLabel } from '../../sanction';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CardHeader } from '../ui/CardHeader';
import { TextArea } from '../ui/FormControls';

interface SanctionPanelProps {
  readonly form: SanctionFormState;
}

interface RadioGroupProps<V extends string> {
  readonly name: string;
  readonly legend: string;
  readonly options: readonly { readonly value: V; readonly label: string }[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly hint?: string;
}

function RadioGroup<V extends string>({ name, legend, options, value, onChange, hint }: RadioGroupProps<V>) {
  return (
    <fieldset>
      <legend className="mb-2 text-body-lg text-ink-muted">{legend}</legend>
      <div className="flex flex-wrap items-center gap-6">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-body-lg text-ink">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 border-hairline-strong bg-canvas text-primary-container focus:ring-primary-focus/50 focus:ring-offset-0"
            />
            {option.label}
          </label>
        ))}
        {hint && <span className="text-body-sm text-ink-subtle">{hint}</span>}
      </div>
    </fieldset>
  );
}

/** 제재 종류(정지·글쓰기 제한·댓글 제한)와 기간(3·7·30일·영구)을 골라 적용하고, 적용 중인 제재를 해제한다. */
export function SanctionPanel({ form }: SanctionPanelProps) {
  const c = memberDetailCopy;
  const statusTone = form.status === 'suspended' ? 'text-error' : form.status === 'restricted' ? 'text-amber-400' : 'text-tertiary';
  const applyTitle = form.protectedAccount ? c.adminProtected : form.alreadyActive ? c.alreadyActive : undefined;

  return (
    <Card className="mt-6">
      <CardHeader
        icon="gavel"
        title={c.sanctionTitle}
        aside={
          <span className="text-body-sm text-ink-subtle">
            {c.currentStatus}:{' '}
            <strong className={statusTone}>
              {form.sanctions.length === 0 ? c.statusActive : form.sanctions.map(activeSanctionLabel).join(', ')}
            </strong>
          </span>
        }
      />

      <div className="mt-5 rounded-lg border border-hairline bg-surface-2/60 p-4">
        <p className="mb-3 text-label-sm text-ink-muted">{c.activeSanctionsLabel}</p>
        {form.sanctions.length === 0 ? (
          <p className="text-body-md text-ink-subtle">{c.noActiveSanctions}</p>
        ) : (
          <ul className="space-y-2">
            {form.sanctions.map((s) => (
              <li key={s.type} className="flex items-center justify-between gap-4">
                <span className={`text-body-lg font-semibold ${s.type === 'suspend' ? 'text-error' : 'text-amber-400'}`}>
                  {activeSanctionLabel(s)}
                  {s.until && c.untilSuffix}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="lock_open"
                  disabled={!form.canRelease}
                  title={!form.canRelease ? c.reasonRequired : undefined}
                  onClick={() => form.release(s.type)}
                >
                  {c.release}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={form.apply} className="mt-5 space-y-5">
        <RadioGroup
          name="sanction-type"
          legend={c.typeLabel}
          options={sanctionTypeOptions}
          value={form.type}
          onChange={form.setType}
          hint={sanctionTypeHints[form.type]}
        />
        <RadioGroup name="sanction-duration" legend={c.durationLabel} options={sanctionDurations} value={form.duration} onChange={form.setDuration} />

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

        <div className="flex items-center justify-end gap-3">
          {applyTitle && <span className="text-body-sm text-ink-subtle">{applyTitle}</span>}
          <Button type="submit" variant="danger" icon="block" disabled={!form.canApply} title={applyTitle}>
            {c.apply}
          </Button>
        </div>
      </form>
    </Card>
  );
}
