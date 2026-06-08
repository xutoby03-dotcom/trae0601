import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Camera, Check, Clock, DollarSign, Baby, Zap,
  MapPin, Star, Package,
} from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useCompletionStore } from '@/stores/completionStore';
import { useLotteryStore } from '@/stores/lotteryStore';
import { cn } from '@/lib/utils';
import { generateId } from '@/utils/id';
import type { Photo } from '@/types';
import {
  SCENE_LABELS, ENERGY_LABELS, SCENE_COLORS, ENERGY_COLORS,
} from '@/types';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const tasks = useTaskStore((s) => s.tasks);
  const addCompletion = useCompletionStore((s) => s.addCompletion);
  const resetLottery = useLotteryStore((s) => s.reset);
  const task = tasks.find((t) => t.id === taskId);

  const [checkedSteps, setCheckedSteps] = useState<string[]>([]);
  const [starRating, setStarRating] = useState(0);
  const [reflection, setReflection] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
        <p className="text-lg text-gray-500 font-medium">任务不存在</p>
      </div>
    );
  }

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((s) => s !== stepId) : [...prev, stepId]
    );
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => [
        ...prev,
        { id: generateId(), dataUrl: reader.result as string, order: prev.length },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleComplete = () => {
    addCompletion({
      taskId: task.id,
      starRating,
      reflection,
      photos,
      checkedSteps,
      completedAt: Date.now(),
    });
    resetLottery();
    navigate('/');
  };

  const tags = [
    { icon: MapPin, label: SCENE_LABELS[task.scene], color: SCENE_COLORS[task.scene] },
    { icon: Zap, label: ENERGY_LABELS[task.energyLevel], color: ENERGY_COLORS[task.energyLevel] },
    { icon: Clock, label: `${task.durationMin}分钟`, color: 'bg-orange-100 text-orange-700' },
    { icon: DollarSign, label: `¥${task.budget}`, color: 'bg-yellow-100 text-yellow-700' },
    { icon: Baby, label: task.ageRange, color: 'bg-pink-100 text-pink-700' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-8">
      <div className="sticky top-0 z-10 bg-[#FFF8F0]/90 backdrop-blur px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-[#FF6B35]" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate">{task.name}</h1>
      </div>

      <div className="px-4 space-y-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag.label} className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', tag.color)}>
              <tag.icon className="w-3.5 h-3.5" />
              {tag.label}
            </span>
          ))}
        </div>

        {task.preparationItems.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF6B35]" /> 准备物品
            </h2>
            <ul className="space-y-2">
              {task.preparationItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 w-4 h-4 rounded border-2 border-orange-300 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-[#FF6B35]" /> 活动步骤
          </h2>
          <div className="space-y-2">
            {task.steps.map((step) => {
              const checked = checkedSteps.includes(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                    checked ? 'bg-green-50' : 'bg-gray-50'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                    checked ? 'bg-green-500 text-white' : 'bg-[#FF6B35] text-white'
                  )}>
                    {step.order}
                  </span>
                  <span className={cn(
                    'flex-1 text-sm transition-all',
                    checked ? 'line-through text-gray-400' : 'text-gray-700'
                  )}>
                    {step.description}
                  </span>
                  <motion.div
                    initial={false}
                    animate={{ scale: checked ? 1 : 0.8, opacity: checked ? 1 : 0.3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center',
                      checked ? 'bg-green-500' : 'border-2 border-gray-300'
                    )}>
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#FF6B35]" /> 活动照片
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-orange-300 flex flex-col items-center justify-center gap-1 text-[#FF6B35] hover:bg-orange-50 transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">添加照片</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddPhoto}
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#FF6B35]" /> 活动评分
          </h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                onClick={() => setStarRating(star)}
                whileTap={{ scale: 0.8 }}
                animate={{ scale: starRating >= star ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    starRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  )}
                />
              </motion.button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3">家长感想</h2>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onBlur={() => {}}
            placeholder="家长感想"
            className="w-full h-24 p-3 rounded-xl bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none focus:ring-2 focus:ring-[#FF6B35]/30"
          />
        </section>

        <button
          onClick={handleComplete}
          className="w-full py-3.5 rounded-2xl bg-[#FF6B35] text-white font-bold text-base shadow-lg shadow-[#FF6B35]/30 active:scale-[0.97] transition-transform"
        >
          完成活动
        </button>
      </div>
    </div>
  );
}
