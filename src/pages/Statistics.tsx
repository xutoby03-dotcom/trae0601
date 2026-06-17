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
import {
  Wind,
  DollarSign,
  AlertTriangle,
  Cylinder,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useStatsStore } from '@/store/useStatsStore';

export default function Statistics() {
  const {
    getWeeklyGasUsage,
    getTotalProfit,
    getAbnormalRank,
    getBalloonGasRank,
    getTotalGasUsed,
    getActiveCylinders,
    getAbnormalCylinders,
  } = useStatsStore();

  const weeklyGasData = useMemo(() => getWeeklyGasUsage(), [getWeeklyGasUsage]);
  const profitData = useMemo(() => getTotalProfit(), [getTotalProfit]);
  const abnormalRank = useMemo(() => getAbnormalRank(), [getAbnormalRank]);
  const balloonRank = useMemo(() => getBalloonGasRank(), [getBalloonGasRank]);
  const totalGas = useMemo(() => getTotalGasUsed(), [getTotalGasUsed]);
  const activeCylinders = useMemo(() => getActiveCylinders(), [getActiveCylinders]);
  const abnormalCylinders = useMemo(() => getAbnormalCylinders(), [getAbnormalCylinders]);

  const statCards = [
    {
      label: '累计用气量',
      value: `${totalGas.toFixed(0)}L`,
      icon: Wind,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: '本周毛利',
      value: `¥${profitData.weekly.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: profitData.weeklyChange,
    },
    {
      label: '正常气瓶',
      value: `${activeCylinders}个`,
      icon: Cylinder,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: '异常气瓶',
      value: `${abnormalCylinders}个`,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const balloonColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900">统计分析</h2>
        <p className="text-sm text-slate-500 mt-1">查看用气量趋势、订单毛利和异常数据分析</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    card.change >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {card.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-display font-bold text-slate-900 mb-1">{card.value}</p>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-lg">周用气量趋势</h3>
              <p className="text-sm text-slate-500 mt-1">近8周氦气使用量统计</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-3 h-3 rounded-full bg-primary-500"></span>
              <span>用气量(L)</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyGasData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#1E293B', fontWeight: 600 }}
                  formatter={(value: number) => [`${value} L`, '用气量']}
                />
                <Bar dataKey="gasUsed" radius={[6, 6, 0, 0]}>
                  {weeklyGasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === weeklyGasData.length - 1 ? '#FF6B35' : '#3A5C9C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              异常瓶号排行
            </h3>
            <div className="space-y-3">
              {abnormalRank.length > 0 ? (
                abnormalRank.map((item, index) => (
                  <div
                    key={item.cylinderNo}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-red-500 text-white' :
                      index === 1 ? 'bg-orange-500 text-white' :
                      index === 2 ? 'bg-amber-500 text-white' :
                      'bg-slate-400 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 font-medium text-slate-900 text-sm">{item.cylinderNo}</span>
                    <span className="text-sm text-slate-500">{item.count}次</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-8 text-sm">暂无异常记录</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              月度毛利
            </h3>
            <div className="text-center py-4">
              <p className="text-3xl font-display font-bold text-emerald-600">
                ¥{profitData.monthly.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 mt-2">本月累计毛利</p>
              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  style={{ width: '68%' }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">月度目标完成度 68%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-display font-semibold text-slate-900 text-lg mb-6">气球耗气量排行</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {balloonRank.map((item, index) => (
            <div
              key={item.name}
              className="relative p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-gradient-to-b from-slate-50 to-white"
            >
              <div className="absolute top-3 right-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-red-500' :
                  index === 1 ? 'bg-orange-500' :
                  index === 2 ? 'bg-amber-500' :
                  'bg-slate-400'
                }`}>
                  {index + 1}
                </span>
              </div>
              <div
                className="w-10 h-10 rounded-full mb-3"
                style={{ backgroundColor: balloonColors[index % balloonColors.length] }}
              ></div>
              <p className="font-medium text-slate-900 text-sm mb-1">{item.name}</p>
              <p className="text-xl font-display font-bold text-slate-900">
                {item.totalGas.toFixed(0)}L
              </p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: balloonColors[index % balloonColors.length],
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">占比 {item.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
