import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Priority, DEPARTMENTS, PRIORITY_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface AddTodoFormData {
  title: string;
  assignee: string;
  department: string;
  dueDate: string;
  priority: Priority;
  relatedTopic: string;
  deliverable: string;
}

interface AddTodoModalProps {
  open: boolean;
  meetingTitle?: string;
  onClose: () => void;
  onSubmit: (data: AddTodoFormData) => void;
}

const defaultFormData: AddTodoFormData = {
  title: '',
  assignee: '',
  department: DEPARTMENTS[0],
  dueDate: '',
  priority: 'medium',
  relatedTopic: '',
  deliverable: '',
};

export default function AddTodoModal({ open, meetingTitle, onClose, onSubmit }: AddTodoModalProps) {
  const [formData, setFormData] = useState<AddTodoFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AddTodoFormData, string>>>({});

  useEffect(() => {
    if (open) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddTodoFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入待办标题';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '标题至少2个字符';
    }

    if (!formData.assignee.trim()) {
      newErrors.assignee = '请输入负责人姓名';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = '请选择截止日期';
    }

    if (!formData.deliverable.trim()) {
      newErrors.deliverable = '请描述交付物内容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      assignee: formData.assignee.trim(),
      relatedTopic: formData.relatedTopic.trim(),
      deliverable: formData.deliverable.trim(),
    });
  };

  const handleInputChange = (field: keyof AddTodoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
            <Plus className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">拆解待办</h2>
            {meetingTitle && (
              <p className="text-sm text-gray-500">从「{meetingTitle}」会议中拆解</p>
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button variant="secondary" onClick={handleSubmit} type="submit">
            <Plus className="w-4 h-4 mr-1.5" />
            添加待办
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            待办标题 <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="例如：完成登录模块接口开发"
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/20',
              errors.title
                ? 'border-danger-300 focus:border-danger-500'
                : 'border-gray-200 focus:border-accent-500'
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-danger-500">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              负责人 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              placeholder="请输入负责人姓名"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/20',
                errors.assignee
                  ? 'border-danger-300 focus:border-danger-500'
                  : 'border-gray-200 focus:border-accent-500'
              )}
            />
            {errors.assignee && (
              <p className="mt-1 text-sm text-danger-500">{errors.assignee}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              所属部门
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-colors bg-white"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              截止日期 <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/20',
                errors.dueDate
                  ? 'border-danger-300 focus:border-danger-500'
                  : 'border-gray-200 focus:border-accent-500'
              )}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-danger-500">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              优先级
            </label>
            <div className="flex gap-2">
              {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleInputChange('priority', p)}
                  className={cn(
                    'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border',
                    formData.priority === p
                      ? p === 'critical'
                        ? 'bg-danger-500 text-white border-danger-500'
                        : p === 'high'
                        ? 'bg-accent-500 text-white border-accent-500'
                        : p === 'medium'
                        ? 'bg-info-500 text-white border-info-500'
                        : 'bg-gray-400 text-white border-gray-400'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            关联议题
          </label>
          <input
            type="text"
            value={formData.relatedTopic}
            onChange={(e) => handleInputChange('relatedTopic', e.target.value)}
            placeholder="该待办关联的会议议题，例如：用户权限改造方案讨论"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            交付物描述 <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={formData.deliverable}
            onChange={(e) => handleInputChange('deliverable', e.target.value)}
            placeholder="请详细描述需要交付的成果，例如：接口文档、设计稿、可运行代码等"
            rows={3}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-none',
              errors.deliverable
                ? 'border-danger-300 focus:border-danger-500'
                : 'border-gray-200 focus:border-accent-500'
            )}
          />
          {errors.deliverable && (
            <p className="mt-1 text-sm text-danger-500">{errors.deliverable}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            清晰的交付物描述有助于后续验收和追溯
          </p>
        </div>
      </form>
    </Modal>
  );
}
