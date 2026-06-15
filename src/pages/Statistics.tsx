import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Leaf, Clock, AlertTriangle, TrendingUp, TrendingDown,
  PieChart as PieIcon, BarChart3, Lightbulb, Clock3,
} from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatCard from '@/components/StatCard';
import { TeaStatItem, LossReasonItem, BrewSuggestion } from '@/types';

const COLORS = ['#4A7C59', '#D4A574', '#E8B86D', '#C17F59', '#E07A5F', '#8B7355'];

export default function Statistics() {
  const { teas, batches, initData, getTeaById } = useBatchStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');
  
  useEffect(() => {
    if (!useBatchStore.getState().initialized) {
      initData();
    }
  }, [initData]);
  
  const filteredBatches = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };
    const rangeMs = ranges[timeRange];
    
    return batches.filter((b) => {
      const startTime = new Date(b.startTime).getTime();
      return now - startTime <= rangeMs;
    });
  }, [batches, timeRange]);
  
  const teaStats: TeaStatItem[] = useMemo(() => {
    const stats: Record<string, { rates: number[]; count: number }> = {};
    
    filteredBatches.forEach((batch) => {
      if (batch.outputAmountMl === undefined) return;
      const rate = (batch.outputAmountMl / batch.waterAmountMl) * 100;
      
      if (!stats[batch.teaId]) {
        stats[batch.teaId] = { rates: [], count: 0 };
      }
      stats[batch.teaId].rates.push(rate);
      stats[batch.teaId].count++;
    });
    
    return Object.entries(stats).map(([teaId, data]) => {
      const tea = getTeaById(teaId);
      const avg = data.rates.reduce((a, b) => a + b, 0) / data.rates.length;
      const variance = data.rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / data.rates.length;
      const stdDev = Math.sqrt(variance);
      
      return {
        teaId,
        teaName: tea?.name || '未知',
        color: tea?.color || '#999',
        avgOutputRate: Math.round(avg * 10) / 10,
        batchCount: data.count,
        stdDev: Math.round(stdDev * 10) / 10,
      };
    }).sort((a, b) => b.avgOutputRate - a.avgOutputRate);
  }, [filteredBatches, getTeaById]);
  
  const lossReasons: LossReasonItem[] = useMemo(() => {
    const reasons: Record<string, { count: number; amount: number }> = {};
    
    filteredBatches.forEach((batch) => {
      if (!batch.lossReason || batch.lossAmountMl === undefined) return;
      
      if (!reasons[batch.lossReason]) {
        reasons[batch.lossReason] = { count: 0, amount: 0 };
      }
      reasons[batch.lossReason].count++;
      reasons[batch.lossReason].amount += batch.lossAmountMl;
    });
    
    return Object.entries(reasons)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        amount: Math.round(data.amount),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredBatches]);
  
  const brewSuggestions: BrewSuggestion[] = useMemo(() => {
    const timeSlots = [
      '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'
    ];
    
    const suggestions: BrewSuggestion[] = timeSlots.map((time) => {
      const teasSuggestion = teas
        .map((tea) => {
          const relevantBatches = filteredBatches.filter((b) => b.teaId === tea.id);
          const avgOutput = relevantBatches.length > 0
            ? relevantBatches.reduce((sum, b) => sum + (b.outputAmountMl || 0), 0) / relevantBatches.length
            : 4500;
          
          const demandFactor = time >= '10:00' && time <= '18:00' ? 1.2 : 0.8;
          const count = Math.max(1, Math.round((avgOutput / 5000) * demandFactor * 2));
          
          return {
            teaId: tea.id,
            teaName: tea.name,
            count,
            color: tea.color,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      return { time, teas: teasSuggestion };
    });
    
    return suggestions;
  }, [teas, filteredBatches]);
  
  const completedBatches = filteredBatches.filter((b) => b.status !== 'brewing' && b.status !== 'ready' && b.status !== 'overdue');
  const avgOutputRate = teaStats.length > 0
    ? Math.round(teaStats.reduce((sum, t) => sum + t.avgOutputRate, 0) / teaStats.length * 10) / 10
    : 0;
  
  const overdueCount = filteredBatches.filter((b) => b.status === 'overdue' || b.actualFilterTime && new Date(b.actualFilterTime) > new Date(b.targetFilterTime)).length;
  const totalLoss = lossReasons.reduce((sum, r) => sum + r.amount, 0);
  const totalWater = filteredBatches.reduce((sum, b) => sum + b.waterAmountMl, 0);
  const lossRate = totalWater > 0 ? Math.round((totalLoss / totalWater) * 100 * 10) / 10 : 0;
  
  const barChartData = teaStats.map((t) => ({
    name: t.teaName,
    出品率: t.avgOutputRate,
    稳定度: 100 - t.stdDev * 2,
    color: t.color,
  }));
  
  const pieChartData = lossReasons.map((r, i) => ({
    name: r.reason,
    value: r.amount,
    count: r.count,
    fill: COLORS[i % COLORS.length],
  }));
  
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-30">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 font-serif">统计分析</h1>
                <p className="text-xs text-gray-500">Statistics & Insights</p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-cream-200 rounded-xl p-1">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-matcha-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {range === '7d' ? '7天' : range === '30d' ? '30天' : '全部'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="总批次"
            value={completedBatches.length}
            icon={<Leaf className="w-5 h-5" />}
            subtitle="已完成"
            color="matcha"
          />
          <StatCard
            title="平均出品率"
            value={`${avgOutputRate}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle={avgOutputRate >= 90 ? '优秀' : avgOutputRate >= 80 ? '良好' : '待提升'}
            trend={avgOutputRate >= 85 ? 'up' : 'down'}
            color="forest"
          />
          <StatCard
            title="超时批次"
            value={overdueCount}
            icon={<Clock className="w-5 h-5" />}
            subtitle="需关注"
            trend={overdueCount > 0 ? 'down' : 'neutral'}
            color="coral"
          />
          <StatCard
            title="损耗率"
            value={`${lossRate}%`}
            icon={<TrendingDown className="w-5 h-5" />}
            subtitle={lossRate <= 8 ? '控制良好' : '偏高'}
            color="amber"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-matcha-500" />
                <h2 className="text-lg font-bold text-gray-800 font-serif">各茶品出品率对比</h2>
              </div>
              <span className="text-sm text-gray-400">单位: %</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis domain={[70, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="出品率" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="w-5 h-5 text-coral-500" />
              <h2 className="text-lg font-bold text-gray-800 font-serif">报损原因分布</h2>
            </div>
            <div className="h-64">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}ml`, '损耗量']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>暂无损耗数据</p>
                </div>
              )}
            </div>
            <div className="space-y-2 mt-2">
              {lossReasons.slice(0, 4).map((reason, i) => (
                <div key={reason.reason} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{reason.reason}</span>
                  </div>
                  <span className="text-gray-500 font-medium">{reason.amount}ml</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800 font-serif">明日开泡建议</h2>
            <span className="text-xs text-gray-400 ml-2">基于历史销量数据分析</span>
          </div>
          
          <div className="relative">
            <div className="absolute top-10 left-0 right-0 h-0.5 bg-cream-200" />
            
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {brewSuggestions.map((slot, slotIndex) => (
                <div key={slot.time} className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-matcha-100 border-4 border-cream-100 flex items-center justify-center z-10">
                      <Clock3 className="w-4 h-4 text-matcha-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-2">{slot.time}</p>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {slot.teas.map((tea, teaIndex) => (
                      <div
                        key={tea.teaId}
                        className="p-2 rounded-xl text-xs"
                        style={{ backgroundColor: `${tea.color}15` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{ color: tea.color }}>
                            {tea.teaName}
                          </span>
                          <span className="text-gray-500">×{tea.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-coral-500" />
            <h2 className="text-lg font-bold text-gray-800 font-serif">各茶品详情</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">茶叶品种</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">批次数量</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">平均出品率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">稳定度</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">建议浸泡</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">安全售卖</th>
                </tr>
              </thead>
              <tbody>
                {teas.map((tea) => {
                  const stat = teaStats.find((s) => s.teaId === tea.id);
                  return (
                    <tr key={tea.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: tea.color }}
                          >
                            <Leaf className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-gray-800">{tea.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-gray-600">
                        {stat?.batchCount || 0} 批
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-medium ${
                          (stat?.avgOutputRate || 0) >= 90 ? 'text-matcha-600' :
                          (stat?.avgOutputRate || 0) >= 80 ? 'text-amber-600' : 'text-coral-600'
                        }`}>
                          {stat?.avgOutputRate || '-'}%
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className={`font-medium ${
                          (stat?.stdDev || 10) <= 3 ? 'text-matcha-600' :
                          (stat?.stdDev || 10) <= 5 ? 'text-amber-600' : 'text-coral-600'
                        }`}>
                          {stat ? (stat.stdDev <= 3 ? '高' : stat.stdDev <= 5 ? '中' : '低') : '-'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4 text-gray-600">
                        {tea.brewDurationMinutes} 分钟
                      </td>
                      <td className="text-center py-4 px-4 text-gray-600">
                        {tea.shelfLifeHours} 小时
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
