import { BarChart3, TrendingDown, Users, Package, Award, Clock, AlertTriangle } from 'lucide-react';
import { useFoodStore } from '../store/useFoodStore';
import { useAutoExpire } from '../hooks/useAutoExpire';

export default function Stats() {
  useAutoExpire();
  
  const { getStats, foods, claimRecords, disposalRecords } = useFoodStore();
  const stats = getStats();

  const totalFoodsPublished = foods.length;
  const totalClaimed = claimRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalDisposed = disposalRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalQuantity = foods.reduce((sum, f) => sum + f.quantity, 0) + totalDisposed;
  const claimRate = totalQuantity > 0 ? Math.round((totalClaimed / totalQuantity) * 100) : 0;

  const statCards = [
    {
      label: '可认领份数',
      value: stats.totalAvailable,
      icon: Package,
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: '今日安全可取',
      value: stats.safeToTakeToday,
      icon: Clock,
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '今日已认领',
      value: stats.todayClaimed,
      icon: Users,
      color: 'from-primary-400 to-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: '总认领率',
      value: `${claimRate}%`,
      icon: TrendingDown,
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">数据统计</h1>
            <p className="text-coffee-500 text-sm">茶歇浪费分析与部门排行</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl shadow-md p-5 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-coffee-500 font-medium">{card.label}</span>
                  <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 bg-gradient-to-br ${card.color} bg-clip-text`} style={{ color: card.color.includes('emerald') ? '#10b981' : card.color.includes('blue') ? '#3b82f6' : card.color.includes('primary') ? '#f97316' : '#a855f7' }} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-coffee-800">{card.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-coffee-800 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              部门剩余排行
              <span className="text-xs font-normal text-coffee-400 ml-auto">
                剩余食品数量最多的部门
              </span>
            </h2>
            
            {stats.topWasteDepartments.length > 0 ? (
              <div className="space-y-4">
                {stats.topWasteDepartments.map((item, index) => {
                  const maxCount = Math.max(...stats.topWasteDepartments.map((d) => d.count));
                  const percentage = (item.count / maxCount) * 100;
                  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  return (
                    <div key={item.department}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{medals[index]}</span>
                          <span className="font-medium text-coffee-700">{item.department}</span>
                        </div>
                        <span className="text-sm font-semibold text-coffee-600">{item.count} 份</span>
                      </div>
                      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-coffee-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无数据</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-coffee-800 mb-5 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              常没人领的食品
              <span className="text-xs font-normal text-coffee-400 ml-auto">
                进入处理记录的食品
              </span>
            </h2>
            
            {stats.commonlyUnclaimed.length > 0 ? (
              <div className="space-y-4">
                {stats.commonlyUnclaimed.map((item, index) => {
                  const maxCount = Math.max(...stats.commonlyUnclaimed.map((d) => d.count));
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                            {index + 1}
                          </span>
                          <span className="font-medium text-coffee-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-coffee-600">{item.count} 份</span>
                      </div>
                      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-coffee-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无数据</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-coffee-800 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" />
            总体数据概览
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-warm-50 rounded-xl">
              <div className="text-2xl font-bold text-coffee-800">{totalFoodsPublished}</div>
              <div className="text-sm text-coffee-500">发布食品种类</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">{totalClaimed}</div>
              <div className="text-sm text-emerald-500">累计已认领</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{totalDisposed}</div>
              <div className="text-sm text-red-500">累计处理</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{claimRecords.length}</div>
              <div className="text-sm text-blue-500">认领记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
