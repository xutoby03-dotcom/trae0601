import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Package, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PIE_COLORS = ['#F97316', '#FBBF24', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'];

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#CD7F32'];

interface HourData {
  hour: string;
  count: number;
  isBusiest: boolean;
}

interface AddOnRank {
  name: string;
  count: number;
}

interface ProductRank {
  name: string;
  quantity: number;
}

export default function Stats() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const todayOrders = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return orders.filter((o) => o.createdAt.startsWith(todayStr));
  }, [orders]);

  const hourlyData: HourData[] = useMemo(() => {
    const hours = ['6:00', '7:00', '8:00', '9:00', '10:00'];
    const hourKeys = [6, 7, 8, 9, 10];
    const counts = hourKeys.map((h) => {
      return todayOrders.filter((o) => {
        const hour = parseInt(o.pickupTime.split(':')[0], 10);
        return hour === h;
      }).length;
    });
    const maxCount = Math.max(...counts, 0);
    return hours.map((hour, i) => ({
      hour,
      count: counts[i],
      isBusiest: counts[i] === maxCount && maxCount > 0,
    }));
  }, [todayOrders]);

  const busiestHour = useMemo(() => {
    const max = hourlyData.reduce(
      (prev, curr) => (curr.count > prev.count ? curr : prev),
      hourlyData[0]
    );
    return max && max.count > 0 ? max : null;
  }, [hourlyData]);

  const addOnRankings: AddOnRank[] = useMemo(() => {
    const map = new Map<string, number>();
    todayOrders.forEach((o) => {
      o.items.forEach((item) => {
        item.selectedAddOns.forEach((addon) => {
          map.set(addon, (map.get(addon) || 0) + 1);
        });
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [todayOrders]);

  const productRankings: ProductRank[] = useMemo(() => {
    const map = new Map<string, number>();
    todayOrders.forEach((o) => {
      o.items.forEach((item) => {
        map.set(item.productName, (map.get(item.productName) || 0) + item.quantity);
      });
    });
    return Array.from(map.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [todayOrders]);

  const totalAddOns = useMemo(
    () => addOnRankings.reduce((sum, a) => sum + a.count, 0),
    [addOnRankings]
  );

  const topAddOn = useMemo(
    () => (addOnRankings.length > 0 ? addOnRankings[0].name : '-'),
    [addOnRankings]
  );

  const avgPrepTime = useMemo(() => {
    if (todayOrders.length === 0) return 0;
    const total = todayOrders.reduce((sum, o) => {
      const maxPrep = Math.max(
        ...o.items.map((item) => {
          const p = products.find((pr) => pr.id === item.productId);
          return p ? p.prepTime * item.quantity : 0;
        }),
        0
      );
      return sum + maxPrep;
    }, 0);
    return Math.round(total / todayOrders.length);
  }, [todayOrders, products]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <div className="text-sm text-brown-500">今日订单</div>
            <div className="text-2xl font-semibold text-brown-800">{todayOrders.length}</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm text-brown-500">总商品数</div>
            <div className="text-2xl font-semibold text-brown-800">{products.length}</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-brown-500">热门加料</div>
            <div className="text-2xl font-semibold text-brown-800">{topAddOn}</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-brown-500">平均备餐</div>
            <div className="text-2xl font-semibold text-brown-800">{avgPrepTime}分钟</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-4">时段分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <XAxis dataKey="hour" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip
                formatter={(value: number) => [`${value}单`, '订单数']}
                labelFormatter={(label: string) => `${label.replace(':00', '')}点`}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill="#F97316"
              >
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isBusiest ? '#EA580C' : '#F97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {busiestHour && (
            <p className="text-sm text-brown-600 mt-2">
              最忙时段: {busiestHour.hour.replace(':00', '')}点 (共{busiestHour.count}单)
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">加料排行</h2>
            <span className="text-sm text-brown-500">共{totalAddOns}次</span>
          </div>
          {addOnRankings.length === 0 ? (
            <p className="text-brown-400 text-sm text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {addOnRankings.map((addon, i) => {
                const maxCount = addOnRankings[0].count;
                const widthPercent = maxCount > 0 ? (addon.count / maxCount) * 100 : 0;
                return (
                  <div key={addon.name}>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          backgroundColor: i < 3 ? RANK_COLORS[i] : '#94A3B8',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-brown-800 truncate">
                            {addon.name}
                          </span>
                          <span className="text-sm text-brown-500 ml-2">{addon.count}次</span>
                        </div>
                        <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-400 rounded-full transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">商品销量排行</h2>
            <span className="text-sm text-brown-500">共{todayOrders.length}单</span>
          </div>
          {productRankings.length === 0 ? (
            <p className="text-brown-400 text-sm text-center py-8">暂无数据</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productRankings.map((product, i) => {
                const maxQty = productRankings[0].quantity;
                const widthPercent = maxQty > 0 ? (product.quantity / maxQty) * 100 : 0;
                return (
                  <div key={product.name} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        backgroundColor: i < 3 ? RANK_COLORS[i] : '#94A3B8',
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-brown-800 truncate">
                          {product.name}
                        </span>
                        <span className="text-sm text-brown-500 ml-2">{product.quantity}份</span>
                      </div>
                      <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
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
