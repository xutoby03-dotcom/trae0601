import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoGroup, { GroupType } from '@/components/todo/TodoGroup';
import TodoFilter, { TodoFilterValues } from '@/components/todo/TodoFilter';
import CompleteTodoModal from '@/components/todo/CompleteTodoModal';
import Empty from '@/components/Empty';
import { useTodoStore } from '@/store/todoStore';
import { Todo } from '@/types';
import { isOverdue, isToday, isThisWeek, formatDate } from '@/utils/dateUtils';

const defaultFilter: TodoFilterValues = {
  keyword: '',
  assignee: '',
  department: '',
  priority: '',
  meetingType: '',
};

export default function TodoListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TodoFilterValues>(defaultFilter);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const todos = useTodoStore((state) => state.todos);
  const meetings = useTodoStore((state) => state.meetings);
  const completeTodo = useTodoStore((state) => state.completeTodo);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        if (
          !todo.title.toLowerCase().includes(keyword) &&
          !todo.assignee.toLowerCase().includes(keyword) &&
          !todo.deliverable.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }
      if (filter.assignee && !todo.assignee.includes(filter.assignee)) {
        return false;
      }
      if (filter.department && todo.department !== filter.department) {
        return false;
      }
      if (filter.priority && todo.priority !== filter.priority) {
        return false;
      }
      if (filter.meetingType) {
        const meeting = meetings.find((m) => m.id === todo.meetingId);
        if (!meeting || meeting.type !== filter.meetingType) {
          return false;
        }
      }
      return true;
    });
  }, [todos, meetings, filter]);

  const groupedTodos = useMemo(() => {
    const groups: Record<GroupType, Todo[]> = {
      overdue: [],
      today: [],
      this_week: [],
      others: [],
    };

    filteredTodos.forEach((todo) => {
      if (todo.status === 'completed') {
        return;
      }
      const dueDateStr = formatDate(todo.dueDate);
      if (todo.status === 'overdue' || isOverdue(dueDateStr)) {
        groups.overdue.push(todo);
      } else if (isToday(dueDateStr)) {
        groups.today.push(todo);
      } else if (isThisWeek(dueDateStr)) {
        groups.this_week.push(todo);
      } else {
        groups.others.push(todo);
      }
    });

    return groups;
  }, [filteredTodos]);

  const handleViewDetail = (todo: Todo) => {
    navigate(`/todos/${todo.id}`);
  };

  const handleComplete = (todo: Todo) => {
    setSelectedTodo(todo);
    setModalOpen(true);
  };

  const handleSubmitComplete = (todoId: string, resultNote: string) => {
    const result = completeTodo(todoId, resultNote);
    if (result.success) {
      setModalOpen(false);
      setSelectedTodo(null);
    }
  };

  const hasActiveTodos = Object.values(groupedTodos).some((group) => group.length > 0);
  const completedCount = filteredTodos.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">待办列表</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {filteredTodos.length} 条待办，其中已完成 {completedCount} 条
          </p>
        </div>
      </div>

      <TodoFilter value={filter} onChange={setFilter} />

      {hasActiveTodos ? (
        <div className="space-y-2">
          <TodoGroup
            title="已逾期"
            type="overdue"
            todos={groupedTodos.overdue}
            onComplete={handleComplete}
            onViewDetail={handleViewDetail}
          />
          <TodoGroup
            title="今天到期"
            type="today"
            todos={groupedTodos.today}
            onComplete={handleComplete}
            onViewDetail={handleViewDetail}
          />
          <TodoGroup
            title="本周到期"
            type="this_week"
            todos={groupedTodos.this_week}
            onComplete={handleComplete}
            onViewDetail={handleViewDetail}
          />
          <TodoGroup
            title="其他待办"
            type="others"
            todos={groupedTodos.others}
            defaultCollapsed
            onComplete={handleComplete}
            onViewDetail={handleViewDetail}
          />
        </div>
      ) : (
        <div className="h-64">
          <Empty />
        </div>
      )}

      <CompleteTodoModal
        open={modalOpen}
        todo={selectedTodo}
        onClose={() => {
          setModalOpen(false);
          setSelectedTodo(null);
        }}
        onSubmit={handleSubmitComplete}
      />
    </div>
  );
}
