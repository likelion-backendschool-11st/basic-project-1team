import React, { Fragment } from 'react';
import { Icon } from './Icon';

interface StepperProps {
  readonly steps: readonly { readonly label: string; readonly caption: string }[];
  /** Zero-based index of the active step. */
  readonly current: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, current }) => (
  <ol className="flex w-full items-center justify-between pb-4">
    {steps.map((step, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <Fragment key={step.label}>
          {index > 0 && (
            <li aria-hidden="true" className="mx-3 h-[2px] flex-1 overflow-hidden rounded-full bg-hairline-strong/60">
              <div className={`h-full bg-primary-container transition-all duration-300 ${index <= current ? 'w-full' : 'w-0'}`} />
            </li>
          )}
          <li
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 ${!done && !active ? 'opacity-60' : ''}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full font-label-code text-label-code ${
                done
                  ? 'bg-semantic-success/20 text-semantic-success'
                  : active
                    ? 'bg-primary-container text-on-primary-container shadow-sm ring-2 ring-primary/30'
                    : 'bg-surface-2 text-ink-subtle'
              }`}
            >
              {done ? <Icon name="check" filled className="text-[16px]" /> : String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex flex-col">
              <span
                className={`font-label-md text-[11px] uppercase tracking-wider ${active ? 'text-primary' : 'text-ink-subtle'}`}
              >
                {step.label}
              </span>
              <span className={`font-body-sm text-body-sm ${active ? 'font-medium text-ink' : 'text-ink-muted'}`}>
                {step.caption}
              </span>
            </span>
          </li>
        </Fragment>
      );
    })}
  </ol>
);

export default Stepper;
