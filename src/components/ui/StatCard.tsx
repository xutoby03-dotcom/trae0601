import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'purple' | 'pink' | 'gold' | 'green';
  delay?: number;
}

const colorGradients = {
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/30',
  gold: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
};

const iconColors = {
  purple: 'text-purple-400',
  pink: 'text-pink-400',
  gold: 'text-amber-400',
  green: 'text-emerald-400',
};

export function StatCard({ title, value, icon, trend, color = 'purple', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5',
        colorGradients[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white font-display number-roll">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-2 flex items-center gap-1',
              trend.positive ? 'text-emerald-400' : 'text-red-400'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl bg-white/5', iconColors[color])}>
            {icon}
          </div>
        )}
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-radial from-white/10 to-transparent rounded-full blur-xl" />
    </motion.div>
  );
}
