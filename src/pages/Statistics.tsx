import { useState } from 'react';
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
} from 'recharts';
import { useCleaningStore } from '@/store/cleaningStore';
import { CATEGORY_LABELS } from '@/types';
import { addDays, formatDateChinese, getDaysUntilNextClean } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Home, AlertCircle, CloudRain, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Statistics = () => {
  const {
    getYearlyCost,
    getMonthlyStats,
    getRoomStats,
    getLongestUnwashedItems,
    items,
    plans,
    simulateRainyDay,
    setSimulateRainyDay,
    rainyDates,
    toggleRainyDate,
    isRainyDate,
  } = useCleaningStore();

  const [activeTab, setActiveTab] = useState<'cost' | 'room' | 'items'>('cost');
  const [showRainCalendar, setShowRainCalendar] = useState(false);

  const yearlyCost = getYearlyCost();
  const monthlyStats = getMonthlyStats();
  const roomStats = getRoomStats();
  const longestUnwashed = getLongestUnwashedItems().slice(0, 5);

  const completedPlansThisYear = plans.filter(
    (p) => p.status === 'completed' && p.endDate && new Date(p.endDate).getFullYear() === new Date().getFullYear()
  ).length;

  const chartData = monthlyStats.map((item) => ({
    name: item.month.split('-')[1] + '月',
    花费: item.cost,
    次数: item.count,
  }));

  const pieData = roomStats.map((room) => ({
    name: room.room,
    value: room.itemCount,
  }));

  const totalItemCount = items.length;

  const nextTwoWeeks = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      label: formatDateChinese(date),
      day: new Date(date).getDate(),
      weekday: ['日', '一', '二', '三', '四', '五', '六'][new Date(date).getDay()],
    };
  });

  return (
    <div className="p-4 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">统计</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().getFullYear()} 年清洗数据概览
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">年度花费</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">¥{yearlyCost.toFixed(0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">清洗次数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedPlansThisYear} 次</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">物品总数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalItemCount} 件</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">需清洗</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {longestUnwashed.filter((item) => getDaysUntilNextClean(item.lastCleanDate, item.suggestedCycleDays) <= 7).length} 件
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">月度花费趋势</h2>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('cost')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                activeTab === 'cost'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              花费
            </button>
            <button
              onClick={() => setActiveTab('room')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                activeTab === 'room'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              房间
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                activeTab === 'items'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              物品
            </button>
          </div>
        </div>

        {activeTab === 'cost' && (
          <div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} tick={{ fill: '#9ca3af' }} />
                  <YAxis fontSize={12} tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="花费" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              单位：元
            </p>
          </div>
        )}

        {activeTab === 'room' && (
          <div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center">
              各房间物品数量分布
            </p>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-3">
            {longestUnwashed.length === 0 ? (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            ) : (
              longestUnwashed.map((item, index) => {
                const daysUntil = getDaysUntilNextClean(
                  item.lastCleanDate,
                  item.suggestedCycleDays
                );
                return (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        daysUntil <= 7 ? 'bg-red-500' : 'bg-orange-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {CATEGORY_LABELS[item.category]} · {item.room}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          daysUntil < 0
                            ? 'text-red-600'
                            : daysUntil <= 7
                            ? 'text-orange-500'
                            : 'text-gray-600'
                        }`}
                      >
                        {daysUntil < 0
                          ? `逾期 ${Math.abs(daysUntil)} 天`
                          : `还剩 ${daysUntil} 天`}
                      </p>
                      <p className="text-xs text-gray-400">
                        上次：{formatDateChinese(item.lastCleanDate)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">房间清洁负担</h2>
        <div className="space-y-4">
          {roomStats.length === 0 ? (
            <p className="text-center text-gray-400 py-4">暂无数据</p>
          ) : (
            roomStats.map((room) => (
              <div key={room.room}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{room.room}</span>
                  <span className="text-sm text-gray-500">
                    {room.itemCount} 件物品 · 已洗 {room.cleanCount} 次
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${room.itemCount > 0 ? (room.cleanCount / (room.itemCount * 2)) * 100 : 0}%`,
                      minWidth: room.cleanCount > 0 ? '8%' : '0%',
                    }}
                  />
                </div>
                {room.totalCost > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    累计花费 ¥{room.totalCost.toFixed(0)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-100 rounded-xl overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setShowRainCalendar(!showRainCalendar)}
        >
          <div className="flex items-center gap-2">
            <CloudRain className={cn('w-5 h-5', simulateRainyDay ? 'text-blue-600' : 'text-gray-400')} />
            <h3 className="text-sm font-medium text-gray-700">🔧 阴雨天模拟设置</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSimulateRainyDay(!simulateRainyDay);
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              simulateRainyDay
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            )}
          >
            {simulateRainyDay ? '☀️ 已开启' : '🌧️ 未开启'}
          </button>
        </div>

        {showRainCalendar && (
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 mb-3">
              {simulateRainyDay
                ? '点击日期标记为阴雨天（红色），创建计划时会给出晾晒提醒'
                : '请先开启阴雨天模拟'}
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {nextTwoWeeks.map((day) => {
                const rainy = isRainyDate(day.date);
                return (
                  <button
                    key={day.date}
                    disabled={!simulateRainyDay}
                    onClick={() => toggleRainyDate(day.date)}
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors',
                      simulateRainyDay
                        ? rainy
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-200'
                        : 'bg-white/50 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <span className="text-[10px] opacity-70">周{day.weekday}</span>
                    <span className="font-medium">{day.day}</span>
                    {rainy && <CloudRain className="w-3 h-3 mt-0.5 opacity-80" />}
                    {!rainy && simulateRainyDay && <Sun className="w-3 h-3 mt-0.5 opacity-50 text-yellow-500" />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>阴雨天</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded" />
                <span>晴天</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              当前标记了 {rainyDates.length} 个阴雨天
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
