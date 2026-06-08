import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Assignment, Step } from '@/types';
import { useAssignmentStore } from '@/store/useAssignmentStore';

function generateStepId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const DEFAULT_STEPS: Omit<Step, 'id'>[] = [
  { title: '查资料', completed: false, order: 0 },
  { title: '写初稿', completed: false, order: 1 },
  { title: '修改完善', completed: false, order: 2 },
  { title: '提交', completed: false, order: 3 },
];

const SUBMIT_METHODS = ['在线提交', '纸质版', '邮件', '课堂演示', '其他'];

interface AssignmentFormProps {
  assignment?: Assignment;
  onClose: () => void;
}

export default function AssignmentForm({ assignment, onClose }: AssignmentFormProps) {
  const { courses, addAssignment, updateAssignment } = useAssignmentStore();
  const [title, setTitle] = useState(assignment?.title || '');
  const [courseId, setCourseId] = useState(assignment?.courseId || (courses[0]?.id ?? ''));
  const [deadline, setDeadline] = useState(
    assignment?.deadline
      ? new Date(assignment.deadline).toISOString().slice(0, 16)
      : ''
  );
  const [estimatedHours, setEstimatedHours] = useState(assignment?.estimatedHours || 2);
  const [submitMethod, setSubmitMethod] = useState(assignment?.submitMethod || '');
  const [attachmentUrl, setAttachmentUrl] = useState(assignment?.attachmentUrl || '');
  const [manualProgress, setManualProgress] = useState(assignment?.progress ?? 0);
  const [steps, setSteps] = useState<Omit<Step, 'id'>[]>(
    assignment?.steps
      ? assignment.steps.map(({ id, ...rest }) => rest)
      : []
  );
  const [newStepTitle, setNewStepTitle] = useState('');

  const addStep = () => {
    if (!newStepTitle.trim()) return;
    setSteps([...steps, { title: newStepTitle.trim(), completed: false, order: steps.length }]);
    setNewStepTitle('');
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
  };

  const loadDefaultSteps = () => {
    setSteps(DEFAULT_STEPS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId || !deadline) return;

    const stepsData = steps.map((s, i) => ({ ...s, id: generateStepId(), order: i }));
    const hasSteps = stepsData.length > 0;
    const progress = hasSteps
      ? Math.round((stepsData.filter((s) => s.completed).length / stepsData.length) * 100)
      : manualProgress;

    const data = {
      title: title.trim(),
      courseId,
      deadline: new Date(deadline).toISOString(),
      estimatedHours,
      submitMethod,
      attachmentUrl,
      progress,
      status: 'in_progress' as const,
      steps: stepsData,
    };

    if (assignment) {
      updateAssignment(assignment.id, data);
    } else {
      addAssignment(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-lg text-slate-100">
            {assignment ? '编辑作业' : '添加作业'}
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
            <label className="block text-xs text-slate-400 mb-1.5">作业标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：第三章课后习题"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">所属课程 *</label>
            {courses.length === 0 ? (
              <p className="text-xs text-radar-amber">请先添加课程</p>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">截止时间 *</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">预计耗时（小时）</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                min={0.5}
                step={0.5}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">提交方式</label>
              <select
                value={submitMethod}
                onChange={(e) => setSubmitMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
              >
                <option value="">请选择</option>
                {SUBMIT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">附件链接</label>
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 focus:ring-1 focus:ring-radar-cyan/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">完成进度</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={steps.length > 0 ? Math.round((steps.filter((s) => s.completed).length / steps.length) * 100) : manualProgress}
                onChange={(e) => steps.length === 0 && setManualProgress(Number(e.target.value))}
                disabled={steps.length > 0}
                className="flex-1 h-2 rounded-full appearance-none bg-slate-700/50 accent-radar-cyan disabled:accent-slate-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-radar-cyan w-10 text-right">
                {steps.length > 0
                  ? `${Math.round((steps.filter((s) => s.completed).length / steps.length) * 100)}%`
                  : `${manualProgress}%`}
              </span>
            </div>
            {steps.length > 0 && (
              <p className="text-[10px] text-slate-500 mt-1">有步骤时进度按勾选自动计算</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-slate-400">步骤拆分</label>
              <button
                type="button"
                onClick={loadDefaultSteps}
                className="text-[11px] text-radar-cyan/70 hover:text-radar-cyan transition-colors"
              >
                使用默认模板
              </button>
            </div>

            {steps.length > 0 && (
              <div className="space-y-2 mb-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 w-4">{i + 1}.</span>
                    <span className="flex-1 text-xs text-slate-300">{step.title}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-1 text-slate-500 hover:text-radar-red transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                placeholder="添加步骤..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-radar-cyan/50 transition-colors"
              />
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-2 rounded-lg bg-radar-cyan/10 text-radar-cyan hover:bg-radar-cyan/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
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
              disabled={!title.trim() || !courseId || !deadline || courses.length === 0}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-radar-cyan/20 text-radar-cyan hover:bg-radar-cyan/30 transition-colors glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignment ? '保存修改' : '添加作业'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
