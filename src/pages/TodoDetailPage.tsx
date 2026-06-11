import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  MessageSquare,
  FileText,
  Link as LinkIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Empty from '@/components/Empty';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import CompleteTodoModal from '@/components/todo/CompleteTodoModal';
import { useTodoStore } from '@/store/todoStore';
import { Todo, MEETING_TYPE_LABELS } from '@/types';
import { formatDateTime, getRelativeDate } from '@/utils/dateUtils';
import { getPriorityBadgeClass, getPriorityLabel, getStatusColor, getStatusLabel } from '@/utils/statusUtils';
import { cn } from '@/lib/utils';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const todos = useTodoStore((state) => state.todos);
  const meetings = useTodoStore((state) => state.meetings);
  const getChangeLogsByTodoId = useTodoStore((state) => state.getChangeLogsByTodoId);
  const completeTodo = useTodoStore((state) => state.completeTodo);

  const todo = todos.find((t) => t.id === id);
  const meeting = todo ? meetings.find((m) => m.id === todo.meetingId) : undefined;
  const changeLogs = todo ? getChangeLogsByTodoId(todo.id) : [];

  const handleComplete = () => {
    setModalOpen(true);
  };

  const handleSubmitComplete = (todoId: string, resultNote: string) => {
    const result = completeTodo(todoId, resultNote);
    if (result.success) {
      setModalOpen(false);
    }
  };

  if (!todo) {
    return (
      <div className="h-96">
        <Empty />
      </div>
    );
  }

  const actionLabels: Record<string, string> = {
    create: '创建待办',
    update_status: '更新状态',
    update_priority: '更新优先级',
    update_due_date: '更新截止日期',
    update_assignee: '更新负责人',
    complete: '完成待办',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityBadgeClass(todo.priority))}>
              {getPriorityLabel(todo.priority)}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(todo.status))}>
              {getStatusLabel(todo.status)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{todo.title}</h1>
        </div>
        {todo.status !== 'completed' && (
          <Button leftIcon={<CheckCircle2 className="w-4 h-4" />} variant="secondary" onClick={handleComplete}>
            标记完成
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">待办详情</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">关联议题</p>
                  <p className="text-base text-gray-900">{todo.relatedTopic}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">交付物</p>
                  <p className="text-base text-gray-900">{todo.deliverable}</p>
                </div>
              </div>

              {todo.resultNote && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">完成结果</p>
                    <div className="mt-1 p-3 rounded-lg bg-success-50 border border-success-100">
                      <p className="text-sm text-success-700">{todo.resultNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">变更记录</h2>
            </div>
            <div className="p-6">
              {changeLogs.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />
                  <div className="space-y-5">
                    {changeLogs.map((log) => (
                      <div key={log.id} className="relative pl-8">
                        <div className={cn(
                          'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
                          log.action === 'complete' ? 'bg-success-100' :
                          log.action === 'create' ? 'bg-primary-100' : 'bg-gray-100'
                        )}>
                          {log.action === 'complete' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                          ) : log.action === 'create' ? (
                            <LinkIcon className="w-3.5 h-3.5 text-primary-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {actionLabels[log.action] || log.action}
                            </p>
                            {log.fromValue && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                从 <span className="text-gray-600">{log.fromValue}</span>
                                {' → '}
                                <span className="text-gray-900">{log.toValue}</span>
                              </p>
                            )}
                            {!log.fromValue && log.toValue && (
                              <p className="text-sm text-gray-500 mt-0.5">{log.toValue}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">操作人：{log.operator}</p>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-32">
                  <Empty />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">负责人</p>
                  <p className="text-sm font-medium text-gray-900">{todo.assignee}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">部门</p>
                  <p className="text-sm font-medium text-gray-900">{todo.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {todo.status === 'overdue' ? (
                  <AlertCircle className="w-5 h-5 text-danger-500 shrink-0" />
                ) : (
                  <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs text-gray-500">截止日期</p>
                  <p className={cn(
                    'text-sm font-medium',
                    todo.status === 'overdue' ? 'text-danger-600' : 'text-gray-900'
                  )}>
                    {formatDateTime(todo.dueDate)}
                  </p>
                  <p className="text-xs text-gray-500">{getRelativeDate(todo.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {meeting && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">关联会议</h2>
              </div>
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/meetings/${meeting.id}`)}
              >
                <Badge variant="primary" size="sm" className="mb-2">
                  {MEETING_TYPE_LABELS[meeting.type]}
                </Badge>
                <p className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                  {meeting.title}
                </p>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateTime(meeting.date)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">时间记录</h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-700">{formatDateTime(todo.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">更新时间</span>
                <span className="text-gray-700">{formatDateTime(todo.updatedAt)}</span>
              </div>
              {todo.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">完成时间</span>
                  <span className="text-success-600">{formatDateTime(todo.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CompleteTodoModal
        open={modalOpen}
        todo={todo}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitComplete}
      />
    </div>
  );
}
