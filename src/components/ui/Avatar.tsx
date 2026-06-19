import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-14 h-14 text-3xl',
};

function isImageUrl(str: string): boolean {
  return /^https?:\/\//i.test(str);
}

export default function Avatar({
  src,
  alt = '',
  fallback = '?',
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (src && isImageUrl(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover border-2 border-primary/20',
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden',
        sizeClass,
        className
      )}
    >
      {src ? (
        <span className={cn(size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-sm')}>
          {src}
        </span>
      ) : (
        <span className="font-semibold text-primary">
          {fallback}
        </span>
      )}
    </div>
  );
}
