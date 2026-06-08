import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Baby, MapPin, Zap, Trash2, Check, X } from 'lucide-react';
import type { Task } from '@/types';
import { SCENE_LABELS, ENERGY_LABELS, SCENE_COLORS, ENERGY_COLORS } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const STRIPE_COLORS: Record<string, string> = {
  indoor: 'bg-blue-400',
  outdoor: 'bg-green-400',
  both: 'bg-purple-400',
};

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex overflow-hidden rounded-2xl bg-[#FFF8F0] shadow-md cursor-pointer"
      onClick={() => navigate(`/task/${task.id}`)}
    >
      <div className={cn('w-2 shrink-0', STRIPE_COLORS[task.scene])} />

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{task.name}</h3>
          <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            {confirming ? (
              <>
                <button onClick={() => { onDelete(task.id); setConfirming(false); }}
                  className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200">
                  <Check size={14} />
                </button>
                <button onClick={() => setConfirming(false)}
                  className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <X size={14} />
                </button>
              </>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="p-1 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            <Baby size={12} />{task.ageRange}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />{task.durationMin}分钟
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign size={14} />¥{task.budget}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', SCENE_COLORS[task.scene])}>
            <MapPin size={12} />{SCENE_LABELS[task.scene]}
          </span>
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', ENERGY_COLORS[task.energyLevel])}>
            <Zap size={12} />{ENERGY_LABELS[task.energyLevel]}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
