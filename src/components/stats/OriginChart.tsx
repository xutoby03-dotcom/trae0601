import { FC } from 'react';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import { MapPin } from 'lucide-react';

const OriginChart: FC = () => {
  const { getStats } = useCoffeeStore();
  const stats = getStats();

  const totalBrews = stats.originDistribution.reduce((sum, item) => sum + item.brewCount, 0);

  const colors = [
    '#4A3728',
    '#7BA05B',
    '#D4A574',
    '#C2563B',
    '#6B5748',
    '#9B8B7D',
    '#E8DFD3',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-[#F0F7EA] text-[#5A8A3B]">
          <MapPin className="w-5 h-5" />
        </div>
        <h3
          className="text-lg font-bold text-[#4A3728]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          产区分布
        </h3>
      </div>

      {stats.originDistribution.length === 0 ? (
        <p className="text-center text-[#9B8B7D] py-8">暂无数据</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 flex-wrap mb-2">
            {stats.originDistribution.slice(0, 5).map((item, index) => (
              <div
                key={item.origin}
                className="flex items-center gap-1.5"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs text-[#6B5748]">{item.origin}</span>
              </div>
            ))}
          </div>

          <div className="relative h-40 flex items-end justify-around gap-2 px-2">
            {stats.originDistribution.slice(0, 6).map((item, index) => {
              const height = totalBrews > 0 ? (item.brewCount / totalBrews) * 100 : 0;
              return (
                <div key={item.origin} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-semibold text-[#4A3728]">
                    {item.brewCount}
                  </span>
                  <div
                    className="w-full max-w-12 rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: colors[index % colors.length],
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs text-[#9B8B7D] truncate w-full text-center">
                    {item.origin.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E8DFD3]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B5748]">最常冲煮产区</span>
              <span className="text-sm font-semibold text-[#4A3728]">
                {stats.favoriteOrigin}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OriginChart;
