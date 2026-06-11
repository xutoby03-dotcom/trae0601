import { Ticket, ShoppingBag, Globe, Sparkles, MoreHorizontal } from 'lucide-react';
import type { PlatformType } from '../types';
import { PLATFORM_INFO } from '../types';
import { cn } from '../lib/utils';

interface PlatformIconProps {
  platform: PlatformType;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const iconMap: Record<PlatformType, typeof Ticket> = {
  damai: Ticket,
  maoyan: ShoppingBag,
  piaoxingqiu: Sparkles,
  fenwandao: Globe,
  others: MoreHorizontal,
};

export default function PlatformIcon({
  platform,
  size = 'md',
  showName = false,
  className,
}: PlatformIconProps) {
  const Icon = iconMap[platform];
  const info = PLATFORM_INFO[platform];

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const containerSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          containerSizeClasses[size],
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${info.color}20, ${info.color}40)`,
          border: `2px solid ${info.color}`,
          boxShadow: `0 0 15px ${info.color}40`,
        }}
      >
        <Icon className={sizeClasses[size]} style={{ color: info.color }} />
      </div>
      {showName && (
        <span className="font-medium" style={{ color: info.color }}>
          {info.name}
        </span>
      )}
    </div>
  );
}
