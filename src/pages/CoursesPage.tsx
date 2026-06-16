import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CourseCard } from '../components/CourseCard';
import { Modal } from '../components/Modal';
import { CourseForm } from '../components/CourseForm';
import type { CourseWithQuota } from '../types';

export const CoursesPage: React.FC = () => {
  const {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    setError,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKey, setFilterKey] = useState<'all' | 'key' | 'available' | 'full'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithQuota | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.classroom.toLowerCase().includes(searchTerm.toLowerCase());

    const remainingQuota = course.auditorQuota - course.usedQuota;

    switch (filterKey) {
      case 'key':
        return matchesSearch && course.isKeyCourse;
      case 'available':
        return matchesSearch && remainingQuota > 0;
      case 'full':
        return matchesSearch && remainingQuota <= 0;
      default:
        return matchesSearch;
    }
  });

  const handleAdd = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course: CourseWithQuota) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, data);
      } else {
        await addCourse(data);
      }
      setShowModal(false);
      setEditingCourse(null);
    } catch (e) {
      console.error('Submit failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">课程档案</h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {courses.length} 门课程，管理课程信息和座位安排
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          新增课程
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索课程名称、老师、教室..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value as any)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">全部课程</option>
            <option value="key">重点课程</option>
            <option value="available">有名额</option>
            <option value="full">已满员</option>
          </select>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 bg-white rounded-xl border border-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <p className="text-slate-500">暂无匹配的课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showActions
              onEdit={() => handleEdit(course)}
              onDelete={() => setShowDeleteConfirm(course.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? '编辑课程' : '新增课程'}
        size="lg"
      >
        <CourseForm
          initialData={editingCourse || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
          isLoading={loading}
        />
      </Modal>

      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="确认删除"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-slate-600">确定要删除这门课程吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
