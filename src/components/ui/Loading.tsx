import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'default';

export interface LoadingProps {
  size?: LoadingSize;
  fullscreen?: boolean;
  text?: string;
  className?: string;
  variant?: LoadingVariant;
}

const sizeClasses: Record<LoadingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const textSizeClasses: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export default function Loading({ size = 'md', fullscreen = false, text, className }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
        <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
        {text && <p className={cn('text-gray-600', textSizeClasses[size])}>{text}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 py-8', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
      {text && <p className={cn('text-gray-600', textSizeClasses[size])}>{text}</p>}
    </div>
  );
}
