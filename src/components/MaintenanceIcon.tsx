import {
  Sparkles,
  RefreshCw,
  Wind,
  ShoppingBag,
  Archive,
  AlertCircle,
} from 'lucide-react';
import type { MaintenanceAction } from '@/types';
import { MAINTENANCE_ACTION_ICONS } from '@/types';

interface MaintenanceIconProps {
  action: MaintenanceAction;
  size?: number;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  RefreshCw,
  Wind,
  ShoppingBag,
  Archive,
  AlertCircle,
};

export const MaintenanceIcon = ({ action, size = 18, className = '' }: MaintenanceIconProps) => {
  const iconName = MAINTENANCE_ACTION_ICONS[action];
  const IconComponent = iconMap[iconName] || AlertCircle;
  return <IconComponent size={size} className={className} />;
};
