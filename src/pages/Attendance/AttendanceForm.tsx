import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { COURSE_TOPIC_MAP } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

export default function AttendanceForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addAttendance, volunteers, fetchVolunteers } = useAttendanceStore();
  const { elders, fetchElders } = useElderStore();
  const { courses, getCourseById, fetchCourses } = useCourseStore();
  const { completeRegistrationByElderAndCourse, getRegistrationByElderAndCourse, fetchRegistrations } = useRegistrationStore();

  const preselectedElderId = searchParams.get('elderId') || '';
  const preselectedCourseId = searchParams.get('courseId') || '';
  const fromPage = searchParams.get('from') || '';

  const [formData, setFormData] = useState({
    elderId: preselectedElderId,
    courseId: preselectedCourseId,
    volunteerName: '',
    checkInTime: new Date().toISOString().slice(0, 16),
    learnedFunctions: '',
    stuckProblems: '',
    nextFollowUp: '',
    duration: 60,
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchVolunteers();
    fetchElders();
    fetchCourses();
    fetchRegistrations();
  }, [fetchVolunteers, fetchElders, fetchCourses, fetchRegistrations]);

  const selectedCourse = formData.courseId ? getCourseById(formData.courseId) : null;

  const availableCourses = courses.filter(c => c.status === 'upcoming' || c.status === 'ongoing');

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.elderId || !formData.courseId) {
      alert('请选择老人和课程');
      return;
    }

    const registration = getRegistrationByElderAndCourse(formData.elderId, formData.courseId);
    if (registration && registration.status === 'waitlist') {
      alert('该老人当前为候补状态，无法签到。请先将其转为已报名后再进行签到。');
      return;
    }
    if (registration && registration.status === 'completed') {
      alert('该老人已完成此课程，无需重复签到。');
      return;
    }

    addAttendance({
      elderId: formData.elderId,
      courseId: formData.courseId,
      volunteerName: formData.volunteerName || '未指定',
      checkInTime: new Date(formData.checkInTime).toISOString(),
      learnedFunctions: formData.learnedFunctions,
      stuckProblems: formData.stuckProblems,
      nextFollowUp: formData.nextFollowUp,
      duration: Number(formData.duration),
    });

    completeRegistrationByElderAndCourse(formData.elderId, formData.courseId);

    setSubmitted(true);
    setTimeout(() => {
      navigate(fromPage === 'registrations' ? '/registrations' : '/attendance');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">签到成功！</h2>
        <p className="text-neutral-500">学习记录已保存</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/attendance" className="btn-ghost -ml-2">
          <ArrowLeft size={20} />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">课堂签到</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="section-title">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="label">选择老人 <span className="text-red-500">*</span></label>
              <select
                value={formData.elderId}
                onChange={(e) => handleChange('elderId', e.target.value)}
                className="input"
              >
                <option value="">请选择老人</option>
                {elders.map((elder) => (
                  <option key={elder.id} value={elder.id}>
                    {elder.name} - {elder.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">选择课程 <span className="text-red-500">*</span></label>
              <select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="input"
              >
                <option value="">请选择课程</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({formatDate(course.startTime)})
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="font-medium text-neutral-800">{selectedCourse.title}</p>
                <div className="flex gap-4 mt-2 text-sm text-neutral-600">
                  <span className="tag bg-warm-100 text-warm-600">
                    {COURSE_TOPIC_MAP[selectedCourse.topic]}
                  </span>
                  <span>{formatTime(selectedCourse.startTime)} - {formatTime(selectedCourse.endTime)}</span>
                  <span>{selectedCourse.location}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-2">志愿者：{selectedCourse.volunteer}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">签到时间</label>
                <input
                  type="datetime-local"
                  value={formData.checkInTime}
                  onChange={(e) => handleChange('checkInTime', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">课时（分钟）</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                  className="input"
                  min="5"
                  step="5"
                />
              </div>
            </div>

            <div>
              <label className="label">志愿者</label>
              <select
                value={formData.volunteerName}
                onChange={(e) => handleChange('volunteerName', e.target.value)}
                className="input"
              >
                <option value="">请选择志愿者</option>
                {volunteers.map((vol) => (
                  <option key={vol.id} value={vol.name}>
                    {vol.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">学习记录</h2>
          <div className="space-y-4">
            <div>
              <label className="label">学会的功能</label>
              <textarea
                value={formData.learnedFunctions}
                onChange={(e) => handleChange('learnedFunctions', e.target.value)}
                className="input min-h-[80px] resize-y"
                placeholder="记录今天学会了哪些功能，用顿号或逗号分隔..."
              />
              <p className="text-xs text-neutral-400 mt-1">例如：发朋友圈、视频通话、扫码付款</p>
            </div>

            <div>
              <label className="label text-warning-600">仍卡住的问题</label>
              <textarea
                value={formData.stuckProblems}
                onChange={(e) => handleChange('stuckProblems', e.target.value)}
                className="input min-h-[80px] resize-y border-warning-200 focus:ring-warning-500"
                placeholder="记录还有哪些地方不太明白..."
              />
              <p className="text-xs text-neutral-400 mt-1">这些问题会被统计，用于改进教学</p>
            </div>

            <div>
              <label className="label text-primary-600">下次跟进计划</label>
              <textarea
                value={formData.nextFollowUp}
                onChange={(e) => handleChange('nextFollowUp', e.target.value)}
                className="input min-h-[80px] resize-y border-primary-200 focus:ring-primary-500"
                placeholder="下次需要重点辅导的内容..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/attendance" className="btn-secondary btn-lg">
            取消
          </Link>
          <button type="submit" className="btn-primary btn-lg">
            <Save size={20} />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
