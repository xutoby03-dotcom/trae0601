import { Camera, Waves, Shirt, Copy, Edit, Trash2, ChevronRight } from 'lucide-react';
import type { WeightPlan } from '@/types';

interface PlanCardProps {
  plan: WeightPlan;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PlanCard({
  plan,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: PlanCardProps) {
  const avgRating = (
    (plan.pitchForward +
      plan.pitchBackward +
      plan.roll +
      plan.ascentSpeed +
      plan.handling) /
    5
  ).toFixed(1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="group relative bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 
                 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all duration-300 
                 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,212,255,0.15)] 
                 overflow-hidden cursor-pointer"
      onClick={() => onView(plan.id)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {plan.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              更新于 {formatDate(plan.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-3">
            <span className="text-amber-400 font-bold text-lg">{avgRating}</span>
            <span className="text-amber-400 text-sm">★</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Waves size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-300 truncate">{plan.salinity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shirt size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-300 truncate">{plan.wetsuitThickness}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Camera size={16} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-300 truncate">{plan.cameraHousing}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-cyan-400 flex-shrink-0 text-xs font-bold">LB</span>
            <span className="text-slate-300 truncate">{plan.leadPosition}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${
                  star <= Math.round(Number(avgRating))
                    ? 'text-amber-400'
                    : 'text-slate-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(plan.id);
              }}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
              title="复用方案"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(plan.id);
              }}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
              title="编辑"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(plan.id);
              }}
              className="p-2 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
            <ChevronRight
              size={16}
              className="text-slate-500 group-hover:text-cyan-400 transition-colors ml-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
