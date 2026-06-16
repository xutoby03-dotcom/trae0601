import { MapPin } from 'lucide-react';
import type { DashboardStats } from '../../types';

interface AreaDistributionProps {
  stats: DashboardStats;
}

export const AreaDistribution = ({ stats }: AreaDistributionProps) => {
  const maxCount = Math.max(...stats.areaDistribution.map((a) => a.count), 1);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-primary" />
        <h3 className="text-base font-semibold text-neutral-800">常用区域分布</h3>
      </div>

      {stats.areaDistribution.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-sm">
          暂无数据
        </div>
      ) : (
        <div className="space-y-3">
          {stats.areaDistribution.map((item) => {
            const percent = (item.count / maxCount) * 100;
            return (
              <div key={item.area}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-neutral-700">{item.area}</span>
                  <span className="font-mono font-medium text-neutral-800">
                    {item.count} 人
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
