import React from 'react';
import { useStore } from '../store/useStore';
import { calculateStats, formatDryingDuration, getRemainingTime } from '../utils/helpers';
import { ArrowLeft, Droplets, Trophy, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const { records, initStore } = useStore();

  React.useEffect(() => {
    initStore();
  }, [initStore]);

  const stats = calculateStats(records);
  const collectedRecords = records.filter(r => r.status === 'collected');
  const dryingRecords = records.filter(r => r.status === 'drying');

  const COLORS = ['#4A90D9', '#F5A623', '#7ED321', '#D94A90', '#8B5CF6'];

  const pieData = stats.areaDampDistribution.map(item => ({
    name: item.areaName,
    value: item.count
  })).filter(item => item.value > 0);

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} 次
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 pb-24 md:pb-8 md:pt-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/50 transition-all"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold font-display text-gray-800">
            📊 晾晒统计
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Droplets size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">本周返潮</p>
                <p className="text-2xl font-bold text-gray-800">{stats.weeklyDampCount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">本月 {stats.monthlyDampCount} 次</p>
          </div>

          <div className="card p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">累计晾晒</p>
                <p className="text-2xl font-bold text-gray-800">{records.length}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">已完成 {collectedRecords.length} 次</p>
          </div>

          <div className="card p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Calendar size={24} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">晾晒中</p>
                <p className="text-2xl font-bold text-gray-800">{dryingRecords.length}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              共 {dryingRecords.reduce((s, r) => s + r.quantity, 0)} 件
            </p>
          </div>

          <div className="card p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">干燥率</p>
                <p className="text-2xl font-bold text-gray-800">
                  {collectedRecords.length > 0
                    ? Math.round((collectedRecords.filter(r => r.isDry && !r.isDamp).length / collectedRecords.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              返潮率 {collectedRecords.length > 0
                ? Math.round((collectedRecords.filter(r => r.isDamp).length / collectedRecords.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-sky-500" />
              本周晾晒趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="dryCount"
                    name="完美干燥"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dampCount"
                    name="返潮"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets size={20} className="text-blue-500" />
              返潮区域分布
            </h3>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400">
                  <Droplets size={48} className="mx-auto mb-2 opacity-30" />
                  <p>暂无返潮记录</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            忘收次数排行榜
          </h3>
          <div className="space-y-3">
            {stats.forgottenByPerson.map((person, index) => (
              <div
                key={person.personId}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-amber-50 transition-all"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-600' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div className="text-3xl">{person.personAvatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{person.personName}</div>
                  <div className="text-sm text-gray-500">被提醒 {person.count} 次</div>
                </div>
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (person.count / Math.max(1, stats.forgottenByPerson[0]?.count || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.thickClothesPending.length > 0 && (
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              待收厚衣提醒
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              以下厚衣物建议提前安排收取，避免夜间返潮
            </p>
            <div className="space-y-3">
              {stats.thickClothesPending.map(record => {
                const remaining = getRemainingTime(record.startTime, record.expectedDuration);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                  >
                    <div className="text-4xl animate-float">{record.clothingTypeIcon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {record.clothingTypeLabel} × {record.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.responsiblePersonAvatar} {record.responsiblePerson} · {record.location}
                      </div>
                    </div>
                    <div className={`text-right ${remaining.overdue ? 'text-red-500' : 'text-amber-600'}`}>
                      <div className="font-medium">{remaining.text}</div>
                      <div className="text-xs">已晾 {formatDryingDuration(record.startTime)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {stats.forgottenByPerson.every(p => p.count === 0) && (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2 font-display">太棒了！</h3>
            <p className="text-gray-500">大家都很准时，没有忘收记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
