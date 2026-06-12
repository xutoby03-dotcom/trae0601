import { X, Clock, MapPin, User, Users, Package, Image, History, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { formatTime, formatDate } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskDetailProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetail({ taskId, isOpen, onClose }: TaskDetailProps) {
  const { tasks, people, currentUserId, claimTask, confirmTask, completeTask, toggleItem, deleteTask } = useTaskStore();
  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'photos' | 'history'>('info');

  const task = tasks.find((t) => t.id === taskId);
  const assignee = people.find((p) => p.id === task?.assigneeId);
  const backup = people.find((p) => p.id === task?.backupId);
  const currentUser = people.find((p) => p.id === currentUserId);

  if (!task) return null;

  const canClaim = task.status === 'pending';
  const canConfirm = task.status === 'claimed' && task.assigneeId === currentUserId;
  const canComplete = task.status === 'confirmed' || task.status === 'in_progress';
  const isAssignedToMe = task.assigneeId === currentUserId;

  const handleClaim = () => {
    claimTask(taskId, currentUserId);
  };

  const handleConfirm = () => {
    confirmTask(taskId);
  };

  const handleComplete = () => {
    completeTask(taskId);
  };

  const handleToggleItem = (itemId: string) => {
    toggleItem(taskId, itemId);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(taskId);
      onClose();
    }
  };

  const tabs = [
    { id: 'info', label: '详情', icon: User },
    { id: 'items', label: `物品(${task.itemList.length})`, icon: Package },
    { id: 'photos', label: `照片(${task.photos.length})`, icon: Image },
    { id: 'history', label: `变更(${task.changeLogs.length})`, icon: History },
  ] as const;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-ivory z-50 shadow-2xl transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-rose-gold/10 bg-white/50">
            <div className="flex items-center gap-2">
              <Badge variant="priority" value={task.priority} />
              <Badge variant="status" value={task.status} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-warm-100 transition-colors"
            >
              <X className="w-5 h-5 text-warm-500" />
            </button>
          </div>

          <div className="p-5 border-b border-rose-gold/10 bg-white/30">
            <h2 className="text-xl font-semibold text-warm-900 mb-2 font-display">
              {task.title}
            </h2>
            {task.description && (
              <p className="text-sm text-warm-600">{task.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="category" value={task.category} />
            </div>
          </div>

          <div className="flex border-b border-rose-gold/10 bg-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
                    activeTab === tab.id
                      ? 'text-wine border-b-2 border-wine bg-wine/5'
                      : 'text-warm-500 hover:text-warm-700'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'info' && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-gold/5">
                  <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-rose-gold" />
                    时间安排
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-warm-500">开始时间</span>
                      <span className="font-mono text-warm-800">{formatTime(task.startTime)}</span>
                    </div>
                    {task.endTime && (
                      <div className="flex justify-between">
                        <span className="text-warm-500">结束时间</span>
                        <span className="font-mono text-warm-800">{formatTime(task.endTime)}</span>
                      </div>
                    )}
                    {task.confirmedAt && (
                      <div className="flex justify-between pt-2 border-t border-warm-50">
                        <span className="text-warm-500">确认时间</span>
                        <span className="text-emerald-600 text-xs">{formatDate(task.confirmedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-gold/5">
                  <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-gold" />
                    地点
                  </h4>
                  <p className="text-sm text-warm-700">{task.location}</p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-gold/5">
                  <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-gold" />
                    负责人
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar person={assignee} size="md" />
                        <div>
                          <p className="text-sm font-medium text-warm-800">
                            {assignee?.name || '待认领'}
                          </p>
                          <p className="text-xs text-warm-500">
                            {assignee?.role || '暂无负责人'}
                          </p>
                        </div>
                      </div>
                      {isAssignedToMe && (
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                          我负责
                        </span>
                      )}
                    </div>
                    {backup && (
                      <div className="flex items-center justify-between opacity-70">
                        <div className="flex items-center gap-3">
                          <Avatar person={backup} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-warm-700">{backup.name}</p>
                            <p className="text-xs text-warm-500">{backup.role} · 备用</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-gold/5">
                <h4 className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-rose-gold" />
                  物品清单
                </h4>
                {task.itemList.length === 0 ? (
                  <p className="text-sm text-warm-400 text-center py-4">暂无物品</p>
                ) : (
                  <div className="space-y-2">
                    {task.itemList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-warm-50 cursor-pointer transition-colors"
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
                            item.isChecked
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-warm-300'
                          )}
                        >
                          {item.isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span
                          className={cn(
                            'text-sm flex-1',
                            item.isChecked && 'text-warm-400 line-through'
                          )}
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div>
                {task.photos.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-rose-gold/5">
                    <Image className="w-12 h-12 text-warm-200 mx-auto mb-3" />
                    <p className="text-sm text-warm-400">暂无参考照片</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {task.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-warm-100"
                      >
                        <img
                          src={photo}
                          alt={`参考图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {task.changeLogs.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-rose-gold/5">
                    <History className="w-12 h-12 text-warm-200 mx-auto mb-3" />
                    <p className="text-sm text-warm-400">暂无变更记录</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-rose-gold/20" />
                    <div className="space-y-4">
                      {[...task.changeLogs].reverse().map((log, index) => {
                        const operator = people.find((p) => p.id === log.operatorId);
                        return (
                          <div key={log.id} className="relative pl-10">
                            <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-rose-gold/20 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-rose-gold" />
                            </div>
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-rose-gold/5">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-rose-gold">
                                  {log.type === 'time' && '时间变更'}
                                  {log.type === 'person' && '人员变更'}
                                  {log.type === 'location' && '地点变更'}
                                  {log.type === 'item' && '物品变更'}
                                  {log.type === 'other' && '其他变更'}
                                </span>
                                <span className="text-xs text-warm-400">
                                  {formatDate(log.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-warm-700">{log.reason}</p>
                              {(log.oldValue || log.newValue) && (
                                <div className="mt-2 text-xs text-warm-500">
                                  {log.oldValue && <span>原：{log.oldValue}</span>}
                                  {log.oldValue && log.newValue && ' → '}
                                  {log.newValue && <span>新：{log.newValue}</span>}
                                </div>
                              )}
                              {operator && (
                                <div className="mt-2 text-xs text-warm-400">
                                  操作人：{operator.name}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-rose-gold/10 bg-white/50 space-y-2">
            {canClaim && (
              <button
                onClick={handleClaim}
                className="w-full py-3 bg-gradient-to-r from-rose-gold to-rose-goldDark text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                认领这个任务
              </button>
            )}
            {canConfirm && (
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认到位
              </button>
            )}
            {canComplete && !task.isCompleted && (
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-wine to-wine-light text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                标记完成
              </button>
            )}
            {task.isCompleted && (
              <div className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                已完成
              </div>
            )}

            {task.priority === 'high' && task.status !== 'confirmed' && task.status !== 'completed' && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  这是高优先级任务，请务必按时完成
                </p>
              </div>
            )}

            <button
              onClick={handleDelete}
              className="w-full py-2 text-warm-400 text-sm hover:text-wine transition-colors"
            >
              删除任务
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
