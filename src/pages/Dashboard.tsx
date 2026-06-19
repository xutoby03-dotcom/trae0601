import {
  Droplets,
  AlertTriangle,
  Bell,
  Package,
  TrendingUp,
  Calendar,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { AlertItem } from '../components/AlertItem';
import {
  getFilterStatus,
  getStatusLabel,
  getStatusColor,
} from '../utils/calculations';
import { formatDateCN } from '../utils/date';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const pitchers = useStore((state) => state.pitchers);
  const getDashboardStats = useStore((state) => state.getDashboardStats);
  const getFilterLifePercent = useStore((state) => state.getFilterLifePercent);
  const getFilterDaysLeft = useStore((state) => state.getFilterDaysLeft);
  const getStock = useStore((state) => state.getStock);

  const stats = getDashboardStats();
  const today = formatDateCN(new Date());

  const maxRefillCount = Math.max(
    ...stats.pitcherUsageStats.map((s) => s.refillCount),
    1
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">净水壶滤芯管家</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {today}
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="水壶总数"
            value={stats.totalPitchers}
            icon={<Droplets className="w-full h-full" />}
            iconBgColor="bg-sky-50"
            iconColor="text-sky-600"
            subtitle="正在使用中"
          />
          <StatCard
            title="滤芯健康"
            value={stats.healthyFilters}
            icon={<TrendingUp className="w-full h-full" />}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle={`${stats.warningFilters} 个即将到期`}
            trend={stats.warningFilters > 0 ? 'down' : 'neutral'}
          />
          <StatCard
            title="库存预警"
            value={stats.lowStockCount}
            icon={<Package className="w-full h-full" />}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
            subtitle={stats.lowStockCount > 0 ? '需要及时补货' : '库存充足'}
            trend={stats.lowStockCount > 0 ? 'down' : 'neutral'}
          />
          <StatCard
            title="水质异常"
            value={stats.unresolvedAlerts}
            icon={<Bell className="w-full h-full" />}
            iconBgColor="bg-red-50"
            iconColor="text-red-600"
            subtitle={stats.unresolvedAlerts > 0 ? '有待处理异常' : '一切正常'}
            trend={stats.unresolvedAlerts > 0 ? 'down' : 'neutral'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：滤芯状态列表 + 使用频率 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 滤芯状态列表 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-500" />
                  滤芯状态
                </h2>
                <button
                  onClick={() => navigate('/pitchers')}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 transition-colors"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {pitchers.map((pitcher) => {
                  const lifePercent = getFilterLifePercent(pitcher.id);
                  const daysLeft = getFilterDaysLeft(pitcher.id);
                  const status = getFilterStatus(lifePercent);
                  const stock = getStock(pitcher.filterModel);
                  const isExpiredNoStock = status === 'expired' && stock === 0;

                  return (
                    <div
                      key={pitcher.id}
                      onClick={() => navigate(`/pitchers/${pitcher.id}`)}
                      className={cn(
                        'p-4 rounded-xl transition-all cursor-pointer',
                        isExpiredNoStock
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={pitcher.photo}
                          alt={pitcher.name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {pitcher.name}
                            </h3>
                            <span
                              className={cn(
                                'px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ml-2',
                                isExpiredNoStock
                                  ? 'bg-red-500 text-white'
                                  : status === 'warning'
                                  ? 'bg-amber-100 text-amber-700'
                                  : status === 'expired'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              )}
                            >
                              {isExpiredNoStock ? '急需换芯' : getStatusLabel(status)}
                            </span>
                          </div>
                          <ProgressBar
                            percent={lifePercent}
                            status={status}
                            showLabel={false}
                            height="h-2"
                            className="mb-1.5"
                          />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              剩余 <span className={cn('font-semibold', getStatusColor(status))}>
                                {daysLeft} 天
                              </span>
                            </span>
                            <span
                              className={cn(
                                'font-medium',
                                stock === 0
                                  ? 'text-red-600'
                                  : stock <= 1
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              )}
                            >
                              库存 {stock} 个
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpiredNoStock && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          滤芯已过期且库存为零，请立即购买更换！
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 使用频率图表 */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-sky-500" />
                使用频率（近30天）
              </h2>

              <div className="space-y-3">
                {stats.pitcherUsageStats.map((stat) => (
                  <div key={stat.pitcherId} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-600 font-medium truncate flex-shrink-0">
                      {stat.pitcherName}
                    </span>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg transition-all duration-700 ease-out"
                        style={{
                          width: `${(stat.refillCount / maxRefillCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-gray-700">
                      {stat.refillCount} 次
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 右侧：购买建议 + 最近异常 */}
          <div className="space-y-6">
            {/* 购买建议 */}
            <Card
              className={cn(
                'p-6 relative overflow-hidden',
                stats.purchaseSuggestion.needPurchase
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
              )}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart
                    className={cn(
                      'w-5 h-5',
                      stats.purchaseSuggestion.needPurchase
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    )}
                  />
                  <h2 className="text-lg font-bold text-gray-800">购买建议</h2>
                </div>

                {stats.purchaseSuggestion.needPurchase ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">建议购买数量</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {stats.purchaseSuggestion.suggestedQuantity} 个
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      最快 {stats.purchaseSuggestion.estimatedDaysLeft} 天后需要更换滤芯
                    </p>
                    <button className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors shadow-sm">
                      去购买
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">库存充足</p>
                      <p className="text-2xl font-bold text-emerald-600">无需采购</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      预计 {stats.purchaseSuggestion.estimatedDaysLeft} 天后需要考虑补货
                    </p>
                  </>
                )}
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10">
                <Package className="w-full h-full text-gray-400" />
              </div>
            </Card>

            {/* 最近水质异常 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  水质异常
                </h2>
                {stats.unresolvedAlerts > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {stats.unresolvedAlerts} 个待处理
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {stats.recentAlerts.length > 0 ? (
                  stats.recentAlerts.slice(0, 4).map((alert) => (
                    <AlertItem key={alert.id} alert={alert} showResolve={false} />
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无水质异常记录</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
