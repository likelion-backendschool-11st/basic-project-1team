import React from 'react';
import { Icon } from './Icon';

interface SectionHeaderProps {
  readonly label: string;
  readonly icon?: string;
  readonly meta?: React.ReactNode;
  readonly metaTone?: 'muted' | 'accent';
  readonly htmlFor?: string;
}

/** Label row above a panel: "소개글 · PROFILE BIO". */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, icon, meta, metaTone = 'muted', htmlFor }) => {
  const LabelTag = htmlFor ? 'label' : 'span';
  return (
    <div className="flex items-center justify-between px-1">
      <LabelTag htmlFor={htmlFor} className="flex items-center gap-1.5 font-label-md text-label-md text-ink-subtle">
        {icon && <Icon name={icon} className="text-[16px]" />}
        {label}
      </LabelTag>
      {meta && (
        <span className={`font-label-code text-label-code ${metaTone === 'accent' ? 'text-secondary' : 'text-ink-tertiary'}`}>
          {meta}
        </span>
      )}
    </div>
  );
};

export default SectionHeader;
