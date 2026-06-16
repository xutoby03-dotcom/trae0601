import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useRegistrationStore } from '@/store/registrationStore';
import { useElderStore } from '@/store/elderStore';
import { useCourseStore } from '@/store/courseStore';
import { COURSE_TOPIC_MAP, DIFFICULTY_MAP } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addRegistration, getConfirmedCount } = useRegistrationStore();
  const { elders } = useElderStore();
  const { courses, getCourseById } = useCourseStore();

  const preselectedElderId = searchParams.get('elderId') || '';
  const preselectedCourseId = searchParams.get('courseId') || '';

  const [formData, setFormData] = useState({
    elderId: preselectedElderId,
    courseId: preselectedCourseId,
    needOneOnOne: false,
    withFamily: false,
    notes: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedCourse = formData.courseId ? getCourseById(formData.courseId) : null;
  const confirmedCount = formData.courseId ? getConfirmedCount(formData.courseId) : 0;
  const isFull = selectedCourse ? confirmedCount >= selectedCourse.capacity : false;

  const availableCourses = courses.filter(c => c.status === 'upcoming' || c.status === 'ongoing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.elderId || !formData.courseId) {
      setMessage({ type: 'error', text: '请选择老人和课程' });
      return;
    }

    const result = addRegistration({
      elderId: formData.elderId,
      courseId: formData.courseId,
      needOneOnOne: formData.needOneOnOne,
      withFamily: formData.withFamily,
      notes: formData.notes,
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        navigate('/registrations');
      }, 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/registrations" className="btn-ghost -ml-2">
          <ArrowLeft size={20} />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">新增报名</h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="section-title">选择老人</h2>
          <div className="space-y-4">
            <div>
              <label className="label">老人档案 <span className="text-red-500">*</span></label>
              <select
                value={formData.elderId}
                onChange={(e) => setFormData(prev => ({ ...prev, elderId: e.target.value }))}
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

            <div className="flex justify-end">
              <Link to="/elders/new" className="text-primary-500 text-sm font-medium hover:text-primary-600 flex items-center gap-1">
                <UserPlus size={16} />
                新增老人档案
              </Link>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">选择课程</h2>
          
          {availableCourses.length === 0 ? (
            <p className="text-neutral-500">暂无开放报名的课程</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {availableCourses.map((course) => {
                const courseConfirmed = getConfirmedCount(course.id);
                const courseIsFull = courseConfirmed >= course.capacity;
                const isSelected = formData.courseId === course.id;

                return (
                  <label
                    key={course.id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="course"
                      value={course.id}
                      checked={isSelected}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                      className="hidden"
                    />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-800">{course.title}</h3>
                          {courseIsFull && (
                            <span className="tag bg-warning-100 text-warning-600 text-xs">已满</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="tag bg-warm-100 text-warm-600 text-xs">
                            {COURSE_TOPIC_MAP[course.topic]}
                          </span>
                          <span className="tag bg-neutral-100 text-neutral-600 text-xs">
                            {DIFFICULTY_MAP[course.difficulty]}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {formatDate(course.startTime)} · {formatTime(course.startTime)}-{formatTime(course.endTime)} · {course.location}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-neutral-800">
                          {courseConfirmed}/{course.capacity}
                        </p>
                        <p className="text-xs text-neutral-500">已报名</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {selectedCourse && isFull && (
            <div className="mt-4 p-3 bg-warning-50 rounded-xl text-sm text-warning-600">
              ⚠️ 该课程名额已满，报名后将进入候补队列。如有人取消报名，将按候补顺序自动递补。
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title">特殊需求</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.needOneOnOne}
                onChange={(e) => setFormData(prev => ({ ...prev, needOneOnOne: e.target.checked }))}
                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-neutral-800">需要一对一辅导</p>
                <p className="text-sm text-neutral-500">志愿者需单独指导</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.withFamily}
                onChange={(e) => setFormData(prev => ({ ...prev, withFamily: e.target.checked }))}
                className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-neutral-800">有家属陪同</p>
                <p className="text-sm text-neutral-500">家属会一起来上课</p>
              </div>
            </label>

            <div>
              <label className="label">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input min-h-[80px] resize-y"
                placeholder="其他需要说明的情况..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/registrations" className="btn-secondary btn-lg">
            取消
          </Link>
          <button type="submit" className="btn-primary btn-lg">
            <Save size={20} />
            确认报名
          </button>
        </div>
      </form>
    </div>
  );
}
