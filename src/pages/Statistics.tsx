import { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  MapPin,
  PawPrint,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { usePetStore } from '@/store/usePetStore';
import { formatDuration } from '@/utils/time';
import { cn } from '@/lib/utils';

export function Statistics() {
  const getStatistics = usePetStore((state) => state.getStatistics);
  const stats = useMemo(() => getStatistics(), [getStatistics]);

  const maxTrendValue = Math.max(...stats.dailyTrend.map(d => Math.max(d.missing, d.found)), 1);

  const statCards = [
    {
      label: '协寻总数',
      value: stats.totalMissing + stats.totalFound,
      icon: PawPrint,
      color: 'from-orange-400 to-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: '已找回',
      value: stats.totalFound,
      icon: CheckCircle2,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: '找回率',
      value: `${stats.recoveryRate}%`,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '平均找回时间',
      value: formatDuration(stats.averageRecoveryTime),
      icon: Clock,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-orange-500" />
          数据统计
        </h1>
        <p className="text-gray-500">社区宠物协寻平台数据概览</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
                "transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl", card.bgColor, "flex items-center justify-center")}>
                  <Icon className={cn("w-5 h-5", card.textColor)} />
                </div>
                <TrendingUp className={cn("w-4 h-4", card.textColor)} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            线索最多的区域
          </h2>
          {stats.topAreas.length > 0 ? (
            <div className="space-y-4">
              {stats.topAreas.map((area, index) => {
                const maxCount = Math.max(...stats.topAreas.map(a => a.count), 1);
                const percentage = (area.count / maxCount) * 100;
                const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                return (
                  <div key={area.area}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{medals[index]}</span>
                        <span className="font-medium text-gray-700">{area.area}</span>
                      </div>
                      <span className="text-sm text-gray-500">{area.count} 条线索</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          index === 0 ? "bg-orange-500" :
                          index === 1 ? "bg-orange-400" :
                          index === 2 ? "bg-orange-300" :
                          index === 3 ? "bg-orange-200" : "bg-orange-100"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">暂无数据</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            近7天趋势
          </h2>
          <div className="flex items-end justify-between h-[200px] gap-2">
            {stats.dailyTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end gap-1 h-[150px]">
                  {day.missing > 0 && (
                    <div
                      className="bg-orange-400 rounded-t-lg transition-all duration-1000"
                      style={{
                        height: `${(day.missing / maxTrendValue) * 50}%`,
                        minHeight: day.missing > 0 ? '8px' : '0',
                      }}
                      title={`协寻：${day.missing}`}
                    />
                  )}
                  {day.found > 0 && (
                    <div
                      className="bg-green-400 rounded-t-lg transition-all duration-1000"
                      style={{
                        height: `${(day.found / maxTrendValue) * 50}%`,
                        minHeight: day.found > 0 ? '8px' : '0',
                      }}
                      title={`找回：${day.found}`}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {day.date.split('/').slice(1).join('/')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded" />
              <span className="text-sm text-gray-600">新增协寻</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded" />
              <span className="text-sm text-gray-600">已找回</span>
            </div>
          </div>
        </div>
      </div>

      {stats.recoveryRate < 50 && stats.totalMissing > 5 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">温馨提示</h3>
              <p className="text-sm text-amber-700">
                当前找回率偏低，建议大家：
                <span className="block mt-1">1. 出门时务必牵好绳、关好门窗</span>
                <span className="block">2. 给宠物佩戴带有联系方式的项圈</span>
                <span className="block">3. 发现走失立即在平台发布协寻并扩散</span>
                <span className="block">4. 看到走失宠物及时提供线索</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
