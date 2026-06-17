import { MapPin, Clock, Package, UserPlus, Check, Phone } from 'lucide-react';
import type { Task } from '@/types';
import { useWeddingStore } from '@/store/weddingStore';
import MemberAvatar from './MemberAvatar';
import StatusBadge from './StatusBadge';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const getMemberById = useWeddingStore(state => state.getMemberById);
  const confirmTask = useWeddingStore(state => state.confirmTask);
  const updateTaskStatus = useWeddingStore(state => state.updateTaskStatus);

  const responsible = getMemberById(task.responsibleId);
  const backup = getMemberById(task.backupId);

  const handleConfirm = () => {
    confirmTask(task.id);
  };

  const handleMarkLate = () => {
    updateTaskStatus(task.id, 'late');
  };

  const handleMarkComplete = () => {
    updateTaskStatus(task.id, 'completed');
  };

  return (
    <div
      className={`card p-5 animate-fade-in-up stagger-${Math.min(index % 8 + 1, 8)} ${
        task.status === 'late' ? 'border-wine/30 bg-wine/5' : ''
      }`}
      style={{ opacity: 0 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-display text-lg font-semibold text-gray-800">
              {task.name}
            </h4>
            <StatusBadge status={task.status} size="sm" />
          </div>
          <p className="text-sm text-gray-600 mb-4">{task.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-rose-gold flex-shrink-0" />
              <span className="truncate">{task.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-champagne-gold flex-shrink-0" />
              <span>提醒：{task.remindTime}</span>
            </div>
          </div>

          {task.itemsToBring.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Package className="w-4 h-4 text-rose-gold" />
                <span>需带物品：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.itemsToBring.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-champagne-pale/50 text-champagne-gold rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-rose-pale/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">负责人：</span>
              {responsible && (
                <div className="flex items-center gap-1.5">
                  <MemberAvatar member={responsible} size="sm" />
                  <span className="text-sm font-medium">{responsible.name}</span>
                  <a
                    href={`tel:${responsible.phone}`}
                    className="text-rose-gold hover:text-rose-gold/80 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">备用：{backup?.name || '无'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {task.status === 'pending' && (
              <>
                <button
                  onClick={handleConfirm}
                  className="btn-gold text-sm py-2 px-4 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  确认任务
                </button>
                <button
                  onClick={handleMarkLate}
                  className="px-4 py-2 text-sm text-wine border border-wine/30 rounded-lg hover:bg-wine/5 transition-colors"
                >
                  标记迟到
                </button>
              </>
            )}
            {task.status === 'confirmed' && (
              <button
                onClick={handleMarkComplete}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                完成任务
              </button>
            )}
            {task.status === 'late' && (
              <button
                onClick={handleMarkComplete}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                完成任务
              </button>
            )}
            {task.status === 'completed' && task.confirmedAt && (
              <span className="text-xs text-forest">
                完成于 {new Date(task.confirmedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
