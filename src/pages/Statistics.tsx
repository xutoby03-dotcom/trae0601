import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
  Trophy,
  Flame,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getMonthKey } from '@/utils/date';

export default function Statistics() {
  const items = useStore((s) => s.items);
  const purchases = useStore((s) => s.purchases);
  const stockLogs = useStore((s) => s.stockLogs);
  const requests = useStore((s) => s.requests);

  const now = new Date();
  const currentMonthKey = getMonthKey(now.toISOString());

  const stats = useMemo(() => {
    const arrivedPurchases = purchases.filter((p) => p.status === 'arrived');
    const totalSpent = arrivedPurchases.reduce((sum, p) => sum + p.actualAmount, 0);
    const totalOrders = arrivedPurchases.length;

    const itemConsume: Record<string, { name: string; consumed: number; purchases: number }> = {};
    stockLogs.forEach((log) => {
      if (log.type === 'consume') {
        const item = items.find((i) => i.id === log.itemId);
        if (!itemConsume[log.itemId]) {
          itemConsume[log.itemId] = { name: item?.name || '未知', consumed: 0, purchases: 0 };
        }
        itemConsume[log.itemId].consumed += Math.abs(log.changeAmount);
      }
    });

    const consumptionRank = Object.entries(itemConsume)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.consumed - a.consumed)
      .slice(0, 5);

    const itemRequestCount: Record<string, { name: string; count: number }> = {};
    requests.forEach((r) => {
      if (!itemRequestCount[r.itemId]) {
        const item = items.find((i) => i.id === r.itemId);
        itemRequestCount[r.itemId] = { name: item?.name || '未知', count: 0 };
      }
      itemRequestCount[r.itemId].count++;
    });
    const stockoutRank = Object.entries(itemRequestCount)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyData: Record<string, number> = {};
    arrivedPurchases.forEach((p) => {
      const key = getMonthKey(p.createdAt);
      monthlyData[key] = (monthlyData[key] || 0) + p.actualAmount;
    });

    const last6Months: { key: string; label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d.toISOString());
      const label = `${d.getMonth() + 1}月`;
      last6Months.push({ key, label, amount: monthlyData[key] || 0 });
    }

    const maxMonthAmount = Math.max(...last6Months.map((m) => m.amount), 1);

    const categorySpend: Record<string, number> = {};
    arrivedPurchases.forEach((p) => {
      const item = items.find((i) => i.id === p.itemId);
      if (item) {
        categorySpend[item.category] = (categorySpend[item.category] || 0) + p.actualAmount;
      }
    });
    const categoryData = Object.entries(categorySpend)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    const totalCategoryAmount = categoryData.reduce((sum, c) => sum + c.amount, 0) || 1;

    const dangerItems = items.filter((i) => i.currentStock < i.minStock);

    return {
      totalSpent,
      totalOrders,
      consumptionRank,
      stockoutRank,
      last6Months,
      maxMonthAmount,
      categoryData,
      totalCategoryAmount,
      dangerItems,
    };
  }, [items, purchases, stockLogs, requests, currentMonthKey]);

  const maxConsume = Math.max(...stats.consumptionRank.map((c) => c.consumed), 1);
  const maxStockout = Math.max(...stats.stockoutRank.map((s) => s.count), 1);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="累计采购花费"
          value={`¥${stats.totalSpent.toLocaleString()}`}
          trend={`共 ${stats.totalOrders} 笔订单`}
          color="brand"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="物品种类"
          value={items.length}
          trend={`${stats.dangerItems.length} 项需补货`}
          color="warn"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="本月订单"
          value={
            purchases.filter(
              (p) => getMonthKey(p.createdAt) === currentMonthKey && p.status !== 'cancelled'
            ).length
          }
          color="brand"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="当前红区"
          value={stats.dangerItems.length}
          trend={stats.dangerItems.length > 0 ? '请及时处理' : '库存健康'}
          color={stats.dangerItems.length > 0 ? 'danger' : 'brand'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-900">近 6 个月采购金额</h3>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {stats.last6Months.map((m) => {
              const height = (m.amount / stats.maxMonthAmount) * 100;
              return (
                <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium text-slate-700">
                    {m.amount > 0 ? `¥${m.amount}` : ''}
                  </div>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-700"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="text-xs text-slate-500">{m.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-warn-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-warn-500" />
            </div>
            <h3 className="font-semibold text-slate-900">分类花费占比</h3>
          </div>
          {stats.categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">暂无数据</div>
          ) : (
            <div className="space-y-4">
              {stats.categoryData.map((c) => {
                const percent = (c.amount / stats.totalCategoryAmount) * 100;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-700 font-medium">{c.name}</span>
                      <span className="text-slate-500">
                        ¥{c.amount.toLocaleString()} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warn-400 to-warn-500 rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-danger-50 flex items-center justify-center">
              <Flame className="w-4 h-4 text-danger-500" />
            </div>
            <h3 className="font-semibold text-slate-900">消耗最快 TOP 5</h3>
          </div>
          {stats.consumptionRank.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {stats.consumptionRank.map((c, idx) => (
                <div key={c.id} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-600'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-600'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx < 3 ? <Trophy className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-900">{c.name}</span>
                      <span className="text-slate-600">{c.consumed}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-danger-400 to-danger-500 rounded-full transition-all duration-700"
                        style={{ width: `${(c.consumed / maxConsume) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-danger-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger-500" />
            </div>
            <h3 className="font-semibold text-slate-900">经常断货排行</h3>
          </div>
          {stats.stockoutRank.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {stats.stockoutRank.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? 'bg-danger-100 text-danger-600'
                        : idx === 1
                        ? 'bg-warn-100 text-warn-600'
                        : idx === 2
                        ? 'bg-brand-100 text-brand-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-900">{s.name}</span>
                      <span className="text-danger-600 font-medium">{s.count} 次</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warn-400 to-danger-500 rounded-full transition-all duration-700"
                        style={{ width: `${(s.count / maxStockout) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'brand' | 'danger' | 'warn';
  trend?: string;
}

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  const colorClasses = {
    brand: 'from-brand-50 to-white text-brand-600',
    danger: 'from-danger-50 to-white text-danger-500',
    warn: 'from-warn-50 to-white text-warn-500',
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="title-display !text-2xl !mb-1">{value}</p>
      {trend && <p className="text-xs text-slate-500">{trend}</p>}
    </div>
  );
}
