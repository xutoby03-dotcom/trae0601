import { useEffect, useState } from 'react';
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
} from 'recharts';
import {
  BarChart3,
  HelpCircle,
  Clock,
  Home,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useRegistrationStore } from '@/store/registrationStore';
import { useCourseStore } from '@/store/courseStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useElderStore } from '@/store/elderStore';
import { COURSE_TOPIC_MAP } from '@/types';
import type { CourseTopic } from '@/types';

const COLORS = ['#FF6B35', '#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function Statistics() {
  const { registrations, fetchRegistrations } = useRegistrationStore();
  const { courses, fetchCourses } = useCourseStore();
  const { attendances, fetchAttendances, getVolunteerHours, getStuckProblems } = useAttendanceStore();
  const { elders, fetchElders, getHomeVisitElders } = useElderStore();

  const [activeTab, setActiveTab] = useState<'topics' | 'problems' | 'volunteers' | 'homevisit'>('topics');

  useEffect(() => {
    fetchElders();
    fetchCourses();
    fetchRegistrations();
    fetchAttendances();
  }, [fetchElders, fetchCourses, fetchRegistrations, fetchAttendances]);

  const topicStats = () => {
    const topicMap: Record<string, number> = {};
    registrations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .forEach(reg => {
        const course = courses.find(c => c.id === reg.courseId);
        if (course) {
          topicMap[course.topic] = (topicMap[course.topic] || 0) + 1;
        }
      });
    
    return Object.entries(topicMap)
      .map(([topic, count]) => ({
        name: COURSE_TOPIC_MAP[topic as CourseTopic] || topic,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const volunteerHours = getVolunteerHours();
  const stuckProblems = getStuckProblems();
  const homeVisitElders = getHomeVisitElders();

  const topicData = topicStats();

  const tabs = [
    { id: 'topics', label: '主题需求', icon: BarChart3 },
    { id: 'problems', label: '重复提问', icon: HelpCircle },
    { id: 'volunteers', label: '志愿者课时', icon: Clock },
    { id: 'homevisit', label: '上门辅导', icon: Home },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">数据统计</h1>
        <p className="text-neutral-500 mt-1">查看教学数据和分析报告</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <TrendingUp className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{elders.length}</p>
              <p className="text-sm text-neutral-500">老人总数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <BarChart3 className="text-success-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{courses.length}</p>
              <p className="text-sm text-neutral-500">课程总数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
              <Clock className="text-warning-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{attendances.length}</p>
              <p className="text-sm text-neutral-500">签到次数</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{homeVisitElders.length}</p>
              <p className="text-sm text-neutral-500">需上门辅导</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-2">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'topics' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">各主题需求统计</h2>
          {topicData.length === 0 ? (
            <p className="text-center text-neutral-400 py-12">暂无数据</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF6B35" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {topicData.slice(0, 4).map((topic, index) => (
              <div key={topic.name} className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-neutral-600">{topic.name}</span>
                </div>
                <p className="text-2xl font-bold text-neutral-800">{topic.value}</p>
                <p className="text-xs text-neutral-500">人次</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">高频问题统计</h2>
          {stuckProblems.length === 0 ? (
            <p className="text-center text-neutral-400 py-12">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stuckProblems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-warning-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-warning-200 flex items-center justify-center text-warning-700 font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{item.problem}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-warning-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-500 rounded-full"
                          style={{ width: `${(item.count / stuckProblems[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-warning-600 font-medium w-12 text-right">
                        {item.count}次
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'volunteers' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">志愿者课时统计</h2>
          {volunteerHours.length === 0 ? (
            <p className="text-center text-neutral-400 py-12">暂无数据</p>
          ) : (
            <>
              <div className="h-72 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volunteerHours}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}小时`, '课时']} />
                    <Bar dataKey="hours" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-neutral-100">
                {volunteerHours.map((vol, index) => (
                  <div key={index} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center text-success-600 font-bold">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{vol.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-success-600">{vol.hours}</p>
                      <p className="text-xs text-neutral-500">小时</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'homevisit' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">
            需要上门辅导名单
            <span className="ml-2 text-sm font-normal text-neutral-500">
              共 {homeVisitElders.length} 人
            </span>
          </h2>
          {homeVisitElders.length === 0 ? (
            <p className="text-center text-neutral-400 py-12">暂无需要上门辅导的老人</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeVisitElders.map((elder) => (
                <div
                  key={elder.id}
                  className="p-4 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={elder.avatar}
                      alt={elder.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-800">{elder.name}</p>
                      <p className="text-sm text-neutral-500">{elder.age}岁 · {elder.phone}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <p className="text-sm text-neutral-600 flex items-start gap-2">
                      <Home size={16} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                      {elder.address}
                    </p>
                    <p className="text-sm text-neutral-600 mt-2 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-warning-500 flex-shrink-0 mt-0.5" />
                      {elder.notes || '需要上门辅导'}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:${elder.phone}`}
                      className="flex-1 text-center py-2 bg-white rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      拨打电话
                    </a>
                    <a
                      href={`tel:${elder.emergencyPhone}`}
                      className="flex-1 text-center py-2 bg-white rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      紧急联系
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
