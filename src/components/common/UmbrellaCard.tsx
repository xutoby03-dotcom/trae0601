import type { Umbrella } from '@/types';
import StatusBadge from './StatusBadge';
import { useUmbrellaStore } from '@/store/umbrellaStore';
import { Eye, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  umbrella: Umbrella;
  onView?: (u: Umbrella) => void;
}

const sizeLabel = { small: '单人', medium: '双人', large: '加大' };

export default function UmbrellaCard({ umbrella, onView }: Props) {
  const getStoreName = useUmbrellaStore((s) => s.getStoreName);
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white card-hover animate-fadeInUp">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={umbrella.photoUrl}
          alt={umbrella.code}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={umbrella.status} />
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {onView && (
            <button
              onClick={() => onView(umbrella)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
              title="查看详情"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <Link
            to={`/umbrellas/${umbrella.id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
            title="编辑"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-serif-sc text-base font-semibold text-slate-900">
              {umbrella.code}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {umbrella.color} · {sizeLabel[umbrella.size]}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-teal-700">
              ¥{umbrella.deposit}
            </div>
            <div className="text-[10px] text-slate-400">押金</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="truncate text-xs text-slate-500">
            {getStoreName(umbrella.storeId)}
          </div>
          {umbrella.status === 'damaged' && (
            <div className="max-w-[55%] truncate text-[11px] text-orange-600" title={umbrella.damageNote}>
              {umbrella.damageNote || '破损待修'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
