import React from 'react';
import { Icon } from '../ui/Icon';

interface IconTileProps {
  readonly icon: string;
}

/** Rounded surface tile with a filled primary icon (change-password header). */
export const IconTile: React.FC<IconTileProps> = ({ icon }) => (
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-primary shadow-inner">
    <Icon name={icon} filled className="text-[28px]" />
  </div>
);
