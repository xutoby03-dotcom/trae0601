import { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import CourseForm from '@/components/CourseForm';
import type { Course } from '@/types';

export default function Courses() {
  const { courses, assignments, addCourse, updateCourse, deleteCourse } = useAssignmentStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  const getAssignmentCount = (courseId: string) =>
    assignments.filter((a) => a.courseId === courseId && a.status !== 'completed').length;

  const handleAdd = (data: Omit<Course, 'id'>) => {
    addCourse(data);
  };

  const handleEdit = (data: Omit<Course, 'id'>) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, data);
      setEditingCourse(undefined);
    }
  };

  const handleDelete = (id: string) => {
    const hasAssignments = assignments.some((a) => a.courseId === id);
    if (hasAssignments) {
      if (!window.confirm('该课程下还有作业，删除课程将同时删除相关作业，确定吗？')) return;
    }
    deleteCourse(id);
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-xl text-slate-100 tracking-wider">COURSES</h1>
          <p className="text-xs text-slate-500 mt-1">{courses.length} 门课程</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-radar-cyan/20 text-radar-cyan hover:bg-radar-cyan/30 transition-colors glow-cyan"
        >
          <Plus className="w-4 h-4" />
          添加课程
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">还没有添加课程</p>
          <p className="text-xs text-slate-500">点击上方按钮添加你的第一门课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass rounded-xl overflow-hidden animate-fade-in hover:scale-[1.01] transition-transform"
            >
              <div
                className="h-1.5"
                style={{ backgroundColor: course.color }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-orbitron text-sm font-bold shrink-0"
                      style={{ backgroundColor: course.color + '30', color: course.color }}
                    >
                      {course.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {course.teacher || '未设置老师'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowForm(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-radar-cyan hover:bg-radar-cyan/10 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-radar-red hover:bg-radar-red/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  {course.schedule && (
                    <span>{course.schedule}</span>
                  )}
                  <span>{course.credits} 学分</span>
                  <span>{getAssignmentCount(course.id)} 项作业</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={editingCourse ? handleEdit : handleAdd}
          onClose={() => {
            setShowForm(false);
            setEditingCourse(undefined);
          }}
        />
      )}
    </div>
  );
}
