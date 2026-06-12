import { useNavigate } from 'react-router-dom';
import { useReservationStore } from '@/store/reservationStore';
import EmptyState from '@/components/common/EmptyState';
import { XCircle, TrendingDown, ChevronRight } from 'lucide-react';

export default function CancelledRanking() {
  const navigate = useNavigate();
  const { reservations } = useReservationStore();

  const cancelledCount: Record<string, number> = {};
  
  reservations
    .filter(r => r.status === 'cancelled')
    .forEach(r => {
      cancelledCount[r.bouquetName] = (cancelledCount[r.bouquetName] || 0) + r.quantity;
    });

  const ranking = Object.entries(cancelledCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = ranking.length > 0 ? ranking[0].count : 1;

  const goToBouquetSearch = (keyword: string) => {
    navigate(`/bouquets?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-cream-200">
        <h3 className="font-semibold font-serif text-forest-700 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-400" />
          取消款式排行
        </h3>
      </div>

      <div className="p-5">
        {ranking.length > 0 ? (
          <div className="space-y-4">
            {ranking.map((item, index) => (
              <div
                key={item.name}
                onClick={() => goToBouquetSearch(item.name)}
                className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-xl hover:bg-cream-50 transition-colors"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  index === 0 ? 'bg-rose-500 text-white' :
                  index === 1 ? 'bg-rose-400 text-white' :
                  index === 2 ? 'bg-rose-300 text-white' :
                  'bg-cream-200 text-forest-500'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-forest-700 group-hover:text-rose-500 transition-colors">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-sm text-rose-500 font-medium">{item.count} 次</span>
                      <ChevronRight className="w-4 h-4 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-300 to-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="暂无取消数据"
            description="还没有被取消的订单"
            icon={<TrendingDown className="w-10 h-10 text-rose-300" />}
          />
        )}
      </div>
    </div>
  );
}
