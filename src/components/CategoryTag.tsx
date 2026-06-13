import { Droplets, UtensilsCrossed, Heart, Tent, MoreHorizontal } from 'lucide-react';
import type { SupplyCategory } from '@/types';

interface Props {
  category: SupplyCategory;
  size?: 'sm' | 'md';
}

const config: Record<SupplyCategory, { className: string; label: string; Icon: typeof Droplets }> = {
  water: { className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200', label: '水', Icon: Droplets },
  food: { className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', label: '食品', Icon: UtensilsCrossed },
  first_aid: { className: 'bg-firstaid-50 text-firstaid-600 ring-1 ring-inset ring-firstaid-200', label: '急救', Icon: Heart },
  equipment: { className: 'bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-200', label: '装备', Icon: Tent },
  other: { className: 'bg-parchment-200 text-earth-700 ring-1 ring-inset ring-parchment-300', label: '其他', Icon: MoreHorizontal },
};

export default function CategoryTag({ category, size = 'sm' }: Props) {
  const { className, label, Icon } = config[category];
  const iconSize = size === 'sm' ? 12 : 14;
  return (
    <span className={`tag ${className}`}>
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
