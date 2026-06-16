import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  Sparkles,
  UserX,
  Clock,
  BarChart3,
  Building2,
  Timer,
  Users,
  Trophy,
} from 'lucide-react';
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
import { useAppStore } from '../../store';
import type { WashingPool } from '../../types';

const CHART_COLORS = ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1', '#F0FDFA'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { bookings, washingPools, statistics } = useAppStore();

  const todayBookingsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter((b) => b.date === today).length;
  }, [bookings]);

  const pendingCleaningPools = useMemo(() => {
    return washingPools.filter((p) => p.status === 'CLEANING_PENDING').length;
  }, [washingPools]);

  const noShowRate = useMemo(() => {
    const total = bookings.length;
    if (total === 0) return 0;
    const noShows = bookings.filter((b) => b.status === 'NO_SHOW').length;
    return Math.round((noShows / total) * 100);
  }, [bookings]);

  const avgUsageDuration = useMemo(() => {
    const completed = bookings.filter((b) => b.duration);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, b) => sum + (b.duration ?? 0), 0);
    return Math.round(total / completed.length);
  }, [bookings]);

  const peakHoursData = useMemo(() => {
    return statistics.peakHours.map((item) => ({
      ...item,
      hourLabel: `${item.hour}:00`,
    }));
  }, [statistics.peakHours]);

  const buildingUsageData = useMemo(() => {
    return statistics.buildingUsage;
  }, [statistics.buildingUsage]);

  const overtimeData = useMemo(() => {
    return statistics.overtimeUsage.overtimes.map((item) => {
      const pool = washingPools.find((p: WashingPool) => p.id === item.poolId);
      return {
        ...item,
        poolName: pool?.name ?? item.poolId,
      };
    });
  }, [statistics.overtimeUsage.overtimes, washingPools]);

  const noShowsData = useMemo(() => {
    return statistics.noShows;
  }, [statistics.noShows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container max-w-7xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">物业管理看板</h1>
            <p className="text-sm text-gray-500 mt-1">全面掌握系统运营数据</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日预约数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{todayBookingsCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-primary-100 text-primary-600">
                <CalendarCheck className="w-7 h-7" />
              </div>
            </div>
          </div>
          <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待清洁设备</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingCleaningPools}</p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                <Sparkles className="w-7 h-7" />
              </div>
            </div>
          </div>
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">爽约率</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{noShowRate}<span className="text-lg font-medium text-gray-500 ml-1">%</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <UserX className="w-7 h-7" />
              </div>
            </div>
          </div>
          <div className="card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">平均使用时长</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgUsageDuration}<span className="text-lg font-medium text-gray-500 ml-1">分钟</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-accent-100 text-accent-600">
                <Clock className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">高峰时段</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hourLabel" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {peakHoursData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">楼栋使用排行</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={buildingUsageData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis
                    dataKey="building"
                    type="category"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {buildingUsageData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">超时占用统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">总超时次数</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{statistics.overtimeUsage.total}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 font-medium">平均超时时长</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{statistics.overtimeUsage.avgDuration}<span className="text-sm font-medium ml-1">分钟</span></p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">各洗脚池超时次数</p>
              {overtimeData.map((item, index) => (
                <div key={item.poolId} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-600 flex items-center gap-1.5">
                    {index < 3 && <Trophy className={`w-4 h-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`} />}
                    {item.poolName}
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(item.count / Math.max(...overtimeData.map((d) => d.count))) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">爽约统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">爽约总数</p>
                <p className="text-2xl font-bold text-red-700 mt-1">{noShowsData.total}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600 font-medium">爽约率</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{noShowsData.rate}<span className="text-sm font-medium ml-1">%</span></p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">高频爽约用户</p>
              <div className="space-y-2">
                {noShowsData.users.map((user, index) => (
                  <div
                    key={user.phone}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-600'
                            : index === 2
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserX className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-600">{user.count}次</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
