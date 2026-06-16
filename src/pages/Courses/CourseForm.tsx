import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import type { Course, CourseTopic, Difficulty } from '@/types';
import { COURSE_TOPIC_MAP, DIFFICULTY_MAP } from '@/types';

const topics: CourseTopic[] = ['wechat', 'registration', 'payment', 'cleanup', 'photography', 'taxi', 'shortvideo', 'other'];
const difficulties: Difficulty[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

export default function CourseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCourseById, addCourse, updateCourse, fetchCourses } = useCourseStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    topic: 'wechat' as CourseTopic,
    difficulty: 'beginner' as Difficulty,
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    volunteer: '',
    capacity: 10,
  });

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (isEdit && id) {
      const course = getCourseById(id);
      if (course) {
        setFormData({
          ...course,
          startTime: course.startTime.slice(0, 16),
          endTime: course.endTime.slice(0, 16),
        });
      }
    }
  }, [id, isEdit, getCourseById]);

  const handleChange = (field: keyof Course, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('请填写课程标题和时间');
      return;
    }

    const courseData = {
      ...formData,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    } as Omit<Course, 'id' | 'createdAt' | 'status'>;

    if (isEdit && id) {
      updateCourse(id, courseData);
    } else {
      addCourse(courseData);
    }

    navigate('/courses');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/courses" className="btn-ghost -ml-2">
          <ArrowLeft size={20} />
          返回
        </Link>
        <h1 className="text-2xl font-bold text-neutral-800">
          {isEdit ? '编辑课程' : '新增课程'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="section-title">基本信息</h2>
          <div className="space-y-6">
            <div>
              <label className="label">课程标题 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input"
                placeholder="例如：微信基础使用入门"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">课程主题</label>
                <select
                  value={formData.topic || 'wechat'}
                  onChange={(e) => handleChange('topic', e.target.value as CourseTopic)}
                  className="input"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {COURSE_TOPIC_MAP[topic]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">难度等级</label>
                <select
                  value={formData.difficulty || 'beginner'}
                  onChange={(e) => handleChange('difficulty', e.target.value as Difficulty)}
                  className="input"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {DIFFICULTY_MAP[diff]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">课程描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input min-h-[100px] resize-y"
                placeholder="请简要描述课程内容..."
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">时间地点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">开始时间 <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={formData.startTime || ''}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">结束时间 <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={formData.endTime || ''}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">上课地点</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input"
                placeholder="例如：社区活动中心201室"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">人员安排</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">主讲志愿者</label>
              <input
                type="text"
                value={formData.volunteer || ''}
                onChange={(e) => handleChange('volunteer', e.target.value)}
                className="input"
                placeholder="请输入志愿者姓名"
              />
            </div>

            <div>
              <label className="label">招收名额</label>
              <input
                type="number"
                value={formData.capacity || 10}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                className="input"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/courses" className="btn-secondary btn-lg">
            取消
          </Link>
          <button type="submit" className="btn-primary btn-lg">
            <Save size={20} />
            {isEdit ? '保存修改' : '创建课程'}
          </button>
        </div>
      </form>
    </div>
  );
}
