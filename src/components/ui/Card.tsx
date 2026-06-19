import { ReactNode, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function Card({ title, footer, children, hoverable = false, className, onClick }: CardProps) {
  return (
    <motion.div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        hoverable && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)' } : {}}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">{footer}</div>
      )}
    </motion.div>
  );
}
