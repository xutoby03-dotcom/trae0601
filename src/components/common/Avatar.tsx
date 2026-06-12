import { cn } from '@/lib/utils';
import type { Person } from '@/types';

interface AvatarProps {
  person?: Person;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ person, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-12 h-12 text-xl',
  };

  const getInitial = () => {
    if (person?.avatar) return person.avatar;
    if (person?.name) return person.name.charAt(0);
    return '?';
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-rose-goldLight to-rose-gold text-white font-medium shadow-sm',
        sizeClasses[size],
        className
      )}
      title={person?.name}
    >
      {getInitial()}
    </div>
  );
}

interface AvatarGroupProps {
  people: Person[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ people, max = 3, size = 'md', className }: AvatarGroupProps) {
  const visiblePeople = people.slice(0, max);
  const remaining = people.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visiblePeople.map((person, index) => (
        <Avatar key={person.id} person={person} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center rounded-full bg-warm-200 text-warm-600 font-medium border-2 border-white',
            size === 'sm' && 'w-7 h-7 text-xs',
            size === 'md' && 'w-9 h-9 text-sm',
            size === 'lg' && 'w-12 h-12 text-base'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
