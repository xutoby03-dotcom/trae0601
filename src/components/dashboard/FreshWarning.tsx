import { useNavigate } from 'react-router-dom';
import { useBouquetStore } from '@/store/bouquetStore';
import { daysUntil, formatPrice } from '@/utils/date';
import EmptyState from '@/components/common/EmptyState';
import { AlertTriangle, MapPin, ChevronRight } from 'lucide-react';

export default function FreshWarning() {
  const navigate = useNavigate();
  const { bouquets } = useBouquetStore();

  const warningBouquets = bouquets
    .filter(b => daysUntil(b.freshUntil) <= 2 && b.stock > 0)
    .sort((a, b) => daysUntil(a.freshUntil) - daysUntil(b.freshUntil));

  const goToFreshWarning = () => {
    navigate('/bouquets?filter=expiring');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div
        onClick={goToFreshWarning}
        className="px-5 py-4 border-b border-cream-200 cursor-pointer hover:bg-cream-50 transition-colors"
      >
        <h3 className="font-semibold font-serif text-forest-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          保鲜期预警
          <span className="ml-auto flex items-center gap-1 text-sm">
            <span className="font-normal text-forest-400">{warningBouquets.length} 款</span>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </span>
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {warningBouquets.length > 0 ? (
          <div className="divide-y divide-cream-100">
            {warningBouquets.map((bouquet) => {
              const freshDays = daysUntil(bouquet.freshUntil);
              const isUrgent = freshDays <= 1;

              return (
                <div key={bouquet.id} className="px-5 py-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={bouquet.photo}
                      alt={bouquet.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-forest-700 truncate">
                        {bouquet.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-forest-400" />
                        <span className="text-xs text-forest-400">{bouquet.freshLocation}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-medium ${
                        isUrgent ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {freshDays <= 0 ? '今天到期' : `还剩 ${freshDays} 天`}
                      </div>
                      <p className="text-xs text-forest-400 mt-1">
                        库存 {bouquet.stock} 束 · {formatPrice(bouquet.price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="暂无保鲜预警"
            description="所有花束都在最佳保鲜期内"
          />
        )}
      </div>
    </div>
  );
}
