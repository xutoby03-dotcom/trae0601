import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-5 transition-all',
        hover && 'cursor-pointer hover:border-cyan-glow/30 hover:shadow-cyan-glow/10 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
