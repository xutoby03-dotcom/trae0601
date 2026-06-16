import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

const colorClasses = [
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-blue-500 to-purple-500',
  'bg-gradient-to-br from-pink-500 to-orange-500',
  'bg-gradient-to-br from-green-500 to-teal-500',
  'bg-gradient-to-br from-yellow-500 to-orange-500',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorClasses[Math.abs(hash) % colorClasses.length];
}

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const colorClass = getColorFromName(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-white/10',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white/10',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {name ? initials : <User className="w-1/2 h-1/2" />}
    </div>
  );
}
