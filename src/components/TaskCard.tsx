import { RefreshCw, Clock, CheckCircle2, AlertTriangle, Package, User } from 'lucide-react';
import type { Task, Bathroom, ProcurementSpec } from '../types';
import { formatDate, getDaysUntil, isOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  bathroom: Bathroom | undefined;
  spec: ProcurementSpec | undefined;
  onStatusChange: (id: string, status: Task['status']) => void;
}

const statusConfig = {
  pending: {
    label: '待处理',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  in_progress: {
    label: '进行中',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  completed: {
    label: '已完成',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

export const TaskCard = ({ task, bathroom, spec, onStatusChange }: TaskCardProps) => {
  const config = statusConfig[task.status];
  const daysLeft = getDaysUntil(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  return (
    <div className={`rounded-2xl border-2 ${config.bg} ${config.border} p-5 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${task.type === 'replace' ? 'bg-orange-100' : 'bg-blue-100'} flex items-center justify-center`}>
            {task.type === 'replace' ? (
              <RefreshCw className="text-orange-500" size={24} />
            ) : (
              <User className="text-blue-500" size={24} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {task.type === 'replace' ? '更换防滑垫' : '清洁维护'}
            </h3>
            <p className="text-sm text-gray-500">{bathroom?.name || '未知浴室'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color} border ${config.border}`}>
          {config.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle size={14} className={overdue ? 'text-red-500' : 'text-amber-500'} />
          <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
            {overdue ? `已逾期 ${Math.abs(daysLeft)} 天` : `还剩 ${daysLeft} 天`}
          </span>
          <span className="text-gray-400">（截止: {formatDate(task.dueDate)}）</span>
        </div>
        <p className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
          <span className="font-medium text-gray-700">原因：</span>
          {task.reason}
        </p>
      </div>

      {spec && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-orange-500" />
            <span className="font-semibold text-gray-800">采购规格</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">尺寸</div>
            <div className="text-gray-800 font-medium">{spec.size}</div>
            <div className="text-gray-500">材质</div>
            <div className="text-gray-800 font-medium">{spec.material}</div>
            <div className="text-gray-500">吸盘数量</div>
            <div className="text-gray-800 font-medium">{spec.suctionCups} 个</div>
            <div className="text-gray-500">厚度</div>
            <div className="text-gray-800 font-medium">{spec.thickness}</div>
            <div className="text-gray-500">颜色</div>
            <div className="text-gray-800 font-medium">{spec.color}</div>
            <div className="text-gray-500">数量</div>
            <div className="text-gray-800 font-medium">{spec.quantity} 件</div>
          </div>
          {spec.notes && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-gray-500 text-sm">备注</div>
              <div className="text-gray-700 text-sm">{spec.notes}</div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Clock size={14} />
        <span>创建于 {formatDate(task.createdDate)}</span>
      </div>

      {task.status !== 'completed' && (
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <button
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              开始处理
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(task.id, 'completed')}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              标记完成
            </button>
          )}
        </div>
      )}
    </div>
  );
};
