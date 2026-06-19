import { useMemo } from 'react';
import { TrendingDown, AlertTriangle, Clock, Lightbulb, Droplets, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useTeaStore } from '@/store/useTeaStore';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function StatisticsPage() {
  const { teapots, batches, inspections } = useTeaStore();

  const stats = useMemo(() => {
    const discardedBatches = batches.filter((b) => b.status === 'discarded');
    const soldOutBatches = batches.filter((b) => b.status === 'sold_out');
    const totalOutput = batches.reduce((sum, b) => sum + b.outputAmount, 0);

    let totalDiscardedAmount = 0;
    discardedBatches.forEach((b) => {
      const batchInspections = inspections.filter((i) => i.batchId === b.id);
      if (batchInspections.length > 0) {
        const lastInspection = batchInspections[batchInspections.length - 1];
        totalDiscardedAmount += lastInspection.remainingAmount;
      } else {
        totalDiscardedAmount += b.outputAmount;
      }
    });

    const abnormalInspections = inspections.filter((i) => i.isAbnormal);

    const abnormalByTeapot = teapots.map((teapot) => {
      const teapotBatches = batches.filter((b) => b.teapotId === teapot.id);
      let abnormalCount = 0;
      teapotBatches.forEach((b) => {
        const batchInspections = inspections.filter((i) => i.batchId === b.id);
        abnormalCount += batchInspections.filter((i) => i.isAbnormal).length;
      });
      return {
        name: teapot.teaType,
        异常次数: abnormalCount,
      };
    });

    const uniqueSlots = [...new Set(batches.map((b) => b.targetTimeSlot))].sort();
    const consumptionBySlot = uniqueSlots.map((slot) => {
      const slotBatches = batches.filter((b) => b.targetTimeSlot === slot);
      const consumption = slotBatches.reduce((sum, b) => {
        const batchInspections = inspections.filter((i) => i.batchId === b.id);
        if (batchInspections.length > 0) {
          const firstRemaining = batchInspections[batchInspections.length - 1]?.remainingAmount || b.outputAmount;
          const lastRemaining = batchInspections[0]?.remainingAmount || firstRemaining;
          return sum + (firstRemaining - lastRemaining);
        }
        if (b.status === 'sold_out') return sum + b.outputAmount;
        if (b.status === 'discarded') return sum + Math.floor(b.outputAmount * 0.7);
        return sum + Math.floor(b.outputAmount * 0.3);
      }, 0);
      return {
        时段: slot,
        消耗量: consumption,
      };
    });

    const teaTypeStats = teapots.map((teapot) => {
      const teapotBatches = batches.filter((b) => b.teapotId === teapot.id);
      const totalTeaTypeOutput = teapotBatches.reduce((sum, b) => sum + b.outputAmount, 0);
      let discardedTeaType = 0;
      teapotBatches.filter((b) => b.status === 'discarded').forEach((b) => {
        const batchInspections = inspections.filter((i) => i.batchId === b.id);
        if (batchInspections.length > 0) {
          discardedTeaType += batchInspections[batchInspections.length - 1].remainingAmount;
        } else {
          discardedTeaType += b.outputAmount;
        }
      });
      return {
        name: teapot.teaType,
        value: discardedTeaType,
        total: totalTeaTypeOutput,
      };
    });

    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    const dailyConsumption = last7Days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayBatches = batches.filter((b) => {
        const brewDay = format(new Date(b.brewTime), 'yyyy-MM-dd');
        return brewDay === dayStr;
      });
      const consumption = dayBatches.reduce((sum, b) => {
        if (b.status === 'sold_out') return sum + b.outputAmount;
        if (b.status === 'discarded') {
          const batchInspections = inspections.filter((i) => i.batchId === b.id);
          if (batchInspections.length > 0) {
            return sum + (b.outputAmount - batchInspections[batchInspections.length - 1].remainingAmount);
          }
        }
        const batchInspections = inspections.filter((i) => i.batchId === b.id);
        if (batchInspections.length > 0) {
          return sum + (b.outputAmount - batchInspections[0].remainingAmount);
        }
        return sum;
      }, 0);
      return {
        日期: format(day, 'M/d', { locale: zhCN }),
        消耗量: consumption,
      };
    });

    const suggestions = uniqueSlots.map((slot) => {
      const slotBatches = batches.filter((b) => b.targetTimeSlot === slot);
      let soldAmount = 0;
      slotBatches.forEach((b) => {
        if (b.status === 'sold_out') {
          soldAmount += b.outputAmount;
        } else if (b.status === 'discarded') {
          const batchInspections = inspections.filter((i) => i.batchId === b.id);
          if (batchInspections.length > 0) {
            soldAmount += b.outputAmount - batchInspections[batchInspections.length - 1].remainingAmount;
          } else {
            soldAmount += Math.floor(b.outputAmount * 0.7);
          }
        } else {
          const batchInspections = inspections.filter((i) => i.batchId === b.id);
          if (batchInspections.length > 0) {
            soldAmount += b.outputAmount - batchInspections[0].remainingAmount;
          } else {
            soldAmount += Math.floor(b.outputAmount * 0.3);
          }
        }
      });
      const avgConsumption = slotBatches.length > 0 ? soldAmount / slotBatches.length : 0;
      const suggestedAmount = Math.ceil(avgConsumption * 1.1 / 100) * 100;
      return {
        slot,
        suggested: suggestedAmount,
        avg: Math.round(avgConsumption),
      };
    });

    return {
      totalBatches: batches.length,
      discardedCount: discardedBatches.length,
      soldOutCount: soldOutBatches.length,
      totalDiscardedAmount,
      totalOutput,
      discardRate: totalOutput > 0 ? ((totalDiscardedAmount / totalOutput) * 100).toFixed(1) : '0',
      abnormalCount: abnormalInspections.length,
      abnormalByTeapot,
      consumptionBySlot,
      teaTypeStats,
      dailyConsumption,
      suggestions,
    };
  }, [teapots, batches, inspections]);

  const COLORS = ['#8B5A2B', '#7CB342', '#FFB300', '#E53935'];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-tea-800">统计分析</h2>
        <p className="text-sm text-tea-600 mt-1">数据统计与智能建议</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-tea p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-tea-100 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-tea-600" />
            </div>
            <div>
              <p className="text-sm text-tea-500">总批次</p>
              <p className="text-2xl font-bold text-tea-800">{stats.totalBatches}</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="text-matcha-600">售罄 {stats.soldOutCount}</span>
            <span className="text-danger-600">报废 {stats.discardedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-tea-500">总报废量</p>
              <p className="text-2xl font-bold text-danger-600">
                {stats.totalDiscardedAmount}
                <span className="text-sm font-normal text-tea-500 ml-1">ml</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-tea-500">
            报废率 <span className="font-medium text-danger-600">{stats.discardRate}%</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-tea-500">温度异常</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.abnormalCount}
                <span className="text-sm font-normal text-tea-500 ml-1">次</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-tea-500">累计异常巡查记录</p>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-matcha-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-matcha-600" />
            </div>
            <div>
              <p className="text-sm text-tea-500">茶底种类</p>
              <p className="text-2xl font-bold text-matcha-600">
                {teapots.length}
                <span className="text-sm font-normal text-tea-500 ml-1">种</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-tea-500">在产茶底类型</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-tea-500" />
            各茶底温度异常次数
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.abnormalByTeapot} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f5e6d3" />
                <XAxis type="number" stroke="#8B5A2B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#8B5A2B" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #8B5A2B',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="异常次数" fill="#E53935" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-tea-500" />
            各茶底报废量分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.teaTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.teaTypeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}ml`, '报废量']}
                  contentStyle={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #8B5A2B',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tea p-6 mb-6">
        <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-tea-500" />
          近7天消耗量趋势
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyConsumption}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5e6d3" />
              <XAxis dataKey="日期" stroke="#8B5A2B" fontSize={12} />
              <YAxis stroke="#8B5A2B" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [`${value}ml`, '消耗量']}
                contentStyle={{
                  backgroundColor: '#FFF8E1',
                  border: '1px solid #8B5A2B',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="消耗量"
                stroke="#8B5A2B"
                strokeWidth={3}
                dot={{ fill: '#8B5A2B', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#7CB342' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-tea-500" />
            各时段消耗量
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.consumptionBySlot}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5e6d3" />
                <XAxis dataKey="时段" stroke="#8B5A2B" fontSize={12} />
                <YAxis stroke="#8B5A2B" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`${value}ml`, '消耗量']}
                  contentStyle={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #8B5A2B',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="消耗量" fill="#7CB342" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tea p-6">
          <h3 className="font-display font-bold text-lg text-tea-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-matcha-500" />
            智能煮制建议
          </h3>
          <div className="space-y-3">
            {stats.suggestions.map((item, index) => (
              <div
                key={item.slot}
                className="flex items-center justify-between p-4 bg-matcha-50 rounded-xl border border-matcha-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-matcha-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-tea-800">{item.slot}</p>
                    <p className="text-xs text-tea-500">历史平均 {item.avg}ml</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-matcha-600">
                    {item.suggested}
                    <span className="text-sm font-normal text-tea-500 ml-1">ml</span>
                  </p>
                  <p className="text-xs text-matcha-600">建议煮制量</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-tea-500 mt-4 text-center">
            💡 建议量基于历史数据 + 10% 安全余量计算
          </p>
        </div>
      </div>
    </div>
  );
}
