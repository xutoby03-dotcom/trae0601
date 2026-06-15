import { useState, useRef, useEffect } from 'react';
import { ChevronDown, UserX } from 'lucide-react';
import type { Chef, Order } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import { getAvailableChefs } from '@/utils/orderUtils';

interface ChefSelectorProps {
  order: Order;
}

export default function ChefSelector({ order }: ChefSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chefs = useOrderStore((s) => s.chefs);
  const assignChef = useOrderStore((s) => s.assignChef);
  const unassignChef = useOrderStore((s) => s.unassignChef);
  const ref = useRef<HTMLDivElement>(null);

  const assignedChef = chefs.find((c) => c.id === order.chefId);
  const availableChefs = getAvailableChefs(order, chefs);
  const hasReferenceImage = !!order.referenceImageUrl;
  const isIllegalAssignment = !hasReferenceImage && assignedChef?.isRookie;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (chefId: string | undefined) => {
    if (chefId === undefined) {
      unassignChef(order.id);
    } else {
      assignChef(order.id, chefId);
    }
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
          border text-sm transition-all duration-200
          ${isIllegalAssignment
            ? 'bg-danger-500/10 border-danger-500/50 text-danger-600'
            : assignedChef
              ? 'bg-cream-50 border-cream-300 text-coffee-900'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }
        `}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {assignedChef ? (
            <>
              <span className="text-lg">{assignedChef.avatar}</span>
              <span className="font-medium">{assignedChef.name}</span>
              {assignedChef.isRookie && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isIllegalAssignment
                    ? 'bg-danger-500/20 text-danger-600'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  新人
                </span>
              )}
              {isIllegalAssignment && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger-500 text-white font-medium flex items-center gap-0.5">
                  ⚠️ 违规分配
                </span>
              )}
            </>
          ) : (
            <span className="text-amber-600 font-medium">未分配裱花师</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-cream-300 shadow-xl overflow-hidden animate-fade-in">
          {!hasReferenceImage && (
            <div className="px-3 py-2 bg-warning-500/10 border-b border-warning-500/20">
              <p className="text-xs text-warning-500 flex items-center gap-1">
                ⚠️ 无参考图，新人裱花师不可分配
              </p>
            </div>
          )}
          {assignedChef && (
            <button
              onClick={() => handleSelect(undefined)}
              className="w-full px-3 py-2.5 text-left hover:bg-cream-100 flex items-center gap-2 text-sm text-coffee-800/60 border-b border-cream-200 transition-colors"
            >
              <UserX className="w-4 h-4" />
              取消分配
            </button>
          )}
          {chefs.map((chef) => {
            const isAvailable = availableChefs.some((c) => c.id === chef.id);
            const isSelected = chef.id === order.chefId;
            const isIllegalSelected = isSelected && !hasReferenceImage && chef.isRookie;
            return (
              <button
                key={chef.id}
                onClick={() => isAvailable && handleSelect(chef.id)}
                disabled={!isAvailable}
                className={`
                  w-full px-3 py-2.5 text-left flex items-center justify-between gap-2
                  transition-colors text-sm
                  ${isIllegalSelected ? 'bg-danger-500/10 text-danger-600 border-b border-danger-500/20' : ''}
                  ${isSelected && !isIllegalSelected ? 'bg-matcha-500/10 text-matcha-600' : ''}
                  ${isAvailable && !isSelected ? 'hover:bg-cream-100 text-coffee-900' : ''}
                  ${!isAvailable ? 'opacity-40 cursor-not-allowed text-coffee-800/40' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{chef.avatar}</span>
                  <span className="font-medium">{chef.name}</span>
                  {chef.isRookie && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isIllegalSelected
                        ? 'bg-danger-500/20 text-danger-600'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      新人
                    </span>
                  )}
                  {isIllegalSelected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-danger-500 text-white">
                      ⚠️ 违规
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: chef.skillLevel }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
