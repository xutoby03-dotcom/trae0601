import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/store';
import { SUPPLY_TYPE_LABELS, LOW_STOCK_THRESHOLDS } from '@/utils/constants';
import type { SupplyType } from '@/types';
import { getHoursBetween } from '@/utils/helpers';
import StatCard from '@/components/StatCard';

const COLORS = ['#0F766E', '#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];

export default function Statistics() {
  const { rooms, supplies, tasks, inspections } = useAppStore();

  const consumptionData = useMemo(() => {
    return rooms.map((room) => {
      const roomSupplies = supplies.filter((s) => s.roomId === room.id);
      const totalPens = roomSupplies
        .filter((s) => s.type.includes('Pen'))
        .reduce((sum, s) => sum + (5 - s.quantity), 0);
      const completedTasks = tasks.filter(
        (t) => t.roomId === room.id && t.status === 'completed'
      ).length;
      return {
        name: room.name.replace('会议室', ''),
        消耗量: Math.max(completedTasks * 3, totalPens),
        补给次数: completedTasks,
      };
    });
  }, [rooms, supplies, tasks]);

  const supplyTypeData = useMemo(() => {
    const types: SupplyType[] = ['blackPen', 'redPen', 'bluePen', 'eraser', 'cleaner', 'magnet'];
    return types.map((type) => {
      const typeSupplies = supplies.filter((s) => s.type === type);
      const totalQty = typeSupplies.reduce((sum, s) => sum + s.quantity, 0);
      const lowStockCount = typeSupplies.filter((s) => {
        const threshold = LOW_STOCK_THRESHOLDS[s.type];
        return s.type === 'cleaner'
          ? (s.remainingPercent ?? 0) <= threshold
          : s.quantity <= threshold;
      }).length;
      return {
        name: SUPPLY_TYPE_LABELS[type],
        value: totalQty,
        lowStock: lowStockCount,
        type,
      };
    });
  }, [supplies]);

  const efficiencyData = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);
    const totalHours = completedTasks.reduce(
      (sum, t) => sum + getHoursBetween(t.createdAt, t.completedAt!),
      0
    );
    const avgHours = completedTasks.length > 0 ? Math.round(totalHours / completedTasks.length) : 0;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayTasks = tasks.filter(
        (t) =>
          t.status === 'completed' &&
          t.completedAt &&
          new Date(t.completedAt) >= dayStart &&
          new Date(t.completedAt) <= dayEnd
      );
      const avgTime =
        dayTasks.length > 0
          ? Math.round(
              dayTasks.reduce((sum, t) => sum + getHoursBetween(t.createdAt, t.completedAt!), 0) /
                dayTasks.length
            )
          : 0;
      return {
        name: dayStr,
        平均处理时长: avgTime,
        完成任务数: dayTasks.length,
      };
    });

    return { avgHours, completedCount: completedTasks.length, last7Days };
  }, [tasks]);

  const purchaseSuggestions = useMemo(() => {
    const types: SupplyType[] = ['blackPen', 'redPen', 'bluePen', 'eraser', 'cleaner', 'magnet'];
    return types.map((type) => {
      const typeSupplies = supplies.filter((s) => s.type === type);
      const totalCurrent = typeSupplies.reduce((sum, s) => sum + s.quantity, 0);
      const lowStockRooms = typeSupplies.filter((s) => {
        const threshold = LOW_STOCK_THRESHOLDS[s.type];
        return s.type === 'cleaner'
          ? (s.remainingPercent ?? 0) <= threshold
          : s.quantity <= threshold;
      }).length;

      const perRoomStandard =
        type === 'magnet' ? 10 : type === 'eraser' ? 2 : type === 'cleaner' ? 1 : 5;
      const suggested = Math.max(
        lowStockRooms * perRoomStandard * 2,
        Math.ceil(rooms.length * perRoomStandard * 0.5)
      );

      return {
        type,
        name: SUPPLY_TYPE_LABELS[type],
        currentStock: totalCurrent,
        lowStockRooms,
        suggestedQty: suggested,
        unit:
          type === 'magnet' ? '个' : type === 'eraser' ? '块' : type === 'cleaner' ? '瓶' : '支',
      };
    });
  }, [rooms, supplies]);

  const longTermOutOfStock = useMemo(() => {
    return supplies.filter((s) => {
      const threshold = LOW_STOCK_THRESHOLDS[s.type];
      const isZero =
        s.type === 'cleaner' ? (s.remainingPercent ?? 100) <= 5 : s.quantity === 0;
      const relatedTasks = tasks.filter(
        (t) => t.roomId === s.roomId && t.supplyType === s.type && t.status !== 'completed'
      );
      return isZero && relatedTasks.length === 0;
    });
  }, [supplies, tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="总巡检次数"
          value={inspections.length}
          icon={TrendingUp}
          color="primary"
          trend="覆盖所有会议室"
          trendUp
        />
        <StatCard
          title="平均补给时效"
          value={`${efficiencyData.avgHours}h`}
          icon={Clock}
          color="green"
          trend={`已完成${efficiencyData.completedCount}单`}
          trendUp
        />
        <StatCard
          title="低库存品类"
          value={supplyTypeData.filter((d) => d.lowStock > 0).length}
          icon={AlertTriangle}
          color="accent"
          trend="需关注补货"
          trendUp={false}
        />
        <StatCard
          title="待采购项"
          value={purchaseSuggestions.filter((p) => p.suggestedQty > 0).length}
          icon={ShoppingCart}
          color="blue"
          trend="建议本周采购"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">各会议室用品消耗对比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="消耗量" fill="#0F766E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="补给次数" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">用品类型库存分布</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={supplyTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {supplyTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {supplyTypeData.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-800 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-5">补给时效趋势（近7天）</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={efficiencyData.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Line
                type="monotone"
                dataKey="平均处理时长"
                stroke="#0F766E"
                strokeWidth={2.5}
                dot={{ fill: '#0F766E', strokeWidth: 2, r: 4 }}
                name="平均时长(小时)"
              />
              <Line
                type="monotone"
                dataKey="完成任务数"
                stroke="#F97316"
                strokeWidth={2.5}
                dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                name="完成任务数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-700" />
            采购建议清单
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">用品</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-slate-500">现有</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-slate-500">告警</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-slate-500">建议采购</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSuggestions.map((item) => (
                  <tr key={item.type} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 px-2 font-medium text-slate-700">{item.name}</td>
                    <td className="py-3 px-2 text-right text-slate-600 font-mono">
                      {item.currentStock}
                      {item.unit}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {item.lowStockRooms > 0 ? (
                        <span className="badge bg-accent-100 text-accent-700">
                          {item.lowStockRooms}间
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-bold text-primary-700 font-mono text-lg">
                        {item.suggestedQty}
                      </span>
                      <span className="text-slate-500 text-sm ml-0.5">{item.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-500" />
            长期缺货告警
          </h3>
          {longTermOutOfStock.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-slate-600 font-medium">暂无长期缺货项</p>
              <p className="text-slate-400 text-sm mt-1">所有用品库存状态良好</p>
            </div>
          ) : (
            <div className="space-y-3">
              {longTermOutOfStock.map((item) => {
                const room = rooms.find((r) => r.id === item.roomId);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {room?.name} - {SUPPLY_TYPE_LABELS[item.type]}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {item.type === 'cleaner'
                          ? `余量仅${item.remainingPercent}%`
                          : `库存仅剩${item.quantity}个`}
                      </p>
                    </div>
                    <span className="badge bg-red-100 text-red-700">需紧急处理</span>
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
