import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const iconSizeClasses: Record<AvatarSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const colors = [
  'bg-primary-100 text-primary-700',
  'bg-secondary-100 text-secondary-700',
  'bg-success/10 text-success',
  'bg-warning/10 text-warning',
  'bg-info/10 text-info',
  'bg-danger/10 text-danger',
];

function getColorByName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }

  const bgColor = name ? getColorByName(name) : 'bg-gray-100 text-gray-500';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium',
        sizeClasses[size],
        bgColor,
        className,
      )}
    >
      {name ? (
        getInitials(name)
      ) : (
        <User className={cn('text-gray-400', iconSizeClasses[size])} />
      )}
    </div>
  );
}
