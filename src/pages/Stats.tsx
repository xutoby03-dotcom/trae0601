import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Users,
  Package,
  Droplets,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import {
  calculateMemberStats,
  calculateBoxStats,
  calculateTotalLitterConsumption,
  getDeepCleanList,
} from '../utils/stats';
import { formatDate, hoursBetween } from '../utils/date';
import { cn } from '../lib/utils';
import StarRating from '../components/common/StarRating';
import DeepCleanBadge from '../components/common/DeepCleanBadge';

const Stats: React.FC = () => {
  const { members, litterBoxes, records, addRecord, currentMemberId } = useAppStore();

  const memberStats = useMemo(
    () => calculateMemberStats(records, members),
    [records, members]
  );

  const boxStats = useMemo(
    () => calculateBoxStats(records, litterBoxes),
    [records, litterBoxes]
  );

  const litterConsumption = useMemo(
    () => calculateTotalLitterConsumption(records, litterBoxes),
    [records, litterBoxes]
  );

  const deepCleanList = useMemo(
    () => getDeepCleanList(records, litterBoxes),
    [records, litterBoxes]
  );

  const totalRecords = records.length;
  const totalMembers = members.length;

  const averageIntervalHours = useMemo(() => {
    if (records.length < 2) return 0;
    const sorted = [...records].sort(
      (a, b) =>
        new Date(a.cleanTime).getTime() - new Date(b.cleanTime).getTime()
    );
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(
        hoursBetween(sorted[i - 1].cleanTime, sorted[i].cleanTime)
      );
    }
    return intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0;
  }, [records]);

  const totalCleansAllMembers = memberStats.reduce(
    (sum, s) => sum + s.totalCleans + s.totalFullChanges,
    0
  );

  const barChartData = useMemo(() => {
    return memberStats
      .map((stat) => {
        const member = members.find((m) => m.id === stat.memberId);
        return {
          name: member?.name || '未知',
          清理次数: stat.totalCleans,
          整盆换砂: stat.totalFullChanges,
          color: member?.color || '#8B7E6B',
        };
      })
      .sort(
        (a, b) => b.清理次数 + b.整盆换砂 - (a.清理次数 + a.整盆换砂)
      );
  }, [memberStats, members]);

  const last14DaysData = useMemo(() => {
    const days: { date: string; dateLabel: string; [key: string]: string | number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const entry: { date: string; dateLabel: string; [key: string]: string | number } = {
        date: dateStr,
        dateLabel: label,
      };
      litterBoxes.forEach((box) => {
        entry[box.name] = 0;
      });
      days.push(entry);
    }

    records.forEach((record) => {
      const recordDate = new Date(record.cleanTime)
        .toISOString()
        .split('T')[0];
      const dayEntry = days.find((d) => d.date === recordDate);
      const box = litterBoxes.find((b) => b.id === record.litterBoxId);
      if (dayEntry && box) {
        dayEntry[box.name] = (dayEntry[box.name] as number) + 1;
      }
    });

    return days;
  }, [records, litterBoxes]);

  const pieData = useMemo(() => {
    const refillKg = Number(
      (litterConsumption.fromRefills / 1000).toFixed(1)
    );
    const fullChangeKg = Number(
      (litterConsumption.fromFullChanges / 1000).toFixed(1)
    );
    return [
      { name: '补砂', value: refillKg, color: '#A8C5A0' },
      { name: '整盆换砂', value: fullChangeKg, color: '#C48E9F' },
    ];
  }, [litterConsumption]);

  const dailyConsumptionKg = Number(
    (litterConsumption.perDay / 1000).toFixed(2)
  );
  const estimatedMonthlyKg = Number((dailyConsumptionKg * 30).toFixed(1));
  const estimatedWeeklyKg = Number((dailyConsumptionKg * 7).toFixed(1));

  const needRestock = estimatedMonthlyKg > 20;

  const boxColors = ['#6B8E7A', '#C48E9F', '#8BA4B8', '#D4A373', '#A8C5A0'];

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getBox = (id: string) => litterBoxes.find((b) => b.id === id);

  const overviewCards = [
    {
      label: '总清理次数',
      value: totalRecords,
      unit: '次',
      icon: Sparkles,
      bg: 'bg-[#E8C77A]/15',
      iconColor: 'text-[#C9A54A]',
      borderColor: 'border-[#E8C77A]/30',
      valueColor: 'text-[#C9A54A]',
      subText: '',
    },
    {
      label: '参与成员',
      value: totalMembers,
      unit: '人',
      icon: Users,
      bg: 'bg-[#8BA4B8]/15',
      iconColor: 'text-[#6B8698]',
      borderColor: 'border-[#8BA4B8]/30',
      valueColor: 'text-[#6B8698]',
      subText: '',
    },
    {
      label: '猫砂总消耗',
      value: Number((litterConsumption.totalGrams / 1000).toFixed(1)),
      unit: 'kg',
      icon: Package,
      bg: 'bg-[#A8C5A0]/15',
      iconColor: 'text-[#6B8E7A]',
      borderColor: 'border-[#A8C5A0]/30',
      valueColor: 'text-[#6B8E7A]',
      subText: `补砂 ${Number(
        (litterConsumption.fromRefills / 1000).toFixed(1)
      )}kg · 整换 ${Number(
        (litterConsumption.fromFullChanges / 1000).toFixed(1)
      )}kg`,
    },
    {
      label: '平均清理间隔',
      value: Number(averageIntervalHours.toFixed(1)),
      unit: '小时',
      icon: TrendingUp,
      bg: 'bg-[#C48E9F]/15',
      iconColor: 'text-[#A46B80]',
      borderColor: 'border-[#C48E9F]/30',
      valueColor: 'text-[#A46B80]',
      subText: '',
    },
  ];

  const rankedMemberStats = useMemo(() => {
    return [...memberStats]
      .map((stat) => {
        const total = stat.totalCleans + stat.totalFullChanges;
        const percentage =
          totalCleansAllMembers > 0
            ? Number(((total / totalCleansAllMembers) * 100).toFixed(1))
            : 0;
        return { ...stat, total, percentage };
      })
      .sort((a, b) => b.total - a.total);
  }, [memberStats, totalCleansAllMembers]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1
            className="text-3xl font-bold text-[#5C5040] tracking-tight"
            style={{ fontFamily: 'LXGW WenKai, serif' }}
          >
            数据报表 📊
          </h1>
          <p className="text-[#8B7E6B] text-base">
            全面了解家庭猫砂盆清洁情况
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={cn(
                  'bg-white rounded-3xl p-5 lg:p-6 border shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1',
                  card.borderColor
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out both',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-3 rounded-2xl', card.bg)}>
                    <Icon size={24} className={card.iconColor} strokeWidth={2} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        'text-3xl lg:text-4xl font-bold',
                        card.valueColor
                      )}
                    >
                      {card.value}
                    </span>
                    <span className="text-sm text-[#8B7E6B] font-medium">
                      {card.unit}
                    </span>
                  </div>
                  <p className="text-sm text-[#A09484]">{card.label}</p>
                  {card.subText && (
                    <p className="text-xs text-[#A09484] mt-1 pt-1 border-t border-[#F0E8DB]">
                      {card.subText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E8DFD2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-[#8BA4B8]/15">
              <Users size={22} className="text-[#6B8698]" strokeWidth={2} />
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-[#5C5040]"
                style={{ fontFamily: 'LXGW WenKai, serif' }}
              >
                家庭成员贡献榜
              </h2>
              <p className="text-sm text-[#A09484] mt-0.5">
                每位成员的清洁贡献统计
              </p>
            </div>
          </div>

          {barChartData.length === 0 ||
          barChartData.every((d) => d.清理次数 === 0 && d.整盆换砂 === 0) ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🐱</div>
              <p className="text-[#8B7E6B] text-lg">暂无清理数据</p>
              <p className="text-[#A09484] text-sm mt-1">
                开始记录清理后，这里会显示家庭成员的贡献情况
              </p>
            </div>
          ) : (
            <>
              <div className="h-72 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      {barChartData.map((entry, index) => (
                        <linearGradient
                          key={`grad-clean-${index}`}
                          id={`cleanGradient${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={entry.color}
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor={entry.color}
                            stopOpacity={0.5}
                          />
                        </linearGradient>
                      ))}
                      {barChartData.map((entry, index) => (
                        <linearGradient
                          key={`grad-full-${index}`}
                          id={`fullGradient${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={entry.color}
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="100%"
                            stopColor={entry.color}
                            stopOpacity={0.25}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0E8DB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#8B7E6B', fontSize: 13 }}
                      axisLine={{ stroke: '#E8DFD2' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8B7E6B', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF9',
                        border: '1px solid #E8DFD2',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(92, 80, 64, 0.1)',
                        padding: '12px 16px',
                      }}
                      itemStyle={{ color: '#5C5040', fontSize: '13px' }}
                      labelStyle={{
                        color: '#5C5040',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        color: '#8B7E6B',
                      }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="清理次数"
                      radius={[8, 8, 0, 0]}
                      barSize={28}
                    >
                      {barChartData.map((_, index) => (
                        <Cell
                          key={`cell-clean-${index}`}
                          fill={`url(#cleanGradient${index})`}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="整盆换砂"
                      radius={[8, 8, 0, 0]}
                      barSize={28}
                    >
                      {barChartData.map((_, index) => (
                        <Cell
                          key={`cell-full-${index}`}
                          fill={`url(#fullGradient${index})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#F0E8DB]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FAF6F0]">
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        排名
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        成员
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        总清理次数
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        整盆换砂
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        占比
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        平均异味
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DB]">
                    {rankedMemberStats.map((stat, index) => {
                      const member = getMember(stat.memberId);
                      const rankBg =
                        index === 0
                          ? 'bg-[#E8C77A]/20 text-[#C9A54A]'
                          : index === 1
                          ? 'bg-[#C4B9A8]/20 text-[#8B7E6B]'
                          : index === 2
                          ? 'bg-[#D4A373]/20 text-[#B88A5A]'
                          : 'bg-[#F0E8DB] text-[#A09484]';
                      return (
                        <tr
                          key={stat.memberId}
                          className="hover:bg-[#FAF6F0]/60 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold',
                                rankBg
                              )}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
                                style={{
                                  backgroundColor: member
                                    ? `${member.color}20`
                                    : '#FAF6F0',
                                }}
                              >
                                {member?.avatar || '👤'}
                              </div>
                              <span className="font-medium text-[#5C5040]">
                                {member?.name || '未知成员'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-lg font-bold text-[#5C5040]">
                              {stat.total}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-[#C48E9F]/15 text-[#A46B80] text-sm font-medium">
                              {stat.totalFullChanges} 次
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 h-2 bg-[#F0E8DB] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      stat.percentage,
                                      100
                                    )}%`,
                                    backgroundColor: member?.color || '#8B7E6B',
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-[#5C5040] w-12 text-right">
                                {stat.percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <StarRating
                                value={
                                  (Math.round(stat.averageSmellLevel) ||
                                    1) as 1 | 2 | 3 | 4 | 5
                                }
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E8DFD2] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-[#A8C5A0]/15">
              <Droplets size={22} className="text-[#6B8E7A]" strokeWidth={2} />
            </div>
            <div>
              <h2
                className="text-xl font-semibold text-[#5C5040]"
                style={{ fontFamily: 'LXGW WenKai, serif' }}
              >
                各猫砂盆使用分析
              </h2>
              <p className="text-sm text-[#A09484] mt-0.5">
                最近14天每盆清理次数趋势
              </p>
            </div>
          </div>

          {litterBoxes.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-[#8B7E6B] text-lg">暂无猫砂盆数据</p>
            </div>
          ) : (
            <>
              <div className="h-72 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last14DaysData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F0E8DB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fill: '#8B7E6B', fontSize: 12 }}
                      axisLine={{ stroke: '#E8DFD2' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8B7E6B', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFDF9',
                        border: '1px solid #E8DFD2',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(92, 80, 64, 0.1)',
                        padding: '12px 16px',
                      }}
                      itemStyle={{ color: '#5C5040', fontSize: '13px' }}
                      labelStyle={{
                        color: '#5C5040',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        color: '#8B7E6B',
                      }}
                      iconType="circle"
                    />
                    {litterBoxes.map((box, index) => (
                      <Line
                        key={box.id}
                        type="monotone"
                        dataKey={box.name}
                        stroke={boxColors[index % boxColors.length]}
                        strokeWidth={2.5}
                        dot={{
                          fill: boxColors[index % boxColors.length],
                          strokeWidth: 0,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                          strokeWidth: 2,
                          stroke: '#FFFDF9',
                        }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#F0E8DB]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FAF6F0]">
                      <th className="px-5 py-4 text-left text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        猫砂盆
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        清理次数
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        平均间隔
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        平均异味
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-semibold text-[#A09484] uppercase tracking-wider">
                        累计补砂
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0E8DB]">
                    {boxStats.map((stat) => {
                      const box = getBox(stat.boxId);
                      return (
                        <tr
                          key={stat.boxId}
                          className="hover:bg-[#FAF6F0]/60 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={box?.photo}
                                alt={box?.name}
                                className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                              />
                              <div>
                                <div className="font-medium text-[#5C5040]">
                                  {box?.name || '未知'}
                                </div>
                                <div className="text-xs text-[#A09484] mt-0.5">
                                  {box?.location} · {box?.litterType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-lg font-bold text-[#5C5040]">
                              {stat.totalCleans}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-[#8BA4B8]/15 text-[#6B8698] text-sm font-medium">
                              {stat.averageIntervalHours} 小时
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center">
                              <StarRating
                                value={
                                  (Math.round(stat.averageSmellLevel) ||
                                    1) as 1 | 2 | 3 | 4 | 5
                                }
                                size="sm"
                                showLabel={false}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="px-3 py-1 rounded-full bg-[#A8C5A0]/15 text-[#6B8E7A] text-sm font-medium">
                              {(stat.totalLitterAdded / 1000).toFixed(1)} kg
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E8DFD2] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-[#D4A373]/15">
                <Package size={22} className="text-[#B88A5A]" strokeWidth={2} />
              </div>
              <div>
                <h2
                  className="text-xl font-semibold text-[#5C5040]"
                  style={{ fontFamily: 'LXGW WenKai, serif' }}
                >
                  猫砂消耗统计
                </h2>
                <p className="text-sm text-[#A09484] mt-0.5">
                  补砂 vs 整盆换砂占比
                </p>
              </div>
            </div>

            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#FFFDF9"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} kg`, '']}
                    contentStyle={{
                      backgroundColor: '#FFFDF9',
                      border: '1px solid #E8DFD2',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(92, 80, 64, 0.1)',
                      padding: '12px 16px',
                    }}
                    itemStyle={{ color: '#5C5040', fontSize: '13px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: '#8B7E6B', fontSize: '13px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#FAF6F0] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#A09484] mb-1">日均消耗</p>
                <p className="text-2xl font-bold text-[#6B8E7A]">
                  {dailyConsumptionKg}
                  <span className="text-sm font-normal text-[#8B7E6B] ml-1">
                    kg/天
                  </span>
                </p>
              </div>
              <div className="bg-[#FAF6F0] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#A09484] mb-1">预计本月</p>
                <p className="text-2xl font-bold text-[#D4A373]">
                  {estimatedMonthlyKg}
                  <span className="text-sm font-normal text-[#8B7E6B] ml-1">
                    kg
                  </span>
                </p>
              </div>
            </div>

            {needRestock ? (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#D4896A]/10 border border-[#D4896A]/20">
                <AlertTriangle
                  size={20}
                  className="text-[#D4896A] flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-sm font-semibold text-[#8B4A2A]">
                    补货建议
                  </p>
                  <p className="text-xs text-[#B87A5A] mt-1">
                    按当前消耗速度，建议储备 {estimatedWeeklyKg}kg 猫砂（约1周用量），本月预计需要{' '}
                    {estimatedMonthlyKg}kg
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#A8C5A0]/10 border border-[#A8C5A0]/20">
                <CheckCircle2
                  size={20}
                  className="text-[#6B8E7A] flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-sm font-semibold text-[#4A6B5A]">
                    库存充足
                  </p>
                  <p className="text-xs text-[#6B8E7A] mt-1">
                    当前用量稳定，按需采购即可
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E8DFD2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#C48E9F]/15">
                  <Sparkles size={22} className="text-[#A46B80]" strokeWidth={2} />
                </div>
                <div>
                  <h2
                    className="text-xl font-semibold text-[#5C5040]"
                    style={{ fontFamily: 'LXGW WenKai, serif' }}
                  >
                    深度清洗清单
                  </h2>
                  <p className="text-sm text-[#A09484] mt-0.5">
                    按整换间隔·异味情况·使用频次综合排序
                  </p>
                </div>
              </div>
              {deepCleanList.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#A09484]">共 {deepCleanList.length} 盆待处理</span>
                </div>
              )}
            </div>

            {deepCleanList.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">😺✨</div>
                <p className="text-[#6B8E7A] text-lg font-medium">
                  太棒了！所有猫砂盆都很干净
                </p>
                <p className="text-[#A09484] text-sm mt-2">
                  继续保持良好的清洁习惯哦～
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deepCleanList.map((item, index) => {
                  const box = getBox(item.boxId);
                  const priorityLabel =
                    item.priority === 'high'
                      ? '高优'
                      : item.priority === 'medium'
                      ? '中优'
                      : '低优';
                  const priorityBg =
                    item.priority === 'high'
                      ? 'bg-[#FCE4DC]'
                      : item.priority === 'medium'
                      ? 'bg-[#FBF0D6]'
                      : 'bg-[#F0F0E8]';
                  const priorityText =
                    item.priority === 'high'
                      ? 'text-[#B84A2A]'
                      : item.priority === 'medium'
                      ? 'text-[#8B6B1A]'
                      : 'text-[#6B6B5A]';
                  return (
                    <div
                      key={item.boxId}
                      className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#F0E8DB] hover:border-[#E8DFD2] hover:shadow-sm transition-all"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animation: 'fadeInUp 0.5s ease-out both',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm bg-[#F0DFC8] flex items-center justify-center">
                          {box?.photo ? (
                            <img
                              src={box.photo}
                              alt={box.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🐾</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#5C5040]">
                                {box?.name || '未知猫砂盆'}
                              </h3>
                              <DeepCleanBadge status={item} size="sm" />
                            </div>
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-full text-xs font-bold',
                                priorityBg,
                                priorityText
                              )}
                            >
                              {priorityLabel} · {item.score} 分
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#A09484] mb-3 flex-wrap">
                            <span>📍 {box?.location}</span>
                            <span className="mx-1">·</span>
                            <span>🗓️ 距上次整换 {item.metrics.daysSinceFullChange} 天</span>
                            <span className="mx-1">·</span>
                            <span>🔢 本轮 {item.metrics.totalCleans} 次清理</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                            <div className="p-2 rounded-xl bg-white border border-[#F0E8DB]">
                              <div className="text-[11px] text-[#A09484] mb-0.5">
                                整换进度
                              </div>
                              <div className="text-sm font-bold text-[#5C5040]">
                                {Math.round(item.metrics.fullChangeRatio * 100)}%
                              </div>
                              <div className="mt-1 h-1.5 rounded-full bg-[#F0E8DB] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(item.metrics.fullChangeRatio * 100, 100)}%`,
                                    backgroundColor:
                                      item.metrics.fullChangeRatio >= 1.2
                                        ? '#D4896A'
                                        : item.metrics.fullChangeRatio >= 1
                                        ? '#E8C77A'
                                        : '#A8C5A0',
                                  }}
                                />
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-[#F0E8DB]">
                              <div className="text-[11px] text-[#A09484] mb-0.5">
                                平均异味
                              </div>
                              <div className="text-sm font-bold text-[#5C5040]">
                                {item.metrics.averageSmell} / 5
                              </div>
                              <div className="mt-1 flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <div
                                    key={n}
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        n <= Math.round(item.metrics.averageSmell)
                                          ? '#E8C77A'
                                          : '#F0E8DB',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-[#F0E8DB]">
                              <div className="text-[11px] text-[#A09484] mb-0.5">
                                连续高异味
                              </div>
                              <div className="text-sm font-bold text-[#5C5040]">
                                {item.metrics.highSmellStreak} 次
                              </div>
                              <div className="mt-1 text-[10px]">
                                {item.metrics.highSmellStreak >= 3 ? (
                                  <span className="text-[#D4896A] font-medium">⚠️ 需注意</span>
                                ) : (
                                  <span className="text-[#A8C5A0]">正常</span>
                                )}
                              </div>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-[#F0E8DB]">
                              <div className="text-[11px] text-[#A09484] mb-0.5">
                                距上次清理
                              </div>
                              <div className="text-sm font-bold text-[#5C5040]">
                                {Math.floor(item.metrics.hoursSinceLastClean)}h
                              </div>
                              <div className="mt-1 text-[10px]">
                                {item.metrics.hoursSinceLastClean > 24 ? (
                                  <span className="text-[#D4896A]">超过1天</span>
                                ) : (
                                  <span className="text-[#A8C5A0]">正常</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {item.reasons.map((reason, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-xs text-[#8B7E6B]"
                              >
                                <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0 bg-[#D4B896]" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded-lg bg-[#A8C5A0]/15 text-[#6B8E7A] font-medium">
                                💡 清洗建议
                              </span>
                              <span className="text-[#A09484]">
                                倒空猫砂 → 温水浸泡30分钟 → 中性洗涤剂刷洗 → 阳光晾干 → 重新装砂
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const box = litterBoxes.find((b) => b.id === item.boxId);
                                if (!box) return;
                                addRecord({
                                  litterBoxId: box.id,
                                  memberId: currentMemberId,
                                  cleanTime: new Date().toISOString(),
                                  smellLevel: 1,
                                  clumpLevel: '少',
                                  addedLitter: true,
                                  addedAmount: box.capacity,
                                  note: '深度清洗后整盆换砂',
                                  isFullChange: true,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
                              style={{ backgroundColor: '#6B8E6B' }}
                            >
                              <Sparkles size={14} strokeWidth={2} />
                              记录整盆换砂
                            </button>
                          </div>
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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Stats;
