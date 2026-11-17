import React from 'react';
import { editCautions as C } from '../../data/mockData';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';

interface EditCautionsCardProps {
  readonly className?: string;
}

const dot = { primary: 'bg-primary', tertiary: 'bg-tertiary', secondary: 'bg-secondary' } as const;

export const EditCautionsCard: React.FC<EditCautionsCardProps> = ({ className = '' }) => (
  <Card bordered={false} className={`p-space-md flex flex-col gap-space-sm ${className}`}>
    <h3 className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
      <Icon name="rule" className="text-[18px] text-primary" />
      {C.title}
    </h3>
    <div className="flex flex-col gap-space-sm font-body-sm text-body-sm text-ink-muted">
      {C.items.map((item) => (
        <div key={item.title} className="flex items-start gap-space-xs">
          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dot[item.tone]}`} />
          <div>
            <strong className="text-ink font-medium">{item.title}</strong>
            <p className="text-ink-subtle mt-0.5">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
