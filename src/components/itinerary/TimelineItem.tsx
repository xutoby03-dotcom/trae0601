import { ItineraryStep } from '../../types';
import { itineraryTypeConfig, formatTime, cn } from '../../utils/helpers';
import { motion } from 'framer-motion';
import {
  Flag,
  ShoppingCart,
  Fuel,
  Tent,
  Camera,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface TimelineItemProps {
  step: ItineraryStep;
  index: number;
  total: number;
  onEdit: (step: ItineraryStep) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const iconMap = {
  meetup: Flag,
  supply: ShoppingCart,
  fuel: Fuel,
  camp: Tent,
  scenic: Camera,
};

export function TimelineItem({ step, index, total, onEdit, onDelete, onMoveUp, onMoveDown }: TimelineItemProps) {
  const config = itineraryTypeConfig[step.type];
  const Icon = iconMap[step.type];
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md z-10',
            config.color
          )}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        {!isLast && <div className="flex-1 w-0.5 bg-cream-200 my-1" />}
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 + 0.1 }}
        className="flex-1 mb-6"
      >
        <div className="bg-white rounded-xl shadow-card border border-cream-100 p-5 hover:shadow-lifted transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full text-white',
                  config.color
                )}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-400">第 {index + 1} 站</span>
              </div>
              <h4 className="font-serif text-lg font-semibold text-forest-800 mb-2">
                {step.name}
              </h4>
              {step.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{step.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {formatTime(step.arriveTime)}
                  {step.departTime && ` → ${formatTime(step.departTime)}`}
                </span>
              </div>
              {step.note && (
                <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-cream-100">
                  {step.note}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onMoveUp(index)}
                disabled={isFirst}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isFirst
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-cream-100 hover:text-forest-600'
                )}
                title="上移"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMoveDown(index)}
                disabled={isLast}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isLast
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-cream-100 hover:text-forest-600'
                )}
                title="下移"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(step)}
                className="p-2 rounded-lg text-gray-500 hover:bg-cream-100 hover:text-forest-600 transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(step.id)}
                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
