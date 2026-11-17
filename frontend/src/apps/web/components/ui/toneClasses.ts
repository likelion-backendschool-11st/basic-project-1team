import type { Tone } from '../../data/mockData';

/** 상태 점 색. StatusPill과 GameTag가 함께 쓴다. */
export const DOT_CLASSES: Record<Tone, string> = {
  success: 'bg-semantic-success',
  danger: 'bg-semantic-danger',
  warning: 'bg-semantic-warning',
  tertiary: 'bg-tertiary',
  primary: 'bg-primary',
  neutral: 'bg-ink-tertiary',
};
