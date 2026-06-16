import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Clock,
  ChevronRight,
  BookOpen,
  User,
} from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { formatDateTime, formatDuration } from '@/utils/format';

export default function AttendanceList() {
  const { attendances } = useAttendanceStore();
  const { elders } = useElderStore();
  const { courses } = useCourseStore();
  const [keyword, setKeyword] = useState('');

  const filteredAttendances = attendances
    .filter(a => {
      if (!keyword.trim()) return true;
      const elder = elders.find(e => e.id === a.elderId);
      const course = courses.find(c => c.id === a.courseId);
      const lower = keyword.toLowerCase();
      return (
        elder?.name.toLowerCase().includes(lower) ||
        course?.title.toLowerCase().includes(lower) ||
        a.volunteerName.toLowerCase().includes(lower)
      );
    })
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

  const getElder = (elderId: string) => elders.find(e => e.id === elderId);
  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-800">签到记录</h1>
        <Link to="/attendance/new" className="btn-primary btn-lg">
          <Plus size={20} />
          新增签到
        </Link>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="搜索老人姓名、课程或志愿者..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="input pl-12"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAttendances.map((att) => {
          const elder = getElder(att.elderId);
          const course = getCourse(att.courseId);
          return (
            <Link
              key={att.id}
              to={`/attendance/${att.id}`}
              className="card p-5 card-hover block"
            >
              <div className="flex items-start gap-4">
                {elder && (
                  <img
                    src={elder.avatar}
                    alt={elder.name}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-neutral-800">
                      {elder?.name || '未知老人'}
                    </h3>
                    <ChevronRight size={20} className="text-neutral-300" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {course?.title || '未知课程'}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {att.volunteerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(att.duration)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {formatDateTime(att.checkInTime)}
                  </p>
                  {att.learnedFunctions && (
                    <p className="text-sm text-success-600 mt-2 line-clamp-1">
                      ✓ 学会：{att.learnedFunctions}
                    </p>
                  )}
                  {att.stuckProblems && (
                    <p className="text-sm text-warning-600 mt-1 line-clamp-1">
                      ⚠ 问题：{att.stuckProblems}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredAttendances.length === 0 && (
        <div className="card p-12 text-center">
          <Clock size={48} className="mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">暂无签到记录</p>
        </div>
      )}
    </div>
  );
}
