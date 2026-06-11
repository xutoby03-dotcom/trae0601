import { useState } from 'react';
import { Check, AlertCircle, Clock, Zap } from 'lucide-react';
import Modal from './Modal';
import type { FeedingTask, ReactionType } from '@/types';
import { getReactionLabel, getMealTimingLabel } from '@/utils/date';
import useAppStore from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const reactionOptions: { value: ReactionType; label: string; emoji: string; color: string }[] = [
  { value: 'normal', label: '正常', emoji: '😊', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'good-appetite', label: '食欲好', emoji: '🍖', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'low-spirit', label: '精神差', emoji: '😴', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'vomiting', label: '呕吐', emoji: '🤢', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'other', label: '其他', emoji: '📝', color: 'bg-gray-50 border-gray-200 text-gray-700' },
];

interface FeedingModalProps {
  task: FeedingTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedingModal({ task, isOpen, onClose }: FeedingModalProps) {
  const [reaction, setReaction] = useState<ReactionType>('normal');
  const [note, setNote] = useState('');
  const markFed = useAppStore(state => state.markFed);
  const markMissed = useAppStore(state => state.markMissed);
  const markSkipped = useAppStore(state => state.markSkipped);

  if (!task) return null;

  const handleMarkFed = () => {
    markFed(task.id, reaction, note);
    onClose();
  };

  const handleMarkMissed = () => {
    markMissed(task.id);
    onClose();
  };

  const handleSkip = () => {
    markSkipped(task.id);
    onClose();
  };

  const canMakeUp = () => {
    const nextSlotIndex = task.medicine.timeSlots.indexOf(task.timeSlot) + 1;
    if (nextSlotIndex >= task.medicine.timeSlots.length) return true;
    const nextSlot = task.medicine.timeSlots[nextSlotIndex];
    const [cH, cM] = task.timeSlot.split(':').map(Number);
    const [nH, nM] = nextSlot.split(':').map(Number);
    const hoursDiff = (nH * 60 + nM - cH * 60 - cM) / 60;
    return hoursDiff >= 4;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="喂药打卡">
      <div className="space-y-5">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl">
          <img
            src={task.pet.photo}
            alt={task.pet.name}
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h4 className="font-bold text-gray-800">{task.pet.name}</h4>
            <p className="text-sm text-gray-500">{task.medicine.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-white rounded-full text-orange-600 font-medium">
                {task.medicine.dosage}
              </span>
              <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-500">
                {getMealTimingLabel(task.medicine.mealTiming)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-400" />
          <span className="text-gray-700">
            计划时间：<span className="font-semibold">{task.timeSlot}</span>
          </span>
        </div>

        {task.status === 'missed' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">补喂建议</p>
                {canMakeUp() ? (
                  <p className="text-sm text-amber-700 mt-1">
                    距离下次喂药还有足够时间，可以补喂。<strong>请勿增加剂量！</strong>
                  </p>
                ) : (
                  <p className="text-sm text-amber-700 mt-1">
                    距离下次喂药时间不足4小时，建议跳过本次，下次正常喂药。<strong>切勿加倍剂量！</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            宠物反应
          </label>
          <div className="grid grid-cols-3 gap-2">
            {reactionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setReaction(opt.value)}
                className={cn(
                  'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200',
                  reaction === opt.value
                    ? opt.color + ' border-current scale-105'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs mt-1 font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录喂药情况..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          {task.status === 'missed' && !canMakeUp() && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 rounded-2xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              跳过本次
            </button>
          )}
          {task.status === 'missed' && canMakeUp() && (
            <button
              onClick={handleMarkMissed}
              className="flex-1 py-3 px-4 rounded-2xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              标记漏喂
            </button>
          )}
          <button
            onClick={handleMarkFed}
            className={cn(
              'flex-1 py-3 px-4 rounded-2xl font-medium text-white transition-all flex items-center justify-center gap-2',
              'bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 shadow-lg shadow-orange-200 hover:shadow-orange-300'
            )}
          >
            <Check className="w-5 h-5" />
            确认喂药
          </button>
        </div>
      </div>
    </Modal>
  );
}
