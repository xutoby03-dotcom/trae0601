import { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  Percent,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { useTastingStore } from '@/store/tastingStore';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { calculateDailyStats, calculateProductRanking, getTotalWaste } from '@/utils/stats';

interface ChartDataItem {
  [key: string]: string | number;
}

function BarChart({ data, dataKey, labelKey, color = '#FF6B35', height = 200 }: {
  data: ChartDataItem[];
  dataKey: string;
  labelKey: string;
  color?: string;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2 pb-8">
        {data.map((item, index) => {
          const value = Number(item[dataKey]) || 0;
          const percentage = (value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-xs text-stone-600 font-medium mb-1">
                {value}
              </div>
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  minHeight: value > 0 ? '4px' : '0',
                }}
              />
              <div className="text-xs text-stone-500 mt-2 whitespace-nowrap">
                {typeof item[labelKey] === 'string' && item[labelKey].includes('-')
                  ? item[labelKey].slice(5)
                  : item[labelKey]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Statistics() {
  const records = useTastingStore((state) => state.records);
  const products = useProductStore((state) => state.products);
  const batches = useProductStore((state) => state.batches);
  const orders = useOrderStore((state) => state.orders);

  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  const dailyStats = useMemo(
    () => calculateDailyStats(records, products, orders, timeRange),
    [records, products, orders, timeRange]
  );

  const batchesMap = useMemo(() => {
    const map = new Map<string, { productId: string }>();
    batches.forEach((b) => map.set(b.id, { productId: b.productId }));
    return map;
  }, [batches]);

  const productRanking = useMemo(
    () => calculateProductRanking(records, products, batchesMap, orders),
    [records, products, batchesMap, orders]
  );

  const totalStats = useMemo(() => {
    const totalTasting = dailyStats.reduce((sum, d) => sum + d.tastingCount, 0);
    const totalOrders = dailyStats.reduce((sum, d) => sum + d.convertedOrders, 0);
    const totalWaste = getTotalWaste(records);
    const avgConversion = totalTasting > 0 ? totalOrders / totalTasting : 0;

    return {
      totalTasting,
      totalOrders,
      totalWaste,
      avgConversion: Number(avgConversion.toFixed(2)),
    };
  }, [dailyStats, records]);

  const topProducts = productRanking.slice(0, 5);
  const wasteRanking = [...productRanking]
    .sort((a, b) => b.wasteRate - a.wasteRate)
    .slice(0, 5);

  const conversionData = dailyStats.map((d) => ({
    date: d.date,
    value: d.tastingCount,
    orders: d.convertedOrders,
  }));

  const wasteData = dailyStats.map((d) => ({
    date: d.date,
    value: Number(d.wastedPortion.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">统计分析</h1>
          <p className="text-stone-500 mt-1">试吃效果数据一览</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 14 | 30)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                timeRange === days
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {days}天
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">试吃总次数</p>
              <p className="text-3xl font-bold text-stone-800 mt-2">
                {totalStats.totalTasting}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">转化订单</p>
              <p className="text-3xl font-bold text-stone-800 mt-2">
                {totalStats.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">平均转化率</p>
              <p className="text-3xl font-bold text-stone-800 mt-2">
                {(totalStats.avgConversion * 100).toFixed(0)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm">总浪费量</p>
              <p className="text-3xl font-bold text-stone-800 mt-2">
                {totalStats.totalWaste.toFixed(1)}份
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800">试吃消耗趋势</h3>
                <p className="text-sm text-stone-500">每日试吃次数</p>
              </div>
            </div>
          </div>
          <BarChart
            data={conversionData.map((d) => ({
              date: d.date,
              试吃次数: d.value,
              订单数: d.orders,
            }))}
            dataKey="试吃次数"
            labelKey="date"
            color="#FF6B35"
            height={220}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800">浪费量趋势</h3>
                <p className="text-sm text-stone-500">每日撤台浪费（份）</p>
              </div>
            </div>
          </div>
          <BarChart
            data={wasteData.map((d) => ({
              date: d.date,
              浪费量: d.value,
            }))}
            dataKey="浪费量"
            labelKey="date"
            color="#F43F5E"
            height={220}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">最佳试吃商品</h3>
              <p className="text-sm text-stone-500">综合转化率和浪费率评分</p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-400">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      index === 0
                        ? 'bg-amber-100 text-amber-700'
                        : index === 1
                        ? 'bg-stone-200 text-stone-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 truncate">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                      <span>转化率 {(item.conversionRate * 100).toFixed(0)}%</span>
                      <span>·</span>
                      <span>浪费率 {(item.wasteRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-emerald-600">
                      {item.score.toFixed(2)}
                    </p>
                    <p className="text-xs text-stone-400">综合评分</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-800">浪费排行榜</h3>
              <p className="text-sm text-stone-500">浪费率最高的商品</p>
            </div>
          </div>

          {wasteRanking.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-400">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wasteRanking.map((item, index) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      index === 0
                        ? 'bg-rose-100 text-rose-700'
                        : index === 1
                        ? 'bg-orange-100 text-orange-700'
                        : index === 2
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 truncate">
                      {item.productName}
                    </p>
                    <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{ width: `${Math.min(item.wasteRate * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-rose-600">
                      {(item.wasteRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-stone-400">浪费率</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">每日详细数据</h3>
            <p className="text-sm text-stone-500">近{timeRange}天数据明细</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">
                  日期
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  试吃次数
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  已完成
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  消耗总量
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  浪费量
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  转化订单
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  转化率
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-stone-500">
                  浪费率
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dailyStats.map((stat, index) => (
                <tr key={index} className="hover:bg-stone-50">
                  <td className="py-3 px-4 text-sm text-stone-700">
                    {stat.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-700 text-center font-medium">
                    {stat.tastingCount}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-700 text-center">
                    {stat.completedCount}
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-700 text-center">
                    {stat.totalPortion}份
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-700 text-center">
                    {stat.wastedPortion}份
                  </td>
                  <td className="py-3 px-4 text-sm text-stone-700 text-center">
                    {stat.convertedOrders}
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        stat.conversionRate >= 0.5
                          ? 'bg-emerald-100 text-emerald-700'
                          : stat.conversionRate >= 0.2
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {(stat.conversionRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        stat.wasteRate >= 0.5
                          ? 'bg-rose-100 text-rose-700'
                          : stat.wasteRate >= 0.2
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {(stat.wasteRate * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
