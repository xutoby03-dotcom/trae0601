import { FC } from 'react';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import { Droplets, Thermometer, Coffee } from 'lucide-react';

const CommonParams: FC = () => {
  const { getStats } = useCoffeeStore();
  const stats = getStats();

  const topEquipment = stats.commonEquipment[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-[#F0EFEA] text-[#6B5748]">
          <Coffee className="w-5 h-5" />
        </div>
        <h3
          className="text-lg font-bold text-[#4A3728]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          常用冲煮参数
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] rounded-xl p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#E8F0E0] flex items-center justify-center">
            <Coffee className="w-5 h-5 text-[#5A8A3B]" />
          </div>
          <p className="text-xs text-[#9B8B7D] mb-1">最常用器具</p>
          <p className="text-sm font-semibold text-[#4A3728]">
            {topEquipment?.equipment || '暂无'}
          </p>
          {topEquipment && (
            <p className="text-xs text-[#7BA05B]">{topEquipment.count} 次使用</p>
          )}
        </div>

        <div className="bg-[#FAF7F2] rounded-xl p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FFF4E6] flex items-center justify-center">
            <Droplets className="w-5 h-5 text-[#E07B39]" />
          </div>
          <p className="text-xs text-[#9B8B7D] mb-1">最常粉水比</p>
          <p className="text-sm font-semibold text-[#4A3728]">
            {stats.commonRatio || '暂无'}
          </p>
        </div>

        <div className="bg-[#FAF7F2] rounded-xl p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#FFE6E0] flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-[#C2563B]" />
          </div>
          <p className="text-xs text-[#9B8B7D] mb-1">常用水温</p>
          <p className="text-sm font-semibold text-[#4A3728]">
            {stats.commonTemp ? `${stats.commonTemp}°C` : '暂无'}
          </p>
        </div>
      </div>

      {stats.commonEquipment.length > 1 && (
        <div className="mt-5 pt-4 border-t border-[#E8DFD3]">
          <p className="text-xs text-[#9B8B7D] mb-3">器具使用排行</p>
          <div className="space-y-2">
            {stats.commonEquipment.slice(0, 3).map((item, index) => {
              const maxCount = stats.commonEquipment[0]?.count || 1;
              const width = (item.count / maxCount) * 100;
              return (
                <div key={item.equipment} className="flex items-center gap-3">
                  <span className="text-xs text-[#6B5748] w-24 truncate">
                    {item.equipment}
                  </span>
                  <div className="flex-1 h-2 bg-[#E8DFD3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4A574] to-[#C28B3B] rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#4A3728] w-8 text-right">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonParams;
