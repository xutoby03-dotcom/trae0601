import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  ChevronRight,
  Sprout,
  BarChart3,
  Hand,
  Clock,
  AlertCircle,
} from 'lucide-react';
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
} from 'recharts';
import { useStore } from '../store/useStore.js';
import StatCard from '../components/StatCard.js';
import WeatherBanner from '../components/WeatherBanner.js';
import GardenBedCard from '../components/GardenBedCard.js';
import ScheduleCard from '../components/ScheduleCard.js';
import { CROP_EMOJIS, TIME_SLOT_LABELS } from '@shared/types.js';
import { formatDate, formatDateTime, getTimeSlotLabel } from '../utils/dateUtils.js';
import type { Schedule, TimeSlot } from '@shared/types.js';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    dashboardStats,
    weather,
    schedules,
    loading,
    fetchDashboardStats,
    fetchWeather,
    fetchSchedules,
    claimSchedule,
    simulateWeatherChange,
  } = useStore();

  const [waterUsagePeriod, setWaterUsagePeriod] = useState<'week' | 'month'>('week');
  const today = formatDate(new Date());

  useEffect(() => {
    fetchDashboardStats();
    fetchWeather();
    fetchSchedules(today);
  }, [fetchDashboardStats, fetchWeather, fetchSchedules, today]);

  const todaySchedules = schedules.filter((s) => s.scheduledDate === today);
  const unclaimedSchedules = todaySchedules.filter((s) => s.status === 'unclaimed');
  const mySchedules = todaySchedules.filter((s) => s.volunteerId === currentUser?.id);

  const handleClaim = async (scheduleId: string) => {
    if (!currentUser) return;
    await claimSchedule(scheduleId, currentUser.id);
    fetchDashboardStats();
  };

  const handleRefreshWeather = async () => {
    await simulateWeatherChange();
  };

  const handleCompleteSchedule = (schedule: Schedule) => {
    navigate('/check-in', { state: { scheduleId: schedule.id, gardenBedId: schedule.gardenBedId } });
  };

  const sortSchedulesByTime = (scheduleList: Schedule[]) => {
    const timeOrder: Record<TimeSlot, number> = { morning: 0, afternoon: 1, evening: 2 };
    return [...scheduleList].sort(
      (a, b) => timeOrder[a.timeSlot as TimeSlot] - timeOrder[b.timeSlot as TimeSlot]
    );
  };

  return (
    <div className="space-y-6">
      <WeatherBanner
        weather={weather}
        onRefresh={handleRefreshWeather}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日待浇水"
          value={dashboardStats?.todaySchedules.total || 0}
          icon={Droplets}
          color="blue"
          delay={0}
        />
        <StatCard
          title="已完成"
          value={dashboardStats?.todaySchedules.completed || 0}
          icon={CheckCircle}
          color="green"
          delay={100}
        />
        <StatCard
          title="缺人时段"
          value={dashboardStats?.todaySchedules.unclaimed || 0}
          icon={Users}
          color="orange"
          delay={200}
        />
        <StatCard
          title="待处理异常"
          value={dashboardStats?.anomaliesCount || 0}
          icon={AlertTriangle}
          color="red"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Calendar size={20} className="text-primary-600" />
                今日排班
              </h3>
              <button
                onClick={() => navigate('/schedule')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                查看全部 <ChevronRight size={16} />
              </button>
            </div>

            {mySchedules.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1">
                  <Hand size={14} className="text-sun-600" />
                  我的排班
                </p>
                <div className="space-y-2">
                  {sortSchedulesByTime(mySchedules).map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      showDate={false}
                      currentUserId={currentUser?.id}
                      onComplete={() => handleCompleteSchedule(schedule)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unclaimedSchedules.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-sun-700 mb-2 flex items-center gap-1">
                  <AlertCircle size={14} className="text-sun-600 animate-pulse-soft" />
                  缺人时段（点击认领）
                </p>
                <div className="space-y-2">
                  {sortSchedulesByTime(unclaimedSchedules).map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      showDate={false}
                      currentUserId={currentUser?.id}
                      onClaim={() => handleClaim(schedule.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {todaySchedules.filter((s) => s.status === 'completed').length > 0 && (
              <div>
                <p className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-1">
                  <CheckCircle size={14} className="text-primary-600" />
                  已完成
                </p>
                <div className="space-y-2 opacity-75">
                  {sortSchedulesByTime(
                    todaySchedules.filter((s) => s.status === 'completed')
                  ).map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      showDate={false}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {todaySchedules.length === 0 && (
              <div className="text-center py-8 text-forest-500">
                <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                <p>今日暂无排班</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <Sprout size={20} className="text-primary-600" />
                作物长势
              </h3>
              <button
                onClick={() => navigate('/garden-beds')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                全部菜畦 <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardStats?.cropGrowthStatus?.slice(0, 6).map(({ gardenBed, growthProgress }) => (
                <GardenBedCard
                  key={gardenBed.id}
                  gardenBed={gardenBed}
                  growthProgress={growthProgress}
                  showDetails={true}
                  onClick={() => navigate('/garden-beds')}
                />
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
                <BarChart3 size={20} className="text-primary-600" />
                用水统计
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setWaterUsagePeriod('week')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    waterUsagePeriod === 'week'
                      ? 'bg-primary-500 text-white'
                      : 'bg-cream-200 text-forest-700 hover:bg-cream-300'
                  }`}
                >
                  本周
                </button>
                <button
                  onClick={() => setWaterUsagePeriod('month')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    waterUsagePeriod === 'month'
                      ? 'bg-primary-500 text-white'
                      : 'bg-cream-200 text-forest-700 hover:bg-cream-300'
                  }`}
                >
                  本月
                </button>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {waterUsagePeriod === 'week' ? (
                  <BarChart data={dashboardStats?.waterUsageThisWeek || []}>
                    <defs>
                      <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#2D5A27" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D6" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      stroke="#8B7355"
                      fontSize={12}
                    />
                    <YAxis stroke="#8B7355" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F0',
                        border: '1px solid #D4CFC0',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} 升`, '用水量']}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    <Bar dataKey="amount" fill="url(#waterGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={dashboardStats?.waterUsageThisWeek || []}>
                    <defs>
                      <linearGradient id="waterLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#4CAF50" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D6" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.slice(5)}
                      stroke="#8B7355"
                      fontSize={12}
                    />
                    <YAxis stroke="#8B7355" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F0',
                        border: '1px solid #D4CFC0',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} 升`, '用水量']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#4CAF50"
                      strokeWidth={3}
                      dot={{ fill: '#4CAF50', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-primary-50 to-cream-100 border-2 border-primary-200">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              🍅 可采摘清单
            </h3>

            {dashboardStats?.readyToHarvest && dashboardStats.readyToHarvest.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.readyToHarvest.map((bed) => {
                  const emoji = CROP_EMOJIS[bed.crop] || '🌱';
                  return (
                    <div
                      key={bed.id}
                      className="bg-white/80 rounded-xl p-3 flex items-center gap-3 hover:bg-white transition-colors cursor-pointer"
                      onClick={() => navigate('/garden-beds')}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-forest-800">{bed.crop}</p>
                        <p className="text-sm text-forest-600">菜畦 {bed.bedNumber}</p>
                      </div>
                      <ChevronRight size={18} className="text-primary-500" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-forest-500">
                <Sprout size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无可采摘作物</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              今日时段
            </h3>
            <div className="space-y-3">
              {(['morning', 'afternoon', 'evening'] as TimeSlot[]).map((slot) => {
                const slotSchedules = todaySchedules.filter((s) => s.timeSlot === slot);
                const completed = slotSchedules.filter((s) => s.status === 'completed').length;
                const total = slotSchedules.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <div key={slot} className="p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-forest-800">
                        {TIME_SLOT_LABELS[slot]}
                      </span>
                      <span className="text-sm text-forest-600">
                        {completed}/{total} 完成
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary-600" />
              快速操作
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/check-in')}
                className="w-full btn btn-primary justify-start"
              >
                <Droplets size={18} />
                立即打卡浇水
              </button>
              <button
                onClick={() => navigate('/schedule')}
                className="w-full btn btn-secondary justify-start"
              >
                <Calendar size={18} />
                查看排班表
              </button>
              <button
                onClick={() => navigate('/anomalies')}
                className="w-full btn btn-outline justify-start"
              >
                <AlertTriangle size={18} />
                处理异常 ({dashboardStats?.anomaliesCount || 0})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
