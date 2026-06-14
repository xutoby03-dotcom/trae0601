import {
  Footprints,
  Bird,
  PersonStanding,
  Waves,
  Bike,
  Dribbble,
  CircleDot,
  Target,
  Dumbbell,
  Package,
} from 'lucide-react';
import type { SportType } from '@/types';
import { SPORT_TYPE_ICONS } from '@/types';

interface SportIconProps {
  type: SportType;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Footprints,
  Bird,
  PersonStanding,
  Waves,
  Bike,
  Dribbble,
  CircleDot,
  Target,
  Dumbbell,
  Package,
};

export const SportIcon = ({ type, size = 20, className = '' }: SportIconProps) => {
  const iconName = SPORT_TYPE_ICONS[type];
  const IconComponent = iconMap[iconName] || Package;
  return <IconComponent size={size} className={className} />;
};
