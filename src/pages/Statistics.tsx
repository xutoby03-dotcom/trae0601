import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Trash2,
  Package,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus } from '../store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_TEXT_COLORS,
  Category,
} from '../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { differenceInDays, parseISO, format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function Statistics() {
  const navigate = useNavigate();
  const { items, records } = useFreezerStore();

  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, it) => sum + (it.price || 0), 0);
    const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalItems = items.length;

    const expiredRecords = records.filter((r) => r.reason === 'expired');
    const expiredLoss = expiredRecords.reduce((sum, r) => sum + (r.amount || 0), 0);

    const usedRecords = records.filter((r) => r.reason === 'used');
    const usedCount = usedRecords.length;
    const usedValue = usedRecords.reduce((sum, r) => sum + (r.amount || 0), 0);

    const expiringCount = items.filter((it) => {
      const s = getExpiryStatus(it.expiryDate);
      return s === 'urgent' || s === 'warning' || s === 'expired';
    }).length;

    const expiredInStock = items.filter((it) => getExpiryStatus(it.expiryDate) === 'expired').length;

    const storageDays =
      totalItems > 0
        ? Math.round(
            items.reduce((s, it) => s + differenceInDays(new Date(), parseISO(it.purchaseDate)), 0) /
              totalItems
          )
        : 0;

    return {
      totalValue,
      totalQuantity,
      totalItems,
      expiredCount: expiredRecords.length,
      expiredLoss,
      usedCount,
      usedValue,
      expiringCount,
      expiredInStock,
      storageDays,
    };
  }, [items, records]);

  const categoryData = useMemo(() => {
    const map: Record<Category, { name: string; value: number; count: number }> = {
      meat: { name: '肉类', value: 0, count: 0 },
      staple: { name: '主食', value: 0, count: 0 },
      vegetable: { name: '蔬菜', value: 0, count: 0 },
      seafood: { name: '海鲜', value: 0, count: 0 },
      dessert: { name: '甜品', value: 0, count: 0 },
      other: { name: '其他', value: 0, count: 0 },
    };
    items.forEach((it) => {
      map[it.category].value += it.price || 0;
      map[it.category].count += 1;
    });
    return Object.entries(map)
      .filter(([, v]) => v.count > 0)
      .map(([k, v]) => ({
        key: k,
        name: v.name,
        value: Math.round(v.value),
        count: v.count,
      }));
  }, [items]);

  const topItems = useMemo(() => {
    const nameMap = new Map<
      string,
      { name: string; totalQty: number; count: number; category: Category; totalValue: number }
    >();
    items.forEach((it) => {
      const existing = nameMap.get(it.name);
      if (existing) {
        existing.totalQty += it.quantity;
        existing.count += 1;
        existing.totalValue += it.price || 0;
      } else {
        nameMap.set(it.name, {
          name: it.name,
          totalQty: it.quantity,
          count: 1,
          category: it.category,
          totalValue: it.price || 0,
        });
      }
    });
    records.forEach((r) => {
      if (r.reason === 'used') {
        const existing = nameMap.get(r.itemName);
        if (existing) {
          existing.totalQty += r.quantity;
          existing.count += 0;
        }
      }
    });
    return Array.from(nameMap.values())
      .sort((a, b) => b.count - a.count || b.totalQty - a.totalQty)
      .slice(0, 10);
  }, [items, records]);

  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });
    return months.map((m) => {
      const start = startOfMonth(m);
      const monthKey = format(start, 'yyyy-MM');
      const added = items
        .filter((it) => it.purchaseDate.startsWith(monthKey))
        .reduce((s, it) => s + (it.price || 0), 0);
      const usedValue = records
        .filter(
          (r) => r.reason === 'used' && format(new Date(r.consumedAt), 'yyyy-MM') === monthKey
        )
        .reduce((s, r) => s + (r.amount || 0), 0);
      const expiredLoss = records
        .filter(
          (r) =>
            r.reason === 'expired' && format(new Date(r.consumedAt), 'yyyy-MM') === monthKey
        )
        .reduce((s, r) => s + (r.amount || 0), 0);
      return {
        name: format(m, 'M月'),
        新增价值: Math.round(added),
        食用金额: Math.round(usedValue),
        丢弃损失: Math.round(expiredLoss),
      };
    });
  }, [items, records]);

  const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#0891b2', '#db2777', '#6b7280'];

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color,
    bgColor,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    subValue?: string;
    color: string;
    bgColor: string;
  }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
          <div className={`text-3xl font-bold mt-2 ${color}`}>{value}</div>
          {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          📊 冷冻库统计中心
        </h1>
        <p className="text-gray-500 mt-1 text-sm">家里囤了多少钱、浪费了多少、最爱囤什么一目了然</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="库存总价值"
          value={`¥${stats.totalValue.toFixed(0)}`}
          subValue={`${stats.totalItems} 种食材 / ${stats.totalQuantity} 件`}
          color="text-freezer-accent"
          bgColor="border-sky-100 bg-sky-50/30"
        />
        <StatCard
          icon={Trash2}
          label="过期丢弃损失"
          value={`¥${stats.expiredLoss}`}
          subValue={`历史丢弃 ${stats.expiredCount} 次`}
          color="text-red-600"
          bgColor="border-red-100 bg-red-50/30"
        />
        <StatCard
          icon={AlertTriangle}
          label="快过期食材"
          value={stats.expiringCount.toString()}
          subValue={`已过期 ${stats.expiredInStock} 件`}
          color="text-expiring-warning"
          bgColor="border-orange-100 bg-orange-50/30"
        />
        <StatCard
          icon={Clock}
          label="平均冷冻天数"
          value={`${stats.storageDays} 天`}
          subValue={`食用记录 ${stats.usedCount} 次`}
          color="text-green-700"
          bgColor="border-green-100 bg-green-50/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">各分类库存价值</div>
                <div className="text-xs text-gray-500">按分类统计金额占比</div>
              </div>
            </div>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`¥${value}`, '金额']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map((c, idx) => (
              <div key={c.key} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: COLORS[idx % COLORS.length] }}
                />
                <span className="text-gray-600 font-medium">{c.name}</span>
                <span className="text-gray-400">¥{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">近6个月趋势</div>
                <div className="text-xs text-gray-500">新增价值 / 食用金额 / 丢弃损失</div>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  formatter={(value: number) => [`¥${value}`, '']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="新增价值" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="食用金额" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="丢弃损失" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-gray-800">🏆 最常囤的食材 TOP 10</div>
              <div className="text-xs text-gray-500">购买次数和累计总量排行</div>
            </div>
          </div>
        </div>

        {topItems.length > 0 ? (
          <div className="space-y-3">
            {topItems.map((it, idx) => {
              const maxQty = topItems[0].totalQty;
              const percent = (it.totalQty / maxQty) * 100;
              return (
                <div
                  key={it.name}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      idx === 0
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md'
                        : idx === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                        : idx === 2
                        ? 'bg-gradient-to-br from-orange-300 to-amber-400 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-gray-800 truncate">{it.name}</span>
                      <span className={`text-[10px] font-medium ${CATEGORY_TEXT_COLORS[it.category]}`}>
                        {CATEGORY_LABELS[it.category]}
                      </span>
                    </div>
                    <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[it.category]}`}
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-gray-800">
                      {it.totalQty}
                      <span className="text-xs text-gray-500 font-normal ml-0.5">件</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      买 {it.count} 次 · ¥{it.totalValue.toFixed(0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📝</div>
            <div>还没有足够的数据，多添加一些食材吧</div>
          </div>
        )}
      </div>

      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-bold text-gray-800">📦 分类库存明细</div>
              <div className="text-xs text-gray-500">每种分类里放了哪些东西</div>
            </div>
          </div>
          <div className="space-y-4">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
              const catItems = items.filter((it) => it.category === cat);
              if (catItems.length === 0) return null;
              const catValue = catItems.reduce((s, it) => s + (it.price || 0), 0);
              return (
                <div key={cat} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div
                    className={`px-5 py-3 flex items-center justify-between ${CATEGORY_COLORS[cat]} bg-opacity-10 border-b border-current/10`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat]}`} />
                      <span className="font-bold text-gray-800">{CATEGORY_LABELS[cat]}</span>
                      <span className="text-xs text-gray-500">{catItems.length} 种</span>
                    </div>
                    <div className="font-bold text-gray-700">¥{catValue.toFixed(0)}</div>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {catItems.map((it) => (
                      <div
                        key={it.id}
                        onClick={() => navigate(`/item/${it.id}`)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {it.name}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {it.quantity}
                            {it.unit}
                          </span>
                          <span className="text-xs text-gray-400">
                            第{it.position.drawer + 1}-{it.position.cell + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-800">📋 最近操作记录</div>
              <div className="text-xs text-gray-500">取用、丢弃、移动位置的历史</div>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-2">
            {[...records]
              .sort(
                (a, b) =>
                  new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime()
              )
              .slice(0, 30)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        r.reason === 'used'
                          ? 'bg-green-100'
                          : r.reason === 'expired'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {r.reason === 'used' ? '🍽️' : r.reason === 'expired' ? '🗑️' : '↔️'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {r.reason === 'used'
                          ? `食用 ${r.itemName} × ${r.quantity}${r.unit}`
                          : r.reason === 'expired'
                          ? `丢弃过期：${r.itemName}`
                          : r.note || `移动：${r.itemName}`}
                      </div>
                      {r.reason === 'used' && r.note && (
                        <div className="text-[11px] text-gray-400 mt-0.5">{r.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(r.consumedAt), 'M月d日 HH:mm')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
