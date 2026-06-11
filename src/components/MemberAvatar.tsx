import { User } from 'lucide-react';
import { cn } from '../lib/utils';

interface MemberAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export default function MemberAvatar({
  name,
  color,
  size = 'md',
  showName = false,
  className,
}: MemberAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold transition-all duration-300',
          sizeClasses[size],
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          boxShadow: `0 0 20px ${color}60`,
          border: `2px solid ${color}`,
        }}
      >
        {name ? (
          <span className="text-white drop-shadow-md">{name.charAt(0)}</span>
        ) : (
          <User className={cn('text-white', iconSizeClasses[size])} />
        )}
      </div>
      {showName && <span className="font-medium text-white">{name}</span>}
    </div>
  );
}
