import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Users, DollarSign, AlertTriangle, ShoppingCart, Coffee, Package } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { useSupplyStore } from '../store/useSupplyStore';
import { calculateStatistics, calculateSuggestedOrder, calculateFlavorTotalStock, calculateWeeklyConsumption } from '../utils/statistics';
import { formatDate, getDaysDiff, getWeekKey } from '../utils/date';
import { StatusBadge } from '../components/ui/StatusBadge';

const COLORS = ['#3E2723', '#6D4C41', '#8D6E63', '#D7CCC8', '#FF8A65', '#FF7043', '#4DB6AC', '#81C784'];

export function Statistics() {
  const coffeeFlavors = useCoffeeStore((state) => state.flavors);
  const inventoryBatches = useCoffeeStore((state) => state.batches);
  const consumptionLogs = useCoffeeStore((state) => state.logs);
  const supplies = useSupplyStore((state) => state.supplies);
  const supplyLogs = useSupplyStore((state) => state.logs);
  const suppliesWithStatus = useSupplyStore((state) => state.getAllSuppliesWithStatus());

  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '365'>('30');

  const stats = useMemo(() => {
    return calculateStatistics(
      coffeeFlavors,
      inventoryBatches,
      consumptionLogs,
      supplies,
      supplyLogs,
      parseInt(timeRange)
    );
  }, [coffeeFlavors, inventoryBatches, consumptionLogs, supplies, supplyLogs, timeRange]);

  const popularFlavorsData = useMemo(() => {
    return stats.popularFlavors.slice(0, 8).map((item) => ({
      name: item.name.length > 6 ? item.name.slice(0, 6) + '...' : item.name,
      fullName: item.name,
      count: item.total,
      cost: item.total * (coffeeFlavors.find(f => f.id === item.flavorId)?.unitPrice || 0),
    }));
  }, [stats.popularFlavors, coffeeFlavors]);

  const departmentConsumptionData = useMemo(() => {
    return stats.departmentConsumption.map((item) => ({
      name: item.department.length > 4 ? item.department.slice(0, 4) + '...' : item.department,
      fullName: item.department,
      count: item.total,
      cost: item.cost,
    }));
  }, [stats.departmentConsumption]);

  const weeklyTrendData = useMemo(() => {
    const days = parseInt(timeRange);
    const weeks: Record<string, { week: string; count: number; cost: number }> = {};
    const now = new Date();

    for (let i = 0; i < Math.ceil(days / 7); i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekKey = getWeekKey(weekStart);
      weeks[weekKey] = {
        week: `第${i + 1}周`,
        count: 0,
        cost: 0,
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    consumptionLogs
      .filter((log) => new Date(log.consumedAt) >= startDate)
      .forEach((log) => {
        const weekKey = getWeekKey(new Date(log.consumedAt));
        const flavor = coffeeFlavors.find((f) => f.id === log.flavorId);
        if (weeks[weekKey] && flavor) {
          weeks[weekKey].count += log.quantity;
          weeks[weekKey].cost += log.quantity * flavor.unitPrice;
        }
      });

    return Object.values(weeks).reverse();
  }, [consumptionLogs, coffeeFlavors, timeRange]);

  const expiringSoonData = useMemo(() => {
    return stats.expiringItems
      .filter(item => item.itemType === 'coffee')
      .map(item => {
        const flavor = coffeeFlavors.find(f => f.id === item.id);
        return {
          ...item,
          flavor,
        };
      })
      .filter(item => item.flavor)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [stats.expiringItems, coffeeFlavors]);

  const suggestedOrdersData = useMemo(() => {
    return coffeeFlavors
      .map((flavor) => {
        const currentStock = calculateFlavorTotalStock(flavor.id, inventoryBatches);
        const avgWeeklyConsumption = calculateWeeklyConsumption(flavor.id, consumptionLogs);
        const suggestedOrder = calculateSuggestedOrder(currentStock, flavor.safetyStock, avgWeeklyConsumption);
        if (suggestedOrder > 0) {
          return {
            flavor,
            currentStock,
            avgWeeklyConsumption,
            suggestedOrder,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.suggestedOrder - a!.suggestedOrder);
  }, [coffeeFlavors, inventoryBatches, consumptionLogs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-coffee-100">
          <p className="font-medium text-coffee-900 mb-2">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name.includes('cost') || entry.name.includes('金额') ? '元' : '颗'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statCards = [
    {
      title: '总消耗数量',
      value: stats.totalConsumption.toLocaleString(),
      unit: '颗',
      icon: Coffee,
      color: 'text-coffee-700',
      bgColor: 'bg-coffee-50',
    },
    {
      title: '总消耗金额',
      value: `¥${stats.totalCost.toLocaleString()}`,
      unit: '',
      icon: DollarSign,
      color: 'text-accent-orange',
      bgColor: 'bg-orange-50',
    },
    {
      title: '活跃口味',
      value: stats.activeFlavorCount,
      unit: '种',
      icon: TrendingUp,
      color: 'text-accent-green',
      bgColor: 'bg-green-50',
    },
    {
      title: '活跃部门',
      value: stats.activeDepartmentCount,
      unit: '个',
      icon: Users,
      color: 'text-coffee-600',
      bgColor: 'bg-cream-100',
    },
  ];

  const timeRangeOptions = [
    { key: '7', label: '近7天' },
    { key: '30', label: '近30天' },
    { key: '90', label: '近90天' },
    { key: '365', label: '近一年' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">统计分析</h1>
          <p className="text-coffee-500">数据驱动采购决策，优化库存管理</p>
        </div>
        <div className="flex gap-2 bg-cream-50 p-1 rounded-xl">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTimeRange(opt.key as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === opt.key
                  ? 'bg-white shadow-sm text-coffee-800'
                  : 'text-coffee-500 hover:text-coffee-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="card p-6 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-sm text-coffee-500 mb-1">{card.title}</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-coffee-900">{card.value}</span>
              {card.unit && <span className="text-sm text-coffee-500">{card.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-coffee-600" />
            最受欢迎口味
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularFlavorsData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
                <XAxis type="number" stroke="#8D6E63" />
                <YAxis dataKey="name" type="category" stroke="#8D6E63" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="消耗数量" fill="#6D4C41" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-coffee-600" />
            部门消耗排行
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentConsumptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="fullName"
                >
                  {departmentConsumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value: string) => <span className="text-coffee-700 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-coffee-600" />
          每周消耗趋势
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D4C41" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6D4C41" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8A65" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF8A65" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE9" />
              <XAxis dataKey="week" stroke="#8D6E63" />
              <YAxis yAxisId="left" stroke="#6D4C41" />
              <YAxis yAxisId="right" orientation="right" stroke="#FF8A65" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="消耗数量"
                stroke="#6D4C41"
                fillOpacity={1}
                fill="url(#colorCount)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                name="消耗金额"
                stroke="#FF8A65"
                fillOpacity={1}
                fill="url(#colorCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-orange" />
            即将过期
            {expiringSoonData.length > 0 && (
              <span className="badge badge-warning ml-2">{expiringSoonData.length}种</span>
            )}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expiringSoonData.length > 0 ? (
              expiringSoonData.map((item, index) => {
                if (!item.flavor) return null;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    <img
                      src={item.flavor.boxPhoto}
                      alt={item.flavor.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-coffee-900 truncate">{item.flavor.name}</p>
                      <p className="text-sm text-coffee-500">{item.flavor.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-coffee-900">{item.quantity}颗</p>
                      <p className="text-sm text-accent-orange">
                        还剩 {item.daysLeft} 天
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-coffee-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无即将过期的商品</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent-green" />
            建议下单
            {suggestedOrdersData.length > 0 && (
              <span className="badge badge-success ml-2">{suggestedOrdersData.length}种</span>
            )}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestedOrdersData.length > 0 ? (
              suggestedOrdersData.map((item, index) => {
                if (!item) return null;
                return (
                  <div
                    key={item.flavor.id}
                    className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    <img
                      src={item.flavor.boxPhoto}
                      alt={item.flavor.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-coffee-900 truncate">{item.flavor.name}</p>
                      <p className="text-sm text-coffee-500">
                        当前库存: {item.currentStock}颗 | 安全线: {item.flavor.safetyStock}颗
                      </p>
                      <p className="text-xs text-coffee-400">
                        周均消耗: {item.avgWeeklyConsumption}颗
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent-green text-xl">
                        {item.suggestedOrder}
                        <span className="text-sm font-normal text-coffee-500 ml-1">颗</span>
                      </p>
                      <p className="text-sm text-coffee-600">
                        ≈ ¥{(item.suggestedOrder * item.flavor.unitPrice).toFixed(0)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-coffee-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>库存充足，无需补货</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-bold text-coffee-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-coffee-600" />
          配套物品库存状态
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {suppliesWithStatus.map((supply) => (
            <div
              key={supply.id}
              className="p-4 bg-cream-50 rounded-xl text-center hover:bg-cream-100 transition-colors"
            >
              <StatusBadge status={supply.stockStatus} className="mb-2" />
              <p className="font-medium text-coffee-900 text-sm mb-1">{supply.name}</p>
              <p className="font-display text-2xl font-bold text-coffee-900">{supply.quantity}</p>
              <p className="text-xs text-coffee-500">安全线: {supply.safetyStock}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
