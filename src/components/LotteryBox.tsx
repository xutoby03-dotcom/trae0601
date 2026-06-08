import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { useLotteryStore, useTaskStore, useFilterStore } from '@/stores';
import { cn } from '@/lib/utils';

interface LotteryBoxProps {
  onDrawn: () => void;
}

export default function LotteryBox({ onDrawn }: LotteryBoxProps) {
  const { isDrawing, hasDrawn, isDrawing: shaking, setIsDrawing, draw } = useLotteryStore();
  const { tasks, getFilteredTasks } = useTaskStore();
  const { filter } = useFilterStore();

  const filteredTasks = getFilteredTasks(filter);
  const noTasks = filteredTasks.length === 0;

  const handleClick = () => {
    if (isDrawing || hasDrawn || noTasks) return;
    setIsDrawing(true);
    setTimeout(() => {
      draw(filteredTasks);
      onDrawn();
    }, 1500);
  };

  if (hasDrawn) return null;

  if (noTasks) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-6xl">😢</div>
        <p className="text-lg text-gray-500 font-medium">没有符合条件的任务</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6 cursor-pointer select-none"
      onClick={handleClick}
    >
      <div className="relative">
        <motion.div
          animate={
            isDrawing
              ? {
                  rotate: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0],
                  scale: [1, 1.05, 0.95, 1.05, 0.95, 1.03, 0.97, 1.02, 1, 1],
                }
              : { y: [0, -8, 0], rotate: 0, scale: 1 }
          }
          transition={
            isDrawing
              ? { duration: 1.5, ease: 'easeInOut' }
              : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <div
            className={cn(
              'w-32 h-28 rounded-t-2xl relative',
              'bg-gradient-to-br from-[#FF6B35] to-[#FF8F5E]',
              'shadow-[0_8px_0_0_#CC5529,0_12px_20px_rgba(0,0,0,0.15)]'
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-full bg-[#FFB088] opacity-60 rounded" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-full bg-[#FFB088] opacity-60 rounded" />
            </div>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <div
                className={cn(
                  'w-16 h-6 rounded-t-lg',
                  'bg-gradient-to-br from-[#FF8F5E] to-[#FF6B35]',
                  'shadow-[0_4px_0_0_#CC5529]'
                )}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gift className="w-10 h-10 text-white drop-shadow-md" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute -top-4 -right-4 text-yellow-400"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <motion.div
          className="absolute -top-2 -left-5 text-yellow-300"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -right-6 text-orange-300"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
        <motion.div
          className="absolute -bottom-3 -left-6 text-amber-300"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>

      <motion.p
        className="text-lg font-bold text-[#FF6B35]"
        animate={isDrawing ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={isDrawing ? { duration: 0.5, repeat: Infinity } : {}}
      >
        {isDrawing ? '抽签中...' : '摇一摇'}
      </motion.p>
    </motion.div>
  );
}
