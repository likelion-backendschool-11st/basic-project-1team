import React from 'react';

interface IconProps {
  readonly name: string;
  readonly className?: string;
}

/** Material Symbols Outlined 아이콘. 크기는 className 의 `text-[Npx]` 로 정한다. */
export const Icon: React.FC<IconProps> = ({ name, className = '' }) => (
  <span aria-hidden="true" className={`material-symbols-outlined select-none ${className}`}>
    {name}
  </span>
);
