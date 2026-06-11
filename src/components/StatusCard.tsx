import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, Ticket } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusCardProps {
  type: 'upcoming' | 'ongoing' | 'success' | 'pending';
  count: number;
  label: string;
  onClick?: () => void;
}

const cardConfig = {
  upcoming: {
    icon: Calendar,
    gradient: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-500',
    shadow: 'shadow-orange-500/30',
    glow: 'group-hover:shadow-orange-500/50',
    text: 'text-orange-400',
    bgIcon: 'bg-orange-500/20',
  },
  ongoing: {
    icon: Clock,
    gradient: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500',
    shadow: 'shadow-red-500/30',
    glow: 'group-hover:shadow-red-500/50',
    text: 'text-red-400',
    bgIcon: 'bg-red-500/20',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500',
    shadow: 'shadow-green-500/30',
    glow: 'group-hover:shadow-green-500/50',
    text: 'text-green-400',
    bgIcon: 'bg-green-500/20',
  },
  pending: {
    icon: Ticket,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500',
    shadow: 'shadow-blue-500/30',
    glow: 'group-hover:shadow-blue-500/50',
    text: 'text-blue-400',
    bgIcon: 'bg-blue-500/20',
  },
};

export default function StatusCard({ type, count, label, onClick }: StatusCardProps) {
  const config = cardConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 cursor-pointer',
        'bg-gradient-to-br backdrop-blur-xl',
        'border transition-all duration-300',
        'shadow-lg hover:shadow-xl',
        config.gradient,
        config.border,
        config.shadow,
        config.glow
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn('text-5xl font-bold font-orbitron mb-2', config.text)}
          >
            {count}
          </motion.div>
          <div className="text-gray-300 font-medium">{label}</div>
        </div>
        
        <motion.div
          whileHover={{ rotate: 15 }}
          className={cn('p-3 rounded-xl', config.bgIcon)}
        >
          <Icon className={cn('w-8 h-8', config.text)} />
        </motion.div>
      </div>

      <motion.div
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.text.includes('orange') ? '#f97316' : config.text.includes('red') ? '#ef4444' : config.text.includes('green') ? '#22c55e' : '#3b82f6'} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}
