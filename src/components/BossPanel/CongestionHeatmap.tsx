import { useOrderStore } from '@/store/useOrderStore';
import { getCongestionData } from '@/utils/orderUtils';

export default function CongestionHeatmap() {
  const orders = useOrderStore((s) => s.orders);
  const congestionData = getCongestionData(orders);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-cream-200/50';
    if (count === 1) return 'bg-yellow-300/70';
    if (count === 2) return 'bg-orange-400/70';
    return 'bg-danger-500/80';
  };

  const getTextColor = (count: number) => {
    if (count === 0) return 'text-coffee-800/40';
    if (count <= 2) return 'text-coffee-900';
    return 'text-white';
  };

  return (
    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200">
      <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
        <span>📊</span>
        <span>拥堵时段预测</span>
      </div>

      <div className="flex items-end gap-1 h-16">
        {congestionData.map((item, index) => {
          const height = Math.min(100, Math.max(15, item.count * 22));
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
              <div className={`
                w-full rounded-t-md transition-all duration-300 relative
                ${getHeatColor(item.count)}
                group-hover:opacity-80
              `} style={{ height: `${height}%` }}>
                {item.count > 0 && (
                  <span className={`
                    absolute top-0.5 left-1/2 -translate-x-1/2 text-[10px] font-bold
                    ${getTextColor(item.count)}
                  `}>
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-coffee-800/50 font-mono whitespace-nowrap">
                {item.time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 mt-2 pt-2 border-t border-cream-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-cream-200/50" />
          <span className="text-[10px] text-coffee-800/50">空闲</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-300/70" />
          <span className="text-[10px] text-coffee-800/50">正常</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-400/70" />
          <span className="text-[10px] text-coffee-800/50">繁忙</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-danger-500/80" />
          <span className="text-[10px] text-coffee-800/50">拥堵</span>
        </div>
      </div>
    </div>
  );
}
