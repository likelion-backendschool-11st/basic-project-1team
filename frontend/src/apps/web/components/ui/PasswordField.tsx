import React from 'react';
import { TextField } from './TextField';
import { Icon } from './Icon';
import { useToggle } from '../../hooks/useToggle';
import { common } from '../../data/mockData';

type TextFieldProps = React.ComponentProps<typeof TextField>;

interface PasswordFieldProps extends Readonly<
  Omit<TextFieldProps, 'type' | 'rightSlot' | 'rightIcon'>
> {}

/** TextField with a show/hide password toggle. */
export const PasswordField: React.FC<PasswordFieldProps> = (props) => {
  const [visible, toggleVisible] = useToggle(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={toggleVisible}
          aria-label={common.togglePasswordLabel}
          aria-pressed={visible}
          className="flex items-center justify-center rounded p-1 text-ink-tertiary transition-colors hover:bg-surface-3 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[18px]" />
        </button>
      }
    />
  );
};
