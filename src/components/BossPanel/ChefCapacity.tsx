import type { Chef } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import {
  getChefPendingOrders,
  getChefCompletedOrders,
  estimateChefFinishTime,
} from '@/utils/orderUtils';

interface ChefCapacityProps {
  chef: Chef;
}

export default function ChefCapacity({ chef }: ChefCapacityProps) {
  const orders = useOrderStore((s) => s.orders);
  const pending = getChefPendingOrders(chef, orders);
  const completed = getChefCompletedOrders(chef, orders);
  const estimatedFinish = estimateChefFinishTime(chef, orders);
  const total = pending.length + completed.length;
  const progress = total > 0 ? (completed.length / total) * 100 : 0;

  return (
    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 hover:border-cream-300 transition-all">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="relative">
          <span className="text-2xl">{chef.avatar}</span>
          {chef.isRookie && (
            <span className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0.5 rounded-full bg-blue-500 text-white font-bold">
              新
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-coffee-900 text-sm">{chef.name}</span>
            <div className="flex items-center">
              {Array.from({ length: chef.skillLevel }).map((_, i) => (
                <span key={i} className="text-amber-400 text-[10px]">★</span>
              ))}
            </div>
          </div>
          <div className="text-xs text-coffee-800/60">
            已完成 <span className="font-bold text-matcha-600">{completed.length}</span>
            <span className="mx-1">·</span>
            待完成 <span className="font-bold text-amber-600">{pending.length}</span>
          </div>
        </div>
      </div>

      <div className="relative h-1.5 bg-cream-200 rounded-full overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-matcha-500 to-matcha-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {estimatedFinish && pending.length > 0 && (
        <div className="text-[11px] text-coffee-800/60 flex items-center gap-1">
          <span>预计下班</span>
          <span className="font-bold text-coffee-900">
            {estimatedFinish.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      {pending.length === 0 && (
        <div className="text-[11px] text-matcha-600 font-medium flex items-center gap-1">
          ✨ 今日任务已完成
        </div>
      )}
    </div>
  );
}
