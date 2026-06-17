import { useNavigate } from 'react-router-dom';
import { Package, Check, X } from 'lucide-react';
import { useMemo } from 'react';
import type { Clothing } from '@/types';
import { useStore } from '@/store/useStore';
import Badge from '@/components/ui/Badge';
import { getSeasonLabel, getCategoryLabel } from '@/utils/helpers';

interface ClothingCardProps {
  clothing: Clothing;
  variant?: 'list' | 'compact';
}

export default function ClothingCard({ clothing, variant = 'list' }: ClothingCardProps) {
  const navigate = useNavigate();
  const boxes = useStore((state) => state.boxes);
  const box = useMemo(() => 
    clothing.boxId ? boxes.find(b => b.id === clothing.boxId) : undefined,
    [boxes, clothing.boxId]
  );

  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/clothes/${clothing.id}`)}
        className="bg-white rounded-xl p-2 shadow-soft border border-warm-100 card-hover cursor-pointer opacity-0 animate-fade-in-up"
      >
        <div className="aspect-square rounded-lg bg-warm-50 mb-2 overflow-hidden">
          {clothing.photo ? (
            <img src={clothing.photo} alt={clothing.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-warm-300" />
            </div>
          )}
        </div>
        <div className="text-xs font-medium text-warm-700 truncate">{clothing.name}</div>
        <div className="text-[10px] text-warm-400 truncate">{clothing.size}</div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/clothes/${clothing.id}`)}
      className="card p-3 card-hover cursor-pointer opacity-0 animate-fade-in-up"
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl bg-warm-50 flex-shrink-0 overflow-hidden">
          {clothing.photo ? (
            <img src={clothing.photo} alt={clothing.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={24} className="text-warm-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-warm-800 truncate">{clothing.name}</h3>
            {clothing.status === 'pending' && (
              <Badge variant="warning" size="sm">
                待处理
              </Badge>
            )}
            {clothing.status === 'taken_out' && (
              <Badge variant="info" size="sm">
                已取出
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-warm-500 mb-2">
            <span>{clothing.owner}</span>
            <span className="text-warm-200">·</span>
            <span>{clothing.size}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" size="sm">{getSeasonLabel(clothing.season)}</Badge>
            <Badge variant="default" size="sm">{getCategoryLabel(clothing.category)}</Badge>
            {box && (
              <Badge variant="primary" size="sm">{box.code}</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-warm-100">
        <div className="flex items-center gap-1 text-xs">
          {clothing.isWashed ? (
            <>
              <Check size={14} className="text-sage-500" />
              <span className="text-sage-600">已清洗</span>
            </>
          ) : (
            <>
              <X size={14} className="text-coral-500" />
              <span className="text-coral-600">待清洗</span>
            </>
          )}
        </div>
        {clothing.isVacuumPacked && (
          <div className="flex items-center gap-1 text-xs text-sky-600">
            <span>真空压缩</span>
          </div>
        )}
      </div>
    </div>
  );
}
