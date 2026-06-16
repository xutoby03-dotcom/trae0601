import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { PickupPoint } from '../../types';
import { cn } from '../../lib/utils';

interface PickupPointTabsProps {
  pickupPoints: PickupPoint[];
  currentPoint: string;
  onChange: (id: string) => void;
}

export function PickupPointTabs({ pickupPoints, currentPoint, onChange }: PickupPointTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
      {pickupPoints.map((point) => {
        const isActive = point.id === currentPoint;
        return (
          <button
            key={point.id}
            onClick={() => onChange(point.id)}
            className={cn(
              'relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
              isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600/40 to-accent-600/30 border border-primary-500/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {point.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
