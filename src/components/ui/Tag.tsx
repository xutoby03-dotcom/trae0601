import { cn } from '../../lib/utils';

type TagVariant = 'purple' | 'pink' | 'gold' | 'green' | 'gray' | 'red';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  purple: 'tag-purple',
  pink: 'tag-pink',
  gold: 'tag-gold',
  green: 'tag-green',
  gray: 'tag-gray',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

export function Tag({ children, variant = 'purple', className }: TagProps) {
  return (
    <span className={cn('tag', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
