import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Paperclip, FileText, Download } from 'lucide-react';
import TodoCard from '@/components/todo/TodoCard';
import CompleteTodoModal from '@/components/todo/CompleteTodoModal';
import Empty from '@/components/Empty';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useTodoStore } from '@/store/todoStore';
import { MEETING_TYPE_LABELS, Meeting, Todo } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const meetingTypeColors: Record<string, string> = {
  weekly: 'primary',
  monthly: 'info',
  project: 'success',
  review: 'warning',
  emergency: 'danger',
  other: 'default',
};

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const { meetings, getTodosByMeetingId, completeTodo } = useTodoStore();

  const meeting = meetings.find((m) => m.id === id);
  const meetingTodos = meeting ? getTodosByMeetingId(meeting.id) : [];

  if (!meeting) {
    return (
      <div className="h-96">
        <Empty />
      </div>
    );
  }

  const handleViewTodoDetail = (todo: Todo) => {
    navigate(`/todos/${todo.id}`);
  };

  const handleCompleteTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = (todoId: string, resultNote: string) => {
    completeTodo(todoId, resultNote);
    setIsCompleteModalOpen(false);
    setSelectedTodo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Badge variant={meetingTypeColors[meeting.type] as any} size="md">
              {MEETING_TYPE_LABELS[meeting.type]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">会议信息</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">会议时间</p>
                  <p className="text-base text-gray-900 font-medium">{formatDateTime(meeting.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">参与人员</p>
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {meeting.attachments.length > 0 && (
                <div className="flex items-start gap-3">
                  <Paperclip className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">会议附件</p>
                    <div className="space-y-2">
                      {meeting.attachments.map((att, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-900">{att.name}</span>
                          </div>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-white transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                关联待办
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({meetingTodos.length})
                </span>
              </h2>
            </div>
            <div className="p-6">
              {meetingTodos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meetingTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onViewDetail={handleViewTodoDetail}
                      onComplete={handleCompleteTodo}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-40">
                  <Empty />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">操作记录</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm text-gray-500">
                <div>
                  <span className="text-gray-400">创建时间：</span>
                  <span className="text-gray-700">{formatDateTime(meeting.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400">更新时间：</span>
                  <span className="text-gray-700">{formatDateTime(meeting.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CompleteTodoModal
        open={isCompleteModalOpen}
        todo={selectedTodo}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedTodo(null);
        }}
        onSubmit={handleCompleteSubmit}
      />
    </div>
  );
}
