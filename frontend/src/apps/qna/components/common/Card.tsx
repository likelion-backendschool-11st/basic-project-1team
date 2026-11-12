import React from 'react';

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'article' | 'aside';
  readonly bordered?: boolean;
  readonly id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', as: Tag = 'div', bordered = true, id }) => (
  <Tag id={id} className={`bg-surface-1 rounded-xl shadow-sm ${bordered ? 'border border-hairline' : ''} ${className}`}>
    {children}
  </Tag>
);

export default Card;
