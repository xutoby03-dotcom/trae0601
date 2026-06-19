import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function Empty({
  icon,
  title = '暂无数据',
  description = '这里还没有任何内容',
  action,
  className,
}: EmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        {icon || <Package size={32} className="text-muted-foreground" />}
      </motion.div>
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="text-sm text-muted-foreground mb-6 max-w-sm"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
