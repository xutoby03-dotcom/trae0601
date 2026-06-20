import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  MATERIAL_LABEL_MAP,
  MATERIAL_CLEAN_CYCLE,
  daysBetween,
} from '@/utils/constants';
import type { StorageGroup, Toy, MaterialType } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StorageGroupCardProps {
  group: StorageGroup;
  animationDelay?: number;
}

export default function StorageGroupCard({ group, animationDelay = 0 }: StorageGroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { cleaningRecords, addCleaningRecord } = useAppStore();

  const progress = group.totalCount > 0
    ? Math.round((group.completedCount / group.totalCount) * 100)
    : 0;

  const getDaysSinceClean = (toy: Toy): number => {
    const lastRecord = cleaningRecords
      .filter(r => r.toyId === toy.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastDate = lastRecord ? lastRecord.date : toy.purchaseDate;
    return daysBetween(lastDate);
  };

  const handleMarkAllDone = () => {
    const now = new Date().toISOString();
    for (const toy of group.toys) {
      const days = getDaysSinceClean(toy);
      const cycle = MATERIAL_CLEAN_CYCLE[toy.material as MaterialType] || 5;
      if (days >= cycle) {
        addCleaningRecord({
          toyId: toy.id,
          date: now,
          methods: ['wipe'],
          hasDamage: false,
          hasOdor: false,
        });
      }
    }
  };

  const progressColor =
    progress === 100
      ? 'from-mint-400 to-mint-300'
      : progress >= 60
      ? 'from-clean-400 to-clean-300'
      : progress >= 30
      ? 'from-amber-400 to-yellow-400'
      : 'from-alert-400 to-alert-300';

  return (
    <div
      className="rounded-3xl-plus bg-white shadow-soft border border-gray-100/70 overflow-hidden transition-all duration-300 hover:shadow-card-hover opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className="p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-baby-100 to-mint-100 flex items-center justify-center text-xl shrink-0">
              📦
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{group.location}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {group.completedCount} / {group.totalCount} 已达标
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={
                'text-lg font-extrabold font-display ' +
                (progress === 100 ? 'text-mint-500' : progress >= 60 ? 'text-clean-500' : 'text-alert-400')
              }
            >
              {progress}%
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={
          'overflow-hidden transition-all duration-300 ease-in-out ' +
          (expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0')
        }
      >
        <div className="px-5 pb-5 space-y-2 pt-1 border-t border-gray-100/50">
          {group.toys.map(toy => {
            const days = getDaysSinceClean(toy);
            const cycle = MATERIAL_CLEAN_CYCLE[toy.material as MaterialType] || 5;
            const isPending = days >= cycle;
            const materialMeta = MATERIAL_LABEL_MAP.get(toy.material);

            return (
              <div
                key={toy.id}
                className={
                  'flex items-center gap-3 p-3 rounded-xl transition-all ' +
                  (isPending ? 'bg-amber-50/70 border border-amber-100/60' : 'bg-gray-50/50 border border-transparent')
                }
              >
                <div
                  className={
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ' +
                    (materialMeta?.color || 'bg-gray-100 text-gray-500')
                  }
                >
                  {materialMeta?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 truncate text-sm">{toy.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {days} 天前清洁 · 周期 {cycle} 天
                  </div>
                </div>
                {isPending && (
                  <span className="tag bg-amber-100 text-amber-500 shrink-0">待处理</span>
                )}
              </div>
            );
          })}

          {group.completedCount < group.totalCount && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleMarkAllDone();
              }}
              className="w-full mt-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-mint-300 to-mint-400 text-white font-semibold shadow-soft hover:shadow-card hover:from-mint-400 hover:to-mint-500 transition-all duration-200"
            >
              ✅ 一键标记全箱完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
