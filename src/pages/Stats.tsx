import { useEffect } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  Award,
  ArrowUpRight,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';

export default function Stats() {
  const { stats, fetchStats, activities, fetchActivities } = useAppStore();

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, [fetchStats, fetchActivities]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const totalActivities = stats.activities.length;
  const totalRegistered = stats.activities.reduce((sum, a) => sum + a.totalRegistered, 0);
  const totalCheckedIn = stats.activities.reduce((sum, a) => sum + a.checkedIn, 0);
  const overallAttendance = totalRegistered > 0
    ? Math.round((totalCheckedIn / totalRegistered) * 100)
    : 0;

  const mostPopularType = stats.typeStats[0];

  const attendanceRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const attendanceBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const typeColors: Record<string, string> = {
    lecture: 'from-blue-400 to-blue-600',
    boardgame: 'from-purple-400 to-purple-600',
    photoshoot: 'from-amber-400 to-amber-600',
    volunteer: 'from-green-400 to-green-600',
  };

  const typeLabels: Record<string, string> = {
    lecture: '讲座',
    boardgame: '桌游夜',
    photoshoot: '外拍',
    volunteer: '志愿服务',
  };

  const maxTypeCount = Math.max(...stats.typeStats.map((t) => t.count), 1);

  return (
    <div className="min-h-screen bg-cream-100 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-500 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <span className="text-lg font-medium text-white/90">数据看板</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">活动统计</h1>
          <p className="text-white/80">全方位了解社团活动数据</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-fade-in-up">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalActivities}</div>
            <div className="text-sm text-gray-500">活动总数</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalRegistered}</div>
            <div className="text-sm text-gray-500">总报名人次</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalCheckedIn}</div>
            <div className="text-sm text-gray-500">总签到人次</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-secondary-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{overallAttendance}%</div>
            <div className="text-sm text-gray-500">整体到场率</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Type Popularity */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-500" />
              活动类型热度
            </h2>
            <div className="space-y-4">
              {stats.typeStats.map((type, index) => (
                <div key={type.type} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[type.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">{typeLabels[type.type] || type.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-800">{type.count}</span>
                      <span className="text-sm text-gray-400">人报名</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${typeColors[type.type] || 'from-gray-400 to-gray-600'} transition-all duration-500`}
                      style={{ width: `${(type.count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {stats.typeStats.length === 0 && (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              )}
            </div>
            {mostPopularType && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                <div className="flex items-center gap-2 text-primary-600 font-medium">
                  <ArrowUpRight className="w-5 h-5" />
                  最受欢迎：{typeLabels[mostPopularType.type] || mostPopularType.type}
                </div>
              </div>
            )}
          </div>

          {/* Waitlist Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              候补转正统计
            </h2>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-500 mb-2">
                  {stats.totalWaitlistPromoted}
                </div>
                <div className="text-gray-500">累计候补转正人数</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {stats.activities.filter((a) => a.waitlistPromoted > 0).slice(0, 4).map((act) => (
                <div key={act.activityId} className="p-3 bg-orange-50 rounded-xl">
                  <div className="text-sm font-medium text-gray-700 truncate">{act.activityTitle}</div>
                  <div className="text-lg font-bold text-orange-500">{act.waitlistPromoted} 人</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Attendance List */}
        <div className="bg-white rounded-2xl p-6 shadow-md mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-secondary-500" />
            各活动到场率
          </h2>
          <div className="space-y-4">
            {stats.activities
              .sort((a, b) => b.attendanceRate - a.attendanceRate)
              .map((act, index) => (
                <div
                  key={act.activityId}
                  className="p-4 bg-gray-50 rounded-xl animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{act.activityTitle}</div>
                      <div className="text-sm text-gray-500">
                        {typeLabels[act.activityType] || act.activityType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${attendanceRateColor(act.attendanceRate)}`}>
                        {act.attendanceRate}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {act.checkedIn}/{act.totalRegistered} 人
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${attendanceBarColor(act.attendanceRate)} transition-all duration-500`}
                      style={{ width: `${act.attendanceRate}%` }}
                    />
                  </div>
                </div>
              ))}
            {stats.activities.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
