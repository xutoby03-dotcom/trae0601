import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsColor = 'green' | 'blue' | 'orange' | 'red';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: StatsColor;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  onClick?: () => void;
}

const colorGradients: Record<StatsColor, string> = {
  green: 'from-green-400 to-emerald-600',
  blue: 'from-blue-400 to-indigo-600',
  orange: 'from-orange-400 to-amber-600',
  red: 'from-red-400 to-rose-600',
};

export default function StatsCard({ title, value, icon, color, trend, onClick }: StatsCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 text-white cursor-pointer',
        'bg-gradient-to-br',
        colorGradients[color]
      )}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={onClick}
    >
      <motion.div
        className="absolute -right-4 -top-4 text-9xl opacity-20"
        animate={{ scale: [1, 1.1, 1], transition: { duration: 3, repeat: Infinity } }}
      >
        {icon}
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium opacity-90">{title}</span>
          <div className="text-3xl">{icon}</div>
        </div>

        <motion.div
          className="text-5xl font-bold mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value}
        </motion.div>

        {trend && (
          <div className="flex items-center gap-1 text-sm">
            {trend.direction === 'up' ? (
              <TrendingUp size={16} className="text-green-100" />
            ) : (
              <TrendingDown size={16} className="text-red-100" />
            )}
            <span className="opacity-90">
              {trend.direction === 'up' ? '+' : ''}{trend.value}% 较上周
            </span>
          </div>
        )}
      </div>

      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
