import React, { useState } from 'react';
import type { CourseWithQuota } from '../types';

interface ApplicationFormProps {
  course: CourseWithQuota;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  course,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    studentName: '',
    className: '',
    reason: '',
    arrivalTime: course.startTime,
    needsOutlet: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      courseId: course.id,
    });
  };

  const remainingQuota = course.auditorQuota - course.usedQuota;
  const isWaitlist = remainingQuota <= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 bg-slate-50 rounded-xl">
        <h4 className="font-medium text-slate-800 mb-2">{course.name}</h4>
        <div className="text-sm text-slate-600 space-y-1">
          <p>📍 {course.classroom}</p>
          <p>👨‍🏫 {course.teacher}</p>
          <p>
            🕐 {course.startTime} - {course.endTime}</p>
        </div>
      </div>

      {isWaitlist ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
          旁听名额已满，提交后将进入候补队列。若有座位释放将按顺序通知。
          </p>
        </div>
      ) : course.isKeyCourse ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
          这是重点课程，申请需老师审批通过后才能确认座位。
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            学生姓名
          </label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            placeholder="请输入姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            所在班级
          </label>
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            placeholder="如：计算机2班"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            申请原因
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
            placeholder="请简要说明旁听原因"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            预计到场时间
          </label>
          <input
            type="time"
            name="arrivalTime"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="needsOutlet"
            name="needsOutlet"
            checked={formData.needsOutlet}
            onChange={handleChange}
            className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
          />
          <label
            htmlFor="needsOutlet"
            className="text-sm font-medium text-slate-700"
          >
            需要电源插座（使用笔记本电脑等设备）
          </label>
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
          {isLoading ? '提交中...' : isWaitlist ? '加入候补' : '提交申请'}
        </button>
      </div>
    </form>
  );
};
