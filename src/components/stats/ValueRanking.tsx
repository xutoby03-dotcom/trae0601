import { FC } from 'react';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import { TrendingUp, Star, DollarSign } from 'lucide-react';

const ValueRanking: FC = () => {
  const { getStats } = useCoffeeStore();
  const stats = getStats();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-[#FFF4E6] text-[#E07B39]">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3
          className="text-lg font-bold text-[#4A3728]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          性价比排行
        </h3>
      </div>

      {stats.topValueBeans.length === 0 ||
      stats.topValueBeans.every((b) => b.avgRating === 0) ? (
        <p className="text-center text-[#9B8B7D] py-8">
          暂无数据，多冲煮几次再来看看
        </p>
      ) : (
        <div className="space-y-3">
          {stats.topValueBeans.map((item, index) => (
            <div
              key={item.bean.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                index === 0 ? 'bg-[#FFF8F0]' : 'bg-[#FAF7F2] hover:bg-[#F5EFE6]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-[#D4A574] text-white'
                    : index === 1
                      ? 'bg-[#9B8B7D] text-white'
                      : index === 2
                        ? 'bg-[#B8956E] text-white'
                        : 'bg-[#E8DFD3] text-[#6B5748]'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#4A3728] truncate">
                  {item.bean.name}
                </p>
                <p className="text-xs text-[#9B8B7D]">{item.bean.origin}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-0.5">
                  <Star className="w-3 h-3 text-[#D4A574] fill-[#D4A574]" />
                  <span className="text-sm font-semibold text-[#4A3728]">
                    {item.avgRating > 0 ? item.avgRating.toFixed(1) : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#7BA05B]" />
                  <span className="text-xs text-[#6B5748]">
                    ¥{item.pricePerGram.toFixed(2)}/g
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValueRanking;
