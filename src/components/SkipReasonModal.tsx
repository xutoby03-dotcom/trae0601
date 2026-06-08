import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCompletionStore, useLotteryStore, useTaskStore, useFilterStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { SkipReason } from '@/types';
import { SKIP_REASON_LABELS } from '@/types';

interface SkipReasonModalProps {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
}

const REASON_ICONS: Record<SkipReason, string> = {
  too_tired: '😫',
  no_materials: '📦',
  dont_want_out: '🏠',
  other: '💭',
};

const REASONS: SkipReason[] = ['too_tired', 'no_materials', 'dont_want_out', 'other'];

export default function SkipReasonModal({ open, onClose, onSkip }: SkipReasonModalProps) {
  const [selected, setSelected] = useState<SkipReason | null>(null);
  const [customText, setCustomText] = useState('');
  const { addSkipRecord } = useCompletionStore();
  const { currentTask, addSkippedId } = useLotteryStore();
  const setLotteryState = useLotteryStore.setState;
  const { getFilteredTasks } = useTaskStore();
  const { filter } = useFilterStore();

  const handleConfirm = () => {
    if (!selected || !currentTask) return;
    addSkipRecord(
      currentTask.id,
      selected,
      selected === 'other' ? customText : undefined
    );
    addSkippedId(currentTask.id);
    setLotteryState({ currentTask: null, isDrawing: false, hasDrawn: false });
    setSelected(null);
    setCustomText('');
    onSkip();
  };

  const handleClose = () => {
    setSelected(null);
    setCustomText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

          <motion.div
            className="relative bg-[#FFF8F0] rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 border-[#FF6B35]/20"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#FF6B35] text-center mb-5">
              换掉这个任务？
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200',
                    selected === reason
                      ? 'bg-[#4ECDC4]/15 border-[#4ECDC4] text-[#333]'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#4ECDC4]/50'
                  )}
                >
                  <span className="text-xl">{REASON_ICONS[reason]}</span>
                  <span className="font-medium">{SKIP_REASON_LABELS[reason]}</span>
                </button>
              ))}
            </div>

            {selected === 'other' && (
              <motion.textarea
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 72, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full resize-none rounded-xl border-2 border-gray-200 p-3 text-sm focus:border-[#4ECDC4] focus:outline-none transition-colors mb-4"
                placeholder="说说你的原因..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selected || (selected === 'other' && !customText.trim())}
                className={cn(
                  'flex-1 py-3 rounded-2xl font-bold text-white shadow-lg transition-all duration-200',
                  selected && (selected !== 'other' || customText.trim())
                    ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] hover:shadow-xl active:scale-95'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                换一个
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
