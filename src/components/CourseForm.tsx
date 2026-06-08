import { useState } from 'react';
import { X } from 'lucide-react';
import type { Course } from '@/types';

const PRESET_COLORS = [
  '#00f5d4', '#f72585', '#fca311', '#7c3aed',
  '#06b6d4', '#10b981', '#f97316', '#ec4899',
  '#8b5cf6', '#14b8a6', '#e11d48', '#3b82f6',
];

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: Omit<Course, 'id'>) => void;
  onClose: () => void;
}

export default function CourseForm({ course, onSubmit, onClose }: CourseFormProps) {
  const [name, setName] = useState(course?.name || '');
  const [teacher, setTeacher] = useState(course?.teacher || '');
  const [schedule, setSchedule] = useState(course?.schedule || '');
  const [credits, setCredits] = useState(course?.credits || 3);
  const [color, setColor] = useState(course?.color || PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), teacher, schedule, credits, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-lg text-slate-100">
            {course ? '编辑课程' : '添加课程'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">课程名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：高等数学"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">授课老师</label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="如：张教授"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">上课时间</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="如：周一3-4节"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">学分</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              min={0.5}
              max={10}
              step={0.5}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">主题色</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-radar-bg scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-radar-cyan/20 text-radar-cyan hover:bg-radar-cyan/30 transition-colors glow-cyan"
            >
              {course ? '保存修改' : '添加课程'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
