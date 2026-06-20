import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  MATERIAL_LABEL_MAP,
  CLEAN_METHOD_LABEL_MAP,
  MATERIAL_CLEAN_CYCLE,
} from '@/utils/constants';
import type { Toy, MaterialType } from '@/types';

interface PendingCleanItemProps {
  toy: Toy & { daysSinceLastClean: number; recommendedCycle: number };
  animationDelay?: number;
}

export default function PendingCleanItem({ toy, animationDelay = 0 }: PendingCleanItemProps) {
  const addCleaningRecord = useAppStore(s => s.addCleaningRecord);

  const materialMeta = MATERIAL_LABEL_MAP.get(toy.material);
  const cleanMeta = CLEAN_METHOD_LABEL_MAP.get(toy.cleanMethod);
  const overdueDays = toy.daysSinceLastClean - toy.recommendedCycle;

  const handleMarkClean = () => {
    addCleaningRecord({
      toyId: toy.id,
      date: new Date().toISOString(),
      methods: ['wipe'],
      hasDamage: false,
      hasOdor: false,
    });
  };

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl-plus bg-gray-50/60 hover:bg-white hover:shadow-soft transition-all duration-300 border border-gray-100/50 hover:border-mint-100 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div
        className={
          'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0' +
          ' ' +
          (materialMeta?.color || 'bg-gray-100 text-gray-500')
        }
      >
        {materialMeta?.icon || '📦'}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          to={`/toys/${toy.id}`}
          className="font-semibold text-gray-800 hover:text-mint-500 transition-colors truncate block"
        >
          {toy.name}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <span className="text-xs text-gray-500">
            距上次清洁 <span className="font-semibold text-alert-400">{toy.daysSinceLastClean}</span> 天
          </span>
          <span className="text-xs text-gray-400">
            / 推荐 {MATERIAL_CLEAN_CYCLE[toy.material as MaterialType] || toy.recommendedCycle} 天
          </span>
          {overdueDays > 0 && (
            <span className="tag bg-alert-50 text-alert-400">超期 {overdueDays} 天</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {cleanMeta && (
          <span className="tag bg-clean-50 text-clean-500 hidden sm:inline-flex">
            {cleanMeta.icon} {cleanMeta.label}
          </span>
        )}
        <button
          onClick={handleMarkClean}
          className="px-4 py-2 rounded-xl bg-mint-300 text-mint-500 font-semibold text-sm hover:bg-mint-400 hover:text-white transition-all duration-200 shadow-soft hover:shadow-card"
        >
          ✨ 已清洁
        </button>
      </div>
    </div>
  );
}
