import React from 'react';
import { Icon } from '../ui/Icon';

interface NoticeListProps {
  readonly title: string;
  readonly meta?: string;
  readonly items: readonly string[];
}

/** Withdrawal consequences list. */
export const NoticeList: React.FC<NoticeListProps> = ({ title, meta, items }) => (
  <section className="w-full space-y-space-sm rounded-lg bg-surface-2 p-space-md text-left">
    <div className="flex items-center justify-between pb-space-xs">
      <h2 className="flex items-center gap-1.5 font-label-md text-label-md text-ink-muted">
        <Icon name="info" className="text-[16px] text-semantic-warning" />
        {title}
      </h2>
      {meta && <span className="font-label-code text-label-code text-ink-tertiary">{meta}</span>}
    </div>
    <ul className="space-y-space-xs font-body-sm text-body-sm text-ink-subtle">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <Icon name="close" className="mt-0.5 shrink-0 text-[14px] text-ink-tertiary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default NoticeList;
