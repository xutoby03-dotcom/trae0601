import React, { useEffect } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
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
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { formatShortDate, getRiskLevel } from '../utils/helpers';

export const StatisticsPage: React.FC = () => {
  const { statistics, courses, loading, error, fetchStatistics, fetchCourses, courseStatistics, fetchCourseStatistics, setError } = useStore();

  useEffect(() => {
    fetchStatistics();
    fetchCourses();
  }, [fetchStatistics, fetchCourses]);

  useEffect(() => {
    courses.forEach((course) => {
      if (!courseStatistics.has(course.id)) {
        fetchCourseStatistics(course.id);
      }
    });
  }, [courses, courseStatistics, fetchCourseStatistics]);

  const classColors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const classData = statistics?.topBorrowClasses.map((item, index) => ({
    name: item.className,
    value: item.count,
    fill: classColors[index % classColors.length],
  })) || [];

  const courseRiskData = courses
    .map((course) => {
      const stats = courseStatistics.get(course.id);
      return {
        name: course.name.length > 8 ? course.name.slice(0, 8) + '...' : course.name,
        风险评分: stats?.aisleRiskScore || 0,
        旁听率: stats?.auditorRate || 0,
      };
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">统计分析</h1>
        <p className="text-sm text-slate-500 mt-1">
          旁听数据统计和分析，辅助教学决策
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            关闭
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-xl border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  平均
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {statistics?.averageAuditorRate || 0}%
              </p>
              <p className="text-sm text-slate-500 mt-1">平均旁听率</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  平均
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {statistics?.averageWaitlistCount || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">平均候补人数</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  高风险
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {statistics?.highRiskCourses || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">高风险课程数</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  总计
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                {statistics?.totalApplications || 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">旁听申请总数</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                <h3 className="font-medium text-slate-800">
                  近7天旁听趋势
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statistics?.weeklyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatShortDate(date)}
                      tick={{ fontSize: 12 }}
                      stroke="#94a3b8"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(date) => formatShortDate(date)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="auditorCount"
                      name="旁听人数"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="waitlistCount"
                      name="候补人数"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-slate-400" />
                <h3 className="font-medium text-slate-800">
                  最常借读班级 TOP5
                </h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={classData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      dataKey="value"
                    >
                      {classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <h3 className="font-medium text-slate-800">
                课程风险分析
              </h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseRiskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="风险评分"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="旁听率"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-4">
              课程风险详情
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      课程名称
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      申请数
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      已签到
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      候补
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      未到
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      旁听率
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">
                      过道风险
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const stats = courseStatistics.get(course.id);
                    const risk = stats
                      ? getRiskLevel(stats.aisleRiskScore)
                      : null;
                    return (
                      <tr
                        key={course.id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-slate-800">
                          {course.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-slate-600">
                          {stats?.totalApplications || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-slate-600">
                          {stats?.checkedInCount || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-slate-600">
                          {stats?.waitlistCount || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-center text-slate-600">
                          {stats?.noShowCount || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          <span
                            className={`font-medium ${
                              (stats?.auditorRate || 0) >= 80
                                ? 'text-green-600'
                                : (stats?.auditorRate || 0) >= 50
                                ? 'text-yellow-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {stats?.auditorRate || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {risk && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${risk.color}`}
                            >
                              {risk.level} ({stats?.aisleRiskScore || 0}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
