import { Camera, CircleDot, Zap, Video, HardDrive, Battery, Plug, Cable } from 'lucide-react';
import type { EquipmentType } from '../../types';

interface EquipmentTypeIconProps {
  type: EquipmentType;
  size?: number;
  className?: string;
}

const iconMap: Record<EquipmentType, typeof Camera> = {
  camera: Camera,
  lens: CircleDot,
  flash: Zap,
  stabilizer: Video,
  memory_card: HardDrive,
  battery: Battery,
  charger: Plug,
  cable: Cable,
};

export function EquipmentTypeIcon({ type, size = 20, className = '' }: EquipmentTypeIconProps) {
  const Icon = iconMap[type];
  return <Icon size={size} className={className} />;
}
