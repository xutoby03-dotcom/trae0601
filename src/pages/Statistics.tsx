import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, AlertCircle, Award, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { isExpired, isExpiringSoon, isThisMonth } from '@/utils/dateUtils';
import type { Category } from '@/types';

const BAR_COLORS = ['#10B981', '#F97316', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

export default function Statistics() {
  const medicines = useStore((s) => s.medicines);
  const stockRecords = useStore((s) => s.stockRecords);

  const monthlyUseByCategory = useMemo(() => {
    const map = new Map<Category, number>();
    stockRecords
      .filter((r) => r.type === 'use' && isThisMonth(r.timestamp))
      .forEach((r) => {
        const med = medicines.find((m) => m.id === r.medicineId);
        if (med) {
          map.set(med.category, (map.get(med.category) || 0) + r.quantity);
        }
      });
    const arr = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return arr;
  }, [stockRecords, medicines]);

  const expiringSoonValue = useMemo(() => {
    let total = 0;
    let items = 0;
    medicines
      .filter((m) => !m.disposed && isExpiringSoon(m.expiryDate) && !isExpired(m.expiryDate))
      .forEach((m) => {
        const restock = stockRecords
          .filter((r) => r.medicineId === m.id && r.type === 'restock' && r.unitPrice)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
        if (restock?.unitPrice) {
          total += restock.unitPrice * m.quantity;
          items++;
        }
      });
    return { total, items };
  }, [medicines, stockRecords]);

  const frequentOutage = useMemo(() => {
    return medicines
      .filter((m) => !m.disposed)
      .map((m) => {
        const outCount = stockRecords.filter(
          (r) => r.medicineId === m.id && r.type === 'use'
        ).length;
        const isNowLow = m.quantity <= m.lowStockThreshold;
        return {
          medicine: m,
          score: outCount * 2 + (isNowLow ? 5 : 0),
          useCount: outCount,
          isNowLow,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [medicines, stockRecords]);

  const monthlyUseCount = stockRecords.filter(
    (r) => r.type === 'use' && isThisMonth(r.timestamp)
  ).reduce((sum, r) => sum + r.quantity, 0);

  const monthlyRestockCost = stockRecords
    .filter((r) => r.type === 'restock' && isThisMonth(r.timestamp) && r.unitPrice)
    .reduce((sum, r) => sum + (r.unitPrice || 0) * r.quantity, 0);

  return (
    <div className="pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-gray-800 mb-2">📊 统计分析</h1>
        <p className="text-sm text-gray-500">本月家庭药箱使用情况一览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-xs text-gray-500">本月使用</p>
          <p className="font-display text-3xl text-gray-800">{monthlyUseCount}</p>
          <p className="text-xs text-gray-400">件药品/用品</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-accent-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-accent-600" />
          </div>
          <p className="text-xs text-gray-500">本月补货支出</p>
          <p className="font-display text-3xl text-gray-800">
            ¥{monthlyRestockCost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">按记录单价</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-warning-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-warning-600" />
          </div>
          <p className="text-xs text-gray-500">快过期金额</p>
          <p className="font-display text-3xl text-warning-600">
            ¥{expiringSoonValue.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">{expiringSoonValue.items} 种药品</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-danger-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-danger-600" />
          </div>
          <p className="text-xs text-gray-500">管理品类</p>
          <p className="font-display text-3xl text-gray-800">
            {medicines.filter((m) => !m.disposed).length}
          </p>
          <p className="text-xs text-gray-400">种药品/用品</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-display text-xl text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          本月使用品类排行
        </h3>
        {monthlyUseByCategory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📈</p>
            <p>本月暂无使用记录</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyUseByCategory} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`${value} 件`, '使用量']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                  {monthlyUseByCategory.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-xl text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-warning-500" />
            常缺物品排行榜
          </h3>
          {frequentOutage.length === 0 || !frequentOutage[0]?.useCount ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm">暂无缺货记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {frequentOutage.map((item, i) => (
                <div
                  key={item.medicine.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-display text-lg ${
                      i === 0
                        ? 'bg-warning-100 text-warning-600'
                        : i === 1
                        ? 'bg-gray-200 text-gray-600'
                        : i === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="text-2xl">{item.medicine.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.medicine.name}</p>
                    <p className="text-xs text-gray-500">{item.medicine.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      使用 {item.useCount} 次
                    </p>
                    {item.isNowLow && (
                      <p className="text-xs text-danger-600">当前库存低</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display text-xl text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger-500" />
            快过期明细
          </h3>
          {(() => {
            const list = medicines
              .filter((m) => !m.disposed && isExpiringSoon(m.expiryDate) && !isExpired(m.expiryDate))
              .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
            if (list.length === 0) {
              return (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm">近期无快过期药品</p>
                </div>
              );
            }
            return (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {list.map((m) => {
                  const restock = stockRecords
                    .filter((r) => r.medicineId === m.id && r.type === 'restock' && r.unitPrice)
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
                  const value = restock?.unitPrice ? restock.unitPrice * m.quantity : null;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-warning-50/70 border border-warning-100"
                    >
                      <div className="text-2xl">{m.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{m.name}</p>
                        <p className="text-xs text-gray-500">
                          剩 {m.quantity}{m.unit} · 至 {m.expiryDate}
                        </p>
                      </div>
                      {value !== null && (
                        <p className="text-sm font-semibold text-warning-700">¥{value.toFixed(2)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
