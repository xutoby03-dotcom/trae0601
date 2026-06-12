import { useState } from 'react';
import { Plus, X, AlertTriangle, Clock, Lightbulb, Trash2 } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import type { ReviewRecord } from '@/types';

type TabType = 'missed' | 'overtime' | 'suggestion';

const tabs: { id: TabType; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { id: 'missed', label: '遗漏事项', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
  { id: 'overtime', label: '超时环节', icon: Clock, color: 'text-blue-500 bg-blue-50' },
  { id: 'suggestion', label: '经验建议', icon: Lightbulb, color: 'text-emerald-500 bg-emerald-50' },
];

export function ReviewList() {
  const { reviewRecords, addReviewRecord, deleteReviewRecord, tasks } = useTaskStore();
  const [activeTab, setActiveTab] = useState<TabType>('missed');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const filteredRecords = reviewRecords.filter((r) => r.type === activeTab);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addReviewRecord({
      type: activeTab,
      content: newContent.trim(),
      taskId: selectedTaskId || undefined,
    });
    setNewContent('');
    setSelectedTaskId('');
    setIsAdding(false);
  };

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return '';
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || '';
  };

  const activeTabConfig = tabs.find((t) => t.id === activeTab)!;
  const TabIcon = activeTabConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-rose-gold/5 overflow-hidden mt-6">
      <div className="flex border-b border-rose-gold/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = reviewRecords.filter((r) => r.type === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-wine border-b-2 border-wine bg-wine/5'
                  : 'text-warm-500 hover:text-warm-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full',
                  activeTab === tab.id ? 'bg-wine/20 text-wine' : 'bg-warm-100 text-warm-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {isAdding ? (
          <div className="bg-warm-50 rounded-xl p-4 mb-4 border border-warm-100">
            <div className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', activeTabConfig.color)}>
                <TabIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={`输入${activeTabConfig.label}内容...`}
                  className="w-full p-3 rounded-lg border border-warm-200 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold"
                  autoFocus
                />
                {(activeTab === 'missed' || activeTab === 'overtime') && (
                  <div className="mt-3">
                    <label className="text-xs text-warm-500 mb-1 block">关联任务（可选）</label>
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold/30 focus:border-rose-gold"
                    >
                      <option value="">不关联</option>
                      {tasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newContent.trim()}
                    className={cn(
                      'px-4 py-2 text-sm rounded-lg transition-colors',
                      newContent.trim()
                        ? 'bg-gradient-to-r from-rose-gold to-rose-goldDark text-white shadow-md'
                        : 'bg-warm-200 text-warm-400 cursor-not-allowed'
                    )}
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-warm-200 rounded-xl text-warm-400 hover:text-rose-gold hover:border-rose-gold/50 hover:bg-rose-gold/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            添加{activeTabConfig.label}
          </button>
        )}

        <div className="space-y-3 mt-4">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <TabIcon className="w-12 h-12 text-warm-200 mx-auto mb-3" />
              <p className="text-warm-400 text-sm">暂无{activeTabConfig.label}</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <ReviewItem
                key={record.id}
                record={record}
                taskTitle={getTaskTitle(record.taskId)}
                onDelete={() => deleteReviewRecord(record.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewItemProps {
  record: ReviewRecord;
  taskTitle: string;
  onDelete: () => void;
}

function ReviewItem({ record, taskTitle, onDelete }: ReviewItemProps) {
  const typeConfig = tabs.find((t) => t.id === record.type)!;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="group bg-warm-50/50 rounded-xl p-4 border border-warm-100 hover:border-warm-200 transition-all">
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeConfig.color)}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          {taskTitle && (
            <span className="text-xs text-rose-gold font-medium">
              关联：{taskTitle}
            </span>
          )}
          <p className="text-sm text-warm-800 mt-1">{record.content}</p>
          <p className="text-xs text-warm-400 mt-2">
            {new Date(record.createdAt).toLocaleString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
