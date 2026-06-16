import { useMemo } from 'react';
import { BarChart3, Clock, Package, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store';
import { getOverdueHours } from '@/utils/date';
import { ACCESSORY_META } from '@/types';
import type { AccessoryType } from '@/types';

interface ActivityStat {
  name: string;
  count: number;
  overdueCount: number;
  totalOverdueHours: number;
}

export default function StatsPage() {
  const { borrowRecords, repairRecords, canopies } = useStore();

  const activityStats = useMemo<ActivityStat[]>(() => {
    const map = new Map<string, ActivityStat>();
    borrowRecords.forEach((r) => {
      const existing = map.get(r.activityName) || {
        name: r.activityName,
        count: 0,
        overdueCount: 0,
        totalOverdueHours: 0,
      };
      existing.count++;
      const hrs = getOverdueHours(r.dueTime, r.returnTime);
      if (hrs > 0) {
        existing.overdueCount++;
        existing.totalOverdueHours += hrs;
      }
      map.set(r.activityName, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.overdueCount - a.overdueCount || b.totalOverdueHours - a.totalOverdueHours);
  }, [borrowRecords]);

  const accessoryDamage = useMemo(() => {
    const result: Record<AccessoryType, number> = { tarp: 0, pole: 0, bar: 0, stake: 0, bag: 0 };
    borrowRecords.forEach((r) => {
      if (!r.returnedItems) return;
      (Object.keys(result) as AccessoryType[]).forEach((type) => {
        const diff = r.borrowedItems[type] - r.returnedItems[type];
        if (diff > 0) result[type] += diff;
      });
    });
    repairRecords.forEach((r) => {
      if (r.accessoryType && r.status === 'pending') {
        result[r.accessoryType]++;
      }
    });
    return result;
  }, [borrowRecords, repairRecords]);

  const totalRecords = borrowRecords.length;
  const totalOverdue = borrowRecords.filter((r) => {
    const hrs = getOverdueHours(r.dueTime, r.returnTime);
    return hrs > 0;
  }).length;
  const overdueRate = totalRecords > 0 ? ((totalOverdue / totalRecords) * 100).toFixed(1) : '0';

  const totalDamage = Object.values(accessoryDamage).reduce((a, b) => a + b, 0);
  const maxActivityHours = Math.max(...activityStats.map((a) => a.totalOverdueHours), 1);
  const maxDamageQty = Math.max(...Object.values(accessoryDamage), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">统计分析</h2>
        <p className="text-sm text-gray-500 mt-0.5">查看活动超时情况和配件损耗数据</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-600">总借用次数</div>
              <div className="text-3xl font-bold text-blue-700">{totalRecords}</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-600">超时归还</div>
              <div className="text-3xl font-bold text-red-700">
                {totalOverdue}
                <span className="text-sm font-normal ml-2 text-red-500">{overdueRate}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Package size={22} />
            </div>
            <div>
              <div className="text-sm text-gray-600">配件损耗</div>
              <div className="text-3xl font-bold text-amber-700">{totalDamage} 件</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900">活动超时归还排行</h3>
        </div>
        {activityStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        ) : (
          <div className="space-y-3">
            {activityStats.map((a, idx) => {
              const widthPct = (a.totalOverdueHours / maxActivityHours) * 100;
              return (
                <div key={a.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-red-100 text-red-700' : idx === 1 ? 'bg-amber-100 text-amber-700' : idx === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900">{a.name}</span>
                    </div>
                    <div className="text-gray-500">
                      借用 {a.count} 次 · 超时 {a.overdueCount} 次 · 共 {a.totalOverdueHours} 小时
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-primary-600" />
          <h3 className="font-semibold text-gray-900">配件损耗统计</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {(Object.keys(ACCESSORY_META) as AccessoryType[]).map((type) => {
            const qty = accessoryDamage[type];
            const heightPct = (qty / maxDamageQty) * 100 || 5;
            return (
              <div key={type} className="flex flex-col items-center">
                <div className="w-full h-32 flex items-end justify-center">
                  <div
                    className="w-14 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-800">
                      {qty}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700">{ACCESSORY_META[type].name}</div>
                <div className="text-xs text-gray-400">
                  库存: {canopies.reduce((sum, c) => sum + c.accessories[type], 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
