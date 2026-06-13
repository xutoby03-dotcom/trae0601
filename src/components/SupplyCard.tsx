import { Wine, Pencil, Trash2, Scale } from 'lucide-react';
import type { Supply } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import ImportanceTag from './ImportanceTag';
import CategoryTag from './CategoryTag';
import { getSupplyRemainingQuantity, formatWeight } from '@/utils/calculations';

interface Props {
  supply: Supply;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export default function SupplyCard({ supply, onEdit, onDelete, compact = false }: Props) {
  const assignments = useAppStore((s) => s.assignments);
  const remaining = getSupplyRemainingQuantity(supply, assignments);
  const assigned = supply.quantity - remaining;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-parchment-50 border border-parchment-200 hover:border-forest-300 transition-colors">
        {supply.photoUrl ? (
          <img
            src={supply.photoUrl}
            alt={supply.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-forest-100 flex items-center justify-center text-forest-600">
            <Wine size={18} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-forest-800 text-sm truncate">{supply.name}</div>
          <div className="flex items-center gap-2 text-xs text-earth-600">
            <span className="flex items-center gap-0.5">
              <Scale size={11} />
              {formatWeight(supply.weightGrams)}
            </span>
            <span>×{remaining}</span>
          </div>
        </div>
        <CategoryTag category={supply.category} size="sm" />
      </div>
    );
  }

  return (
    <div className="card card-hover group">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment-100">
        {supply.photoUrl ? (
          <img
            src={supply.photoUrl}
            alt={supply.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-forest-300">
            <Wine size={48} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <CategoryTag category={supply.category} />
          {supply.isFragile && (
            <span className="tag bg-white/90 text-warn-600 ring-1 ring-inset ring-warn-200 backdrop-blur-sm">
              🥚 易碎
            </span>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-forest-700 hover:bg-forest-700 hover:text-white shadow-card transition-all"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm text-firstaid-600 hover:bg-firstaid-600 hover:text-white shadow-card transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end justify-between text-white">
            <div>
              <div className="text-[10px] opacity-80">单件重量</div>
              <div className="font-semibold">{formatWeight(supply.weightGrams)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] opacity-80">
                剩余 / 总数
              </div>
              <div className="font-semibold">
                <span className={assigned > 0 ? 'text-forest-300' : ''}>{remaining}</span>
                <span className="opacity-60"> / {supply.quantity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-forest-800 leading-tight">{supply.name}</h4>
          <ImportanceTag importance={supply.importance} />
        </div>
        {supply.note && (
          <p className="text-xs text-earth-600 line-clamp-2">{supply.note}</p>
        )}
      </div>
    </div>
  );
}
