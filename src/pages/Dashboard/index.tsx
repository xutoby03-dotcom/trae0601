import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ClipboardList,
  Clock,
  ChevronRight,
  Plus,
  MapPin,
  UserCheck,
  Home,
} from 'lucide-react';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { formatTime, formatDate } from '@/utils/format';
import { COURSE_TOPIC_MAP, DIFFICULTY_MAP, COURSE_STATUS_MAP } from '@/types';

const statCards = [
  { label: '老人总数', icon: Users, color: 'primary', bgColor: 'bg-primary-50', textColor: 'text-primary-600' },
  { label: '课程总数', icon: BookOpen, color: 'success', bgColor: 'bg-success-50', textColor: 'text-success-600' },
  { label: '报名人数', icon: ClipboardList, color: 'warning', bgColor: 'bg-warning-50', textColor: 'text-warning-600' },
  { label: '今日签到', icon: Clock, color: 'info', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
];

export default function Dashboard() {
  const { elders, fetchElders, getHomeVisitElders } = useElderStore();
  const { courses, fetchCourses, getTodayCourses, getUpcomingCourses } = useCourseStore();
  const { registrations, fetchRegistrations } = useRegistrationStore();
  const { attendances, fetchAttendances } = useAttendanceStore();

  useEffect(() => {
    fetchElders();
    fetchCourses();
    fetchRegistrations();
    fetchAttendances();
  }, [fetchElders, fetchCourses, fetchRegistrations, fetchAttendances]);

  const todayCourses = getTodayCourses();
  const upcomingCourses = getUpcomingCourses().slice(0, 4);
  const homeVisitElders = getHomeVisitElders();

  const stats = [
    { value: elders.length, ...statCards[0] },
    { value: courses.length, ...statCards[1] },
    { value: registrations.filter(r => r.status === 'confirmed').length, ...statCards[2] },
    { value: attendances.filter(a => {
      const today = new Date();
      const checkIn = new Date(a.checkInTime);
      return checkIn.toDateString() === today.toDateString();
    }).length, ...statCards[3] },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">欢迎回来 👋</h1>
        <p className="text-neutral-500 mt-1">今天是 {formatDate(new Date().toISOString())}，让我们开始吧</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-800 mt-2">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={stat.textColor} size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-800">今日课程</h2>
              <Link to="/courses" className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1">
                查看全部 <ChevronRight size={16} />
              </Link>
            </div>

            {todayCourses.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>今天没有课程安排</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 truncate">{course.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(course.startTime)} - {formatTime(course.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {course.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="tag bg-primary-100 text-primary-600 text-xs">
                          {COURSE_TOPIC_MAP[course.topic]}
                        </span>
                        <span className="tag bg-neutral-100 text-neutral-600 text-xs">
                          {DIFFICULTY_MAP[course.difficulty]}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/attendance/new?courseId=${course.id}`}
                      className="btn-primary btn-lg flex-shrink-0"
                    >
                      <UserCheck size={20} />
                      签到
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">快捷操作</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/elders/new" className="flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-medium text-primary-600">新增老人</span>
              </Link>
              <Link to="/courses/new" className="flex flex-col items-center gap-2 p-4 bg-success-50 rounded-xl hover:bg-success-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-success-500 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-medium text-success-600">新增课程</span>
              </Link>
              <Link to="/registrations/new" className="flex flex-col items-center gap-2 p-4 bg-warning-50 rounded-xl hover:bg-warning-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-warning-500 flex items-center justify-center text-white">
                  <ClipboardList size={20} />
                </div>
                <span className="text-sm font-medium text-warning-600">快速报名</span>
              </Link>
              <Link to="/attendance/new" className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <UserCheck size={20} />
                </div>
                <span className="text-sm font-medium text-blue-600">课堂签到</span>
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">上门辅导</h2>
              <Link to="/statistics" className="text-primary-500 text-sm font-medium hover:text-primary-600">
                查看全部
              </Link>
            </div>
            {homeVisitElders.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">暂无需要上门的老人</p>
            ) : (
              <div className="space-y-3">
                {homeVisitElders.slice(0, 3).map((elder) => (
                  <Link
                    key={elder.id}
                    to={`/elders/${elder.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-xl transition-colors"
                  >
                    <img
                      src={elder.avatar}
                      alt={elder.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 text-sm">{elder.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        <Home size={12} className="inline mr-1" />
                        {elder.address}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-800">即将开始的课程</h2>
          <Link to="/courses" className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1">
            全部课程 <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingCourses.map((course) => (
            <div key={course.id} className="p-4 border border-neutral-100 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="tag bg-primary-100 text-primary-600 text-xs">
                  {COURSE_TOPIC_MAP[course.topic]}
                </span>
                <span className="text-xs text-neutral-400">
                  {COURSE_STATUS_MAP[course.status]}
                </span>
              </div>
              <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{formatDate(course.startTime)}</span>
                <span>{formatTime(course.startTime)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
