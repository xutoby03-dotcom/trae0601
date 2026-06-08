import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, Clock, Coins } from 'lucide-react';
import { useLotteryStore, useTaskStore, useFilterStore } from '@/stores';
import { cn } from '@/lib/utils';
import { SCENE_LABELS, ENERGY_LABELS, SCENE_COLORS, ENERGY_COLORS } from '@/types';
import LotteryBox from '@/components/LotteryBox';
import FilterBar from '@/components/FilterBar';
import SkipReasonModal from '@/components/SkipReasonModal';

export default function Home() {
  const navigate = useNavigate();
  const { currentTask, hasDrawn, reset, draw } = useLotteryStore();
  const { getFilteredTasks } = useTaskStore();
  const { filter } = useFilterStore();
  const [skipModalOpen, setSkipModalOpen] = useState(false);

  const handleDrawn = () => {};

  const handleAccept = () => {
    if (currentTask) {
      navigate(`/task/${currentTask.id}`);
    }
  };

  const handleSkip = () => {
    const filteredTasks = getFilteredTasks(filter);
    if (filteredTasks.length > 0) {
      draw(filteredTasks);
    }
  };

  const handleReDraw = () => {
    reset();
  };

  const getDurationLabel = (min: number) => {
    if (min < 30) return '<30分钟';
    if (min <= 60) return '30-60分钟';
    return '1小时+';
  };

  const getBudgetLabel = (budget: number) => {
    if (budget === 0) return '免费';
    if (budget <= 50) return '50以内';
    return '不限';
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 pt-8 pb-12">
      <div className="max-w-md mx-auto">
        <motion.h1
          className="text-3xl font-black text-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[#FF6B35]">周末</span>
          <span className="text-[#4ECDC4]">亲子</span>
          <span className="text-[#FF6B35]">抽签</span>
        </motion.h1>
        <p className="text-center text-gray-400 text-sm mb-4">不知道玩什么？摇一摇就知道！</p>

        <FilterBar />

        <div className="flex items-center justify-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {!hasDrawn ? (
              <LotteryBox key="box" onDrawn={handleDrawn} />
            ) : currentTask ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                className="w-full bg-white rounded-3xl p-6 shadow-xl border-2 border-[#FF6B35]/10"
              >
                <div className="text-center mb-4">
                  <span className="text-4xl">🎉</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">
                    {currentTask.name}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                      SCENE_COLORS[currentTask.scene]
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                    {SCENE_LABELS[currentTask.scene]}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                      ENERGY_COLORS[currentTask.energyLevel]
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    {ENERGY_LABELS[currentTask.energyLevel]}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                    <Clock className="w-3 h-3" />
                    {getDurationLabel(currentTask.durationMin)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Coins className="w-3 h-3" />
                    {getBudgetLabel(currentTask.budget)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSkipModalOpen(true)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all active:scale-95"
                  >
                    换一个
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    接受任务
                  </button>
                </div>

                <button
                  onClick={handleReDraw}
                  className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  重新抽签
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <SkipReasonModal
          open={skipModalOpen}
          onClose={() => setSkipModalOpen(false)}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
