import React, { useState, useEffect } from 'react';
import type { Course } from '../types';

interface CourseFormProps {
  initialData?: Partial<Course>;
  onSubmit: (data: Partial<Course>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    classroom: '',
    capacity: 60,
    teacher: '',
    fixedStudents: 45,
    auditorQuota: 15,
    isKeyCourse: false,
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '10:30',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        classroom: initialData.classroom || '',
        capacity: initialData.capacity || 60,
        teacher: initialData.teacher || '',
        fixedStudents: initialData.fixedStudents || 45,
        auditorQuota: initialData.auditorQuota || 15,
        isKeyCourse: initialData.isKeyCourse || false,
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '08:30',
        endTime: initialData.endTime || '10:30',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            课程名称
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            placeholder="请输入课程名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            教室
          </label>
          <input
            type="text"
            name="classroom"
            value={formData.classroom}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            placeholder="如：教学楼A-301"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            任课老师
          </label>
          <input
            type="text"
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            placeholder="请输入老师姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            总容量
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleNumberChange}
            min="1"
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            固定学生数
          </label>
          <input
            type="number"
            name="fixedStudents"
            value={formData.fixedStudents}
            onChange={handleNumberChange}
            min="0"
            max={formData.capacity}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            旁听名额
          </label>
          <input
            type="number"
            name="auditorQuota"
            value={formData.auditorQuota}
            onChange={handleNumberChange}
            min="0"
            max={formData.capacity - formData.fixedStudents}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-slate-500 mt-1">
            最大可设: {formData.capacity - formData.fixedStudents}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            日期
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            开始时间
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            结束时间
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isKeyCourse"
            name="isKeyCourse"
            checked={formData.isKeyCourse}
            onChange={handleChange}
            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
          />
          <label
            htmlFor="isKeyCourse"
            className="text-sm font-medium text-slate-700"
          >
            设为重点课程（旁听申请需要老师审批）
          </label>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            课程描述
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
            placeholder="请输入课程描述（可选）"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : initialData ? '保存修改' : '创建课程'}
        </button>
      </div>
    </form>
  );
};
