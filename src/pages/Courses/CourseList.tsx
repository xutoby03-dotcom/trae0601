import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Clock,
  MapPin,
  User,
  Users,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { COURSE_TOPIC_MAP, DIFFICULTY_MAP, COURSE_STATUS_MAP } from '@/types';
import { formatDate, formatTime } from '@/utils/format';
import type { CourseStatus } from '@/types';

const statusFilters: { value: 'all' | CourseStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'upcoming', label: '未开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'finished', label: '已结束' },
  { value: 'cancelled', label: '已取消' },
];

export default function CourseList() {
  const { courses } = useCourseStore();
  const { getConfirmedCount, getWaitlistCount } = useRegistrationStore();
  const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all');

  const filteredCourses = courses
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">课程管理</h1>
        <Link to="/courses/new" className="btn-primary btn-lg">
          <Plus size={20} />
          新增课程
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const confirmedCount = getConfirmedCount(course.id);
          const waitlistCount = getWaitlistCount(course.id);
          const progress = (confirmedCount / course.capacity) * 100;

          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="card p-6 card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`tag mb-2 ${
                    course.status === 'upcoming' ? 'bg-primary-100 text-primary-600' :
                    course.status === 'ongoing' ? 'bg-success-100 text-success-600' :
                    course.status === 'finished' ? 'bg-neutral-100 text-neutral-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {COURSE_STATUS_MAP[course.status]}
                  </span>
                  <h3 className="font-semibold text-lg text-neutral-800 line-clamp-1">
                    {course.title}
                  </h3>
                </div>
                <ChevronRight
                  size={20}
                  className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tag bg-warm-100 text-warm-600 text-xs">
                  {COURSE_TOPIC_MAP[course.topic]}
                </span>
                <span className="tag bg-neutral-100 text-neutral-600 text-xs">
                  {DIFFICULTY_MAP[course.difficulty]}
                </span>
              </div>

              <div className="space-y-2 text-sm text-neutral-600 mb-4">
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-neutral-400" />
                  {formatDate(course.startTime)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-400" />
                  {formatTime(course.startTime)} - {formatTime(course.endTime)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-neutral-400" />
                  {course.location}
                </p>
                <p className="flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  {course.volunteer}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-600 flex items-center gap-1">
                    <Users size={14} />
                    报名进度
                  </span>
                  <span className="font-medium text-neutral-800">
                    {confirmedCount}/{course.capacity}人
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress >= 100 ? 'bg-warning-500' : 'bg-success-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                {waitlistCount > 0 && (
                  <p className="text-xs text-warning-600 mt-2">
                    还有 {waitlistCount} 人候补
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="card p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">暂无课程</p>
          <Link to="/courses/new" className="btn-primary mt-4">
            创建第一个课程
          </Link>
        </div>
      )}
    </div>
  );
}
