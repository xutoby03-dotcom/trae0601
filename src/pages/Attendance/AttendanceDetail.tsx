import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { formatDateTime, formatDuration } from '@/utils/format';

export default function AttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAttendanceById, deleteAttendance, fetchAttendances } = useAttendanceStore();
  const { getElderById, fetchElders } = useElderStore();
  const { getCourseById, fetchCourses } = useCourseStore();

  useEffect(() => {
    fetchAttendances();
    fetchElders();
    fetchCourses();
  }, [fetchAttendances, fetchElders, fetchCourses]);

  const attendance = id ? getAttendanceById(id) : undefined;
  const elder = attendance ? getElderById(attendance.elderId) : undefined;
  const course = attendance ? getCourseById(attendance.courseId) : undefined;

  if (!attendance) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">签到记录不存在</p>
        <Link to="/attendance" className="btn-primary mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这条签到记录吗？')) {
      deleteAttendance(attendance.id);
      navigate('/attendance');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/attendance" className="btn-ghost -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800">签到详情</h1>
        </div>
        <button onClick={handleDelete} className="btn-ghost text-red-500 hover:bg-red-50">
          <Trash2 size={18} />
          删除
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          {elder && (
            <Link to={`/elders/${elder.id}`}>
              <img
                src={elder.avatar}
                alt={elder.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            </Link>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-neutral-800">
                {elder?.name || '未知老人'}
              </h2>
              <span className="tag bg-success-100 text-success-600">
                已签到
              </span>
            </div>
            <p className="text-neutral-500 mt-1">{elder?.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <BookOpen size={16} />
              <span className="text-sm">课程</span>
            </div>
            <p className="font-medium text-neutral-800 text-sm truncate">
              {course?.title || '未知'}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <User size={16} />
              <span className="text-sm">志愿者</span>
            </div>
            <p className="font-medium text-neutral-800 text-sm">
              {attendance.volunteerName}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">签到时间</span>
            </div>
            <p className="font-medium text-neutral-800 text-sm">
              {formatDateTime(attendance.checkInTime)}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">课时</span>
            </div>
            <p className="font-medium text-neutral-800 text-sm">
              {formatDuration(attendance.duration)}
            </p>
          </div>
        </div>
      </div>

      {attendance.learnedFunctions && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-success-500" />
            <h3 className="font-semibold text-lg text-neutral-800">学会的功能</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {attendance.learnedFunctions.split(/[，,、。\n]+/).filter(Boolean).map((item, index) => (
              <span
                key={index}
                className="tag bg-success-50 text-success-600 border border-success-200"
              >
                {item.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {attendance.stuckProblems && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-warning-500" />
            <h3 className="font-semibold text-lg text-neutral-800">仍卡住的问题</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {attendance.stuckProblems.split(/[，,、。\n]+/).filter(Boolean).map((item, index) => (
              <span
                key={index}
                className="tag bg-warning-50 text-warning-600 border border-warning-200"
              >
                {item.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {attendance.nextFollowUp && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight size={20} className="text-primary-500" />
            <h3 className="font-semibold text-lg text-neutral-800">下次跟进计划</h3>
          </div>
          <p className="text-neutral-700 bg-primary-50 p-4 rounded-xl">
            {attendance.nextFollowUp}
          </p>
        </div>
      )}

      {!attendance.learnedFunctions && !attendance.stuckProblems && !attendance.nextFollowUp && (
        <div className="card p-12 text-center">
          <p className="text-neutral-400">暂无学习记录详情</p>
        </div>
      )}
    </div>
  );
}
