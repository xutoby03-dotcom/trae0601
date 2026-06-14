import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  CheckCircle,
  Clock,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Plus,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useTastingStore } from '@/store/tastingStore';
import { useProductStore } from '@/store/productStore';
import { formatTime, getMinutesUntil, formatDuration, getDaysUntil } from '@/utils/date';
import { getTodayWaste } from '@/utils/stats';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, gradient, subtitle }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-6 text-white ${gradient} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const records = useTastingStore((state) => state.records);
  const getActiveRecords = useTastingStore((state) => state.getActiveRecords);
  const getTodayRecords = useTastingStore((state) => state.getTodayRecords);
  const getExpiringSoon = useTastingStore((state) => state.getExpiringSoon);
  const getExpired = useTastingStore((state) => state.getExpired);
  const getNearExpiryBatches = useProductStore((state) => state.getNearExpiryBatches);
  const getProductById = useProductStore((state) => state.getProductById);
  const getBatchById = useProductStore((state) => state.getBatchById);
  const getBatchUrgency = useProductStore((state) => state.getBatchUrgency);

  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const activeRecords = getActiveRecords();
  const todayRecords = getTodayRecords();
  const expiringSoon = getExpiringSoon(30);
  const expired = getExpired();
  const nearExpiryBatches = getNearExpiryBatches();
  const todayWaste = getTodayWaste(records);

  const completedToday = todayRecords.filter(
    (r) => r.status === 'completed' || r.status === 'expired'
  ).length;

  const allAlerts = [...expired, ...expiringSoon].slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">仪表盘</h1>
          <p className="text-stone-500 mt-1">今天的试吃情况一目了然</p>
        </div>
        <button
          onClick={() => navigate('/tasting/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建试吃
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="今日领用"
          value={todayRecords.length}
          icon={UtensilsCrossed}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="批次试吃"
        />
        <StatCard
          title="正在展台"
          value={activeRecords.length}
          icon={Clock}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          subtitle="进行中"
        />
        <StatCard
          title="已完成"
          value={completedToday}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="今日撤台"
        />
        <StatCard
          title="今日浪费"
          value={`${todayWaste.toFixed(2)}份`}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-rose-500 to-rose-600"
          subtitle="未售罄撤台"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-800">过期提醒</h2>
                <p className="text-sm text-stone-500">及时撤台，保证食品安全</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
              {expired.length + expiringSoon.length} 条
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {allAlerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-stone-500">所有试吃台状态正常</p>
              </div>
            ) : (
              allAlerts.map((record) => {
                const batch = getBatchById(record.batchId);
                const product = batch ? getProductById(batch.productId) : null;
                const minutesLeft = getMinutesUntil(record.expectedEndTime);
                const isExpired = minutesLeft <= 0;

                return (
                  <div
                    key={record.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isExpired
                        ? 'bg-rose-50 border-rose-200 animate-pulse'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isExpired ? 'bg-rose-200' : 'bg-amber-200'
                        }`}
                      >
                        <Clock
                          className={`w-6 h-6 ${isExpired ? 'text-rose-700' : 'text-amber-700'}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">
                          {product?.name || '未知商品'}
                        </p>
                        <p className="text-sm text-stone-500">
                          {record.stationLocation} · {record.operatorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          isExpired ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {isExpired ? '已过期' : formatDuration(minutesLeft)}
                      </p>
                      <p className="text-xs text-stone-500">
                        开始于 {formatTime(record.startTime)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {allAlerts.length > 0 && (
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={() => navigate('/tasting')}
                className="w-full flex items-center justify-center gap-2 py-3 text-orange-600 font-medium hover:bg-orange-50 rounded-xl transition-colors"
              >
                查看全部试吃台
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-800">临期批次</h2>
              <p className="text-sm text-stone-500">优先安排试吃</p>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {nearExpiryBatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-stone-500">暂无临期批次</p>
              </div>
            ) : (
              nearExpiryBatches
                .sort(
                  (a, b) =>
                    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                )
                .slice(0, 6)
                .map((batch) => {
                  const product = getProductById(batch.productId);
                  const urgency = getBatchUrgency(batch);
                  const daysLeft = getDaysUntil(batch.expiryDate);

                  return (
                    <div
                      key={batch.id}
                      className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-800 truncate">
                            {product?.name || '未知商品'}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {batch.batchNumber} · 库存 {batch.stock}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ml-2 flex-shrink-0 ${
                            urgency === 'urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {daysLeft > 0 ? `${daysLeft}天` : '过期'}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {nearExpiryBatches.length > 0 && (
            <div className="p-4 border-t border-stone-100">
              <button
                onClick={() => navigate('/tasting/new')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                快速领用试吃
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800 text-lg">正在展台</h2>
          <button
            onClick={() => navigate('/tasting')}
            className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {activeRecords.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">暂无进行中的试吃</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRecords.slice(0, 6).map((record) => {
                const batch = getBatchById(record.batchId);
                const product = batch ? getProductById(batch.productId) : null;
                const minutesLeft = getMinutesUntil(record.expectedEndTime);
                const totalMinutes =
                  (new Date(record.expectedEndTime).getTime() -
                    new Date(record.startTime).getTime()) /
                  60000;
                const progress = Math.max(
                  0,
                  Math.min(100, (1 - minutesLeft / totalMinutes) * 100)
                );
                const isExpired = minutesLeft <= 0;
                const isWarning = minutesLeft <= 30 && minutesLeft > 0;

                return (
                  <div
                    key={record.id}
                    className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                      isExpired
                        ? 'border-rose-300 bg-rose-50'
                        : isWarning
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-stone-100 rounded-xl flex-shrink-0 overflow-hidden">
                        {product?.photo ? (
                          <img
                            src={product.photo}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-stone-400 m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 truncate">
                          {product?.name || '未知商品'}
                        </p>
                        <p className="text-sm text-stone-500">{record.stationLocation}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-500">剩余时间</span>
                        <span
                          className={`font-bold ${
                            isExpired
                              ? 'text-rose-600'
                              : isWarning
                              ? 'text-amber-600'
                              : 'text-stone-700'
                          }`}
                        >
                          {isExpired ? '已过期' : formatDuration(minutesLeft)}
                        </span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isExpired
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-stone-500">
                        领用人: {record.operatorName}
                      </span>
                      <span className="text-stone-600 font-medium">
                        已转化 {record.convertedOrders} 单
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
