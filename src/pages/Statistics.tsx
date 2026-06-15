import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Trophy, User, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { usePickupStore } from '@/stores/pickupStore';
import { usePrepStore } from '@/stores/prepStore';
import { useStudentStore } from '@/stores/studentStore';
import { ALLERGY_META, MEAL_TYPE_META } from '@/types';
import type { AllergyType, WrongPickItem } from '@/types';
import { formatDate, addDays, todayStr, getWeekRange } from '@/utils/dateUtils';
import AllergyBadge from '@/components/allergy/AllergyBadge';

const ALLERGY_COLORS: Record<AllergyType, string> = {
  nuts: '#EF4444',
  dairy: '#F59E0B',
  seafood: '#3B82F6',
  eggs: '#8B5CF6',
  wheat: '#10B981',
  soy: '#EC4899',
  other: '#6B7280',
};

export default function Statistics() {
  const pickupRecords = usePickupStore((s) => s.pickupRecords);
  const prepItems = usePrepStore((s) => s.prepItems);
  const { getWeeklyStats } = usePickupStore();
  const { students } = useStudentStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [expandedWrongPick, setExpandedWrongPick] = useState<string | null>(null);

  const stats = getWeeklyStats();

  const baseDate = addDays(todayStr(), weekOffset * 7);
  const { start, end } = getWeekRange(new Date(baseDate));

  const totalStudents = students.length;
  const severeStudents = students.filter((s) => s.allergies.some((a) => a.severity === 'severe')).length;
  const avgReplacementsPerDay = stats.dailyData.length > 0
    ? Math.round(stats.dailyData.reduce((sum, d) => sum + d.replacements, 0) / stats.dailyData.length)
    : 0;

  const chartData = stats.dailyData.map((d) => ({
    date: formatDate(d.date, 'MM/DD'),
    替换次数: d.replacements,
    未领取: d.notPicked,
    错领: d.wrongPick,
  }));

  const rankingData = stats.allergyRanking.map((item) => ({
    name: item.name,
    count: item.count,
    type: item.type,
    fill: ALLERGY_COLORS[item.type],
  }));

  const summaryCards = [
    {
      label: '本周替换总次数',
      value: stats.totalReplacements,
      icon: TrendingUp,
      color: 'from-primary-400 to-primary-600',
      sub: `日均 ${avgReplacementsPerDay} 次`,
    },
    {
      label: '本周未领取次数',
      value: stats.notPickedCount,
      icon: AlertTriangle,
      color: 'from-warning-400 to-warning-600',
      sub: `错领 ${stats.wrongPickCount} 次`,
    },
    {
      label: '过敏学生总数',
      value: totalStudents,
      icon: Calendar,
      color: 'from-info-400 to-info-600',
      sub: `${severeStudents} 名严重过敏`,
    },
  ];

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-800">
                {formatDate(start, 'YYYY年MM月DD日')} - {formatDate(end, 'MM月DD日')}
              </h2>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                disabled={weekOffset >= 0}
              >
                <ChevronRight size={20} />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="btn-secondary text-xs"
                >
                  本周
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {summaryCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 -translate-y-8 translate-x-8`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                        <Icon size={18} className="text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">每日替换与异常趋势</h3>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="替换次数"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="未领取"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="错领"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning-500" />
              <h3 className="font-semibold text-slate-800">过敏源排行榜</h3>
            </div>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: any) => [`${value} 人次`, '出现次数']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                    {rankingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">每日详情</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">日期</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">星期</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">替换次数</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">未领取</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">错领</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">完成率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.dailyData.map((d, idx) => {
                    const rate = d.replacements > 0 ? Math.round(((d.replacements - d.notPicked) / d.replacements) * 100) : 100;
                    return (
                      <tr key={d.date} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-sm text-slate-700">{formatDate(d.date, 'MM月DD日')}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{weekDays[idx]}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-semibold text-primary-600">{d.replacements}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-semibold ${d.notPicked > 0 ? 'text-warning-600' : 'text-slate-400'}`}>
                            {d.notPicked}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-semibold ${d.wrongPick > 0 ? 'text-danger-600' : 'text-slate-400'}`}>
                            {d.wrongPick}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  rate >= 90 ? 'bg-primary-500' : rate >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-10">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">过敏源分布</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {stats.allergyRanking.map((item, idx) => {
                const maxCount = stats.allergyRanking[0]?.count || 1;
                const percentage = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${
                            idx === 0 ? 'bg-warning-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <AllergyBadge type={item.type} size="sm" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.count} 人次</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden ml-8">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: ALLERGY_COLORS[item.type],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              <h3 className="font-semibold text-slate-800">本周错领明细</h3>
              <span className="bg-danger-100 text-danger-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {stats.wrongPickCount} 次
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {stats.wrongPickList.length > 0 ? (
            <div className="space-y-2">
              {stats.wrongPickList.map((item: WrongPickItem) => {
                const isExpanded = expandedWrongPick === item.id;
                const mealMeta = MEAL_TYPE_META[item.mealType];
                return (
                  <div
                    key={item.id}
                    className="border border-danger-200 bg-danger-50/50 rounded-xl overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-danger-50 transition-colors"
                      onClick={() => setExpandedWrongPick(isExpanded ? null : item.id)}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {item.studentName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-slate-800 text-sm">{item.studentName}</p>
                          <span className="text-[10px] text-slate-400">{item.className}</span>
                          <span className="text-[10px] text-slate-400">{mealMeta.icon} {mealMeta.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(item.date, 'MM/DD')}</span>
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            拿走人：{item.actualTakerName}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Tag size={10} />
                            {item.wrongQrTail}
                          </span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-danger-200/60 pt-3 space-y-2 bg-white/50">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-400 mb-0.5">原菜品</p>
                            <p className="text-slate-600 font-medium line-through">{item.originalDish || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-0.5">替换菜</p>
                            <p className="text-primary-600 font-medium">{item.replacementDish || '-'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">处理备注</p>
                          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
                            {item.handleNotes || '暂无处理备注'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">本周没有错领记录</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            <h3 className="font-semibold text-slate-800">学生过敏概况</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(ALLERGY_META).map(([type, meta]) => {
              const count = students.filter((s) => s.allergies.some((a) => a.type === type)).length;
              return (
                <div
                  key={type}
                  className={`rounded-xl p-4 text-center ${
                    meta.highRisk ? 'bg-danger-50 border border-danger-100' : 'bg-slate-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{meta.icon}</div>
                  <p className={`text-xs font-medium ${meta.highRisk ? 'text-danger-600' : 'text-slate-500'}`}>
                    {meta.name}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${meta.highRisk ? 'text-danger-600' : 'text-slate-700'}`}>
                    {count}
                  </p>
                  <p className="text-[10px] text-slate-400">人</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
