import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useElderStore } from '@/store/elderStore';
import { COURSE_TOPIC_MAP, DIFFICULTY_MAP, COURSE_STATUS_MAP } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById, deleteCourse } = useCourseStore();
  const { getRegistrationsByCourseId, getConfirmedCount, getWaitlistCount, cancelRegistration } = useRegistrationStore();
  const { getElderById } = useElderStore();

  const course = id ? getCourseById(id) : undefined;
  const registrations = id ? getRegistrationsByCourseId(id) : [];

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">课程不存在</p>
        <Link to="/courses" className="btn-primary mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed');
  const waitlistRegistrations = registrations
    .filter(r => r.status === 'waitlist')
    .sort((a, b) => a.waitlistPosition - b.waitlistPosition);
  const cancelledRegistrations = registrations.filter(r => r.status === 'cancelled');

  const confirmedCount = getConfirmedCount(course.id);
  const waitlistCount = getWaitlistCount(course.id);
  const isFull = confirmedCount >= course.capacity;

  const handleDelete = () => {
    if (confirm('确定要删除这个课程吗？相关报名记录也会受到影响。')) {
      deleteCourse(course.id);
      navigate('/courses');
    }
  };

  const handleCancelRegistration = (regId: string) => {
    if (confirm('确定要取消这个报名吗？')) {
      cancelRegistration(regId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/courses" className="btn-ghost -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800">课程详情</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/courses/${course.id}/edit`} className="btn-secondary">
            <Edit size={18} />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-ghost text-red-500 hover:bg-red-50">
            <Trash2 size={18} />
            删除
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`tag ${
            course.status === 'upcoming' ? 'bg-primary-100 text-primary-600' :
            course.status === 'ongoing' ? 'bg-success-100 text-success-600' :
            course.status === 'finished' ? 'bg-neutral-100 text-neutral-600' :
            'bg-red-100 text-red-600'
          }`}>
            {COURSE_STATUS_MAP[course.status]}
          </span>
          <span className="tag bg-warm-100 text-warm-600">
            {COURSE_TOPIC_MAP[course.topic]}
          </span>
          <span className="tag bg-neutral-100 text-neutral-600">
            {DIFFICULTY_MAP[course.difficulty]}
          </span>
          {isFull && (
            <span className="tag bg-warning-100 text-warning-600">
              <AlertCircle size={14} className="mr-1" />
              名额已满
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{course.title}</h2>
        <p className="text-neutral-600 mb-6">{course.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">日期</span>
            </div>
            <p className="font-semibold text-neutral-800">{formatDate(course.startTime)}</p>
          </div>
          <div className="p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Clock size={16} />
              <span className="text-sm">时间</span>
            </div>
            <p className="font-semibold text-neutral-800">
              {formatTime(course.startTime)} - {formatTime(course.endTime)}
            </p>
          </div>
          <div className="p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <MapPin size={16} />
              <span className="text-sm">地点</span>
            </div>
            <p className="font-semibold text-neutral-800">{course.location}</p>
          </div>
          <div className="p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <User size={16} />
              <span className="text-sm">主讲</span>
            </div>
            <p className="font-semibold text-neutral-800">{course.volunteer}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 flex items-center gap-2">
                <Users size={18} />
                报名进度
              </span>
              <span className="font-semibold text-neutral-800">
                {confirmedCount}/{course.capacity}人
                {waitlistCount > 0 && <span className="text-warning-600 ml-2">（候补{waitlistCount}人）</span>}
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-warning-500' : 'bg-success-500'
                }`}
                style={{ width: `${Math.min((confirmedCount / course.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link
            to={`/attendance/new?courseId=${course.id}`}
            className="btn-primary btn-lg flex-shrink-0"
          >
            <UserCheck size={20} />
            课堂签到
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-lg text-neutral-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-success-500" />
            已报名名单 ({confirmedCount}人)
          </h3>
          {confirmedRegistrations.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">暂无报名</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {confirmedRegistrations.map((reg) => {
                const elder = getElderById(reg.elderId);
                return (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 bg-success-50 rounded-xl"
                  >
                    <Link
                      to={`/elders/${reg.elderId}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      {elder && (
                        <>
                          <img
                            src={elder.avatar}
                            alt={elder.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-800 truncate">{elder.name}</p>
                            <p className="text-sm text-neutral-500 truncate">{elder.phone}</p>
                          </div>
                        </>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 ml-2">
                      {reg.needOneOnOne && (
                        <span className="tag bg-warning-100 text-warning-600 text-xs">一对一</span>
                      )}
                      {reg.withFamily && (
                        <span className="tag bg-primary-100 text-primary-600 text-xs">带家属</span>
                      )}
                      <button
                        onClick={() => handleCancelRegistration(reg.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-lg text-neutral-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-warning-500" />
            候补名单 ({waitlistCount}人)
          </h3>
          {waitlistRegistrations.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">暂无候补</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {waitlistRegistrations.map((reg) => {
                const elder = getElderById(reg.elderId);
                return (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 bg-warning-50 rounded-xl"
                  >
                    <Link
                      to={`/elders/${reg.elderId}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-warning-200 flex items-center justify-center text-warning-700 font-bold">
                        #{reg.waitlistPosition}
                      </div>
                      {elder && (
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-800 truncate">{elder.name}</p>
                          <p className="text-sm text-neutral-500 truncate">{elder.phone}</p>
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={() => handleCancelRegistration(reg.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      取消
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {cancelledRegistrations.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-lg text-neutral-800 mb-4">
            已取消报名 ({cancelledRegistrations.length}人)
          </h3>
          <div className="space-y-2">
            {cancelledRegistrations.map((reg) => {
              const elder = getElderById(reg.elderId);
              return (
                <div
                  key={reg.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl opacity-60"
                >
                  {elder && (
                    <>
                      <img
                        src={elder.avatar}
                        alt={elder.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-neutral-600">{elder.name}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
