import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Package, Save, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_SOURCE_LABELS,
  SUPPLY_TYPE_LABELS,
} from '@/utils/constants';
import { formatDateTime } from '@/utils/helpers';
import StatusBadge from '@/components/StatusBadge';
import type { TaskPriority, TaskStatus } from '@/types';

const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const statuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, rooms, updateTask } = useAppStore();

  const task = tasks.find((t) => t.id === id);
  const room = task ? rooms.find((r) => r.id === task.roomId) : null;

  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [localPriority, setLocalPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task?.status || 'pending');

  if (!task) {
    return (
      <div className="card p-16 text-center">
        <h3 className="text-lg font-medium text-slate-600 mb-2">任务不存在</h3>
        <button onClick={() => navigate('/tasks')} className="btn btn-primary mt-4">
          返回任务列表
        </button>
      </div>
    );
  }

  const handleSave = () => {
    updateTask(id!, {
      assignee,
      priority: localPriority,
      status: localStatus,
    });
    navigate('/tasks');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-800">补给任务详情</h2>
          <p className="text-sm text-slate-500">任务编号：{task.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${TASK_PRIORITY_COLORS[task.priority]}`}>
            {TASK_PRIORITY_LABELS[task.priority]}优先级
          </span>
          <span className={`badge ${TASK_STATUS_COLORS[task.status]}`}>
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
      </div>

      <div className="card p-6">
        <div className="p-5 bg-gradient-to-r from-primary-50 to-slate-50 rounded-xl mb-6">
          <h3 className="font-semibold text-slate-800 text-lg mb-2">{task.description}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">会议室</p>
              <p className="font-medium text-slate-700">{room?.name || '未知'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">用品类型</p>
              <p className="font-medium text-slate-700">{SUPPLY_TYPE_LABELS[task.supplyType]}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">任务来源</p>
              <p className="font-medium text-slate-700">{TASK_SOURCE_LABELS[task.source]}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">所在楼层</p>
              <p className="font-medium text-slate-700">{room?.floor || '-'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label">任务优先级</label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setLocalPriority(p)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    localPriority === p
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`badge ${TASK_PRIORITY_COLORS[p]}`}>
                    {TASK_PRIORITY_LABELS[p]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">任务状态</label>
            <div className="grid grid-cols-3 gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setLocalStatus(s)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    localStatus === s
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <StatusBadge type="status" value={s} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              <User className="w-4 h-4 inline mr-1.5" />
              负责人
            </label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="输入负责人姓名"
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            <span>创建时间：{formatDateTime(task.createdAt)}</span>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>完成时间：{formatDateTime(task.completedAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => navigate('/tasks')} className="btn btn-secondary">
          取消
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          <Save className="w-4 h-4" />
          保存变更
        </button>
      </div>
    </div>
  );
}
