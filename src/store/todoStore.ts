import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Meeting, Todo, ChangeLog, Priority, TodoStatus, TodoAction } from '../types';
import { mockMeetings, mockTodos, mockChangeLogs } from '../data/mockData';
import { generateId, formatDate, isOverdue } from '../utils/dateUtils';

interface TodoState {
  meetings: Meeting[];
  todos: Todo[];
  changeLogs: ChangeLog[];
  currentOperator: string;

  addMeeting: (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Meeting;
  updateMeeting: (id: string, data: Partial<Omit<Meeting, 'id' | 'createdAt'>>) => void;
  deleteMeeting: (id: string) => void;

  addTodo: (data: Omit<Todo, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Todo;
  updateTodo: (id: string, data: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  deleteTodo: (id: string) => void;

  updateTodoStatus: (id: string, status: TodoStatus) => void;
  updateTodoPriority: (id: string, priority: Priority) => void;
  updateTodoDueDate: (id: string, dueDate: string) => void;
  updateTodoAssignee: (id: string, assignee: string, department: string) => void;
  completeTodo: (id: string, resultNote: string) => { success: boolean; error?: string };
  reopenTodo: (id: string) => void;

  addChangeLog: (todoId: string, action: TodoAction, fromValue?: string, toValue?: string) => void;
  getChangeLogsByTodoId: (todoId: string) => ChangeLog[];
  getTodosByMeetingId: (meetingId: string) => Todo[];

  refreshOverdueTodos: () => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      meetings: mockMeetings,
      todos: mockTodos,
      changeLogs: mockChangeLogs,
      currentOperator: '张三',

      addMeeting: (data) => {
        const now = new Date().toISOString();
        const meeting: Meeting = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ meetings: [meeting, ...state.meetings] }));
        return meeting;
      },

      updateMeeting: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id ? { ...m, ...data, updatedAt: now } : m
          ),
        }));
      },

      deleteMeeting: (id) => {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.id !== id),
          todos: state.todos.filter((t) => t.meetingId !== id),
        }));
      },

      addTodo: (data) => {
        const now = new Date().toISOString();
        let initialStatus: TodoStatus = 'pending';
        if (isOverdue(formatDate(data.dueDate))) {
          initialStatus = 'overdue';
        }
        const todo: Todo = {
          ...data,
          relatedTopic: data.relatedTopic.trim(),
          id: generateId(),
          status: initialStatus,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ todos: [todo, ...state.todos] }));
        get().addChangeLog(todo.id, 'create', undefined, todo.title);
        return todo;
      },

      updateTodo: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: now } : t
          ),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
          changeLogs: state.changeLogs.filter((l) => l.todoId !== id),
        }));
      },

      updateTodoStatus: (id, status) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo || todo.status === status) return;
        const now = new Date().toISOString();
        const updates: Partial<Todo> = { status, updatedAt: now };
        if (status === 'completed' && !todo.completedAt) {
          updates.completedAt = now;
        }
        if (status !== 'completed' && todo.completedAt) {
          updates.completedAt = undefined;
        }
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        get().addChangeLog(id, 'update_status', todo.status, status);
      },

      updateTodoPriority: (id, priority) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo || todo.priority === priority) return;
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, priority, updatedAt: now } : t
          ),
        }));
        get().addChangeLog(id, 'update_priority', todo.priority, priority);
      },

      updateTodoDueDate: (id, dueDate) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo || todo.dueDate === dueDate) return;
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, dueDate, updatedAt: now } : t
          ),
        }));
        get().addChangeLog(id, 'update_due_date', formatDate(todo.dueDate), formatDate(dueDate));
      },

      updateTodoAssignee: (id, assignee, department) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo || (todo.assignee === assignee && todo.department === department)) return;
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, assignee, department, updatedAt: now } : t
          ),
        }));
        get().addChangeLog(id, 'update_assignee', todo.assignee, assignee);
      },

      completeTodo: (id, resultNote) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo) {
          return { success: false, error: '待办不存在' };
        }
        if (!resultNote || resultNote.trim() === '') {
          return { success: false, error: '请填写完成说明' };
        }
        if (resultNote.trim().length < 5) {
          return { success: false, error: '完成说明至少需要5个字符' };
        }
        if (todo.status === 'completed') {
          return { success: false, error: '该待办已完成' };
        }
        const now = new Date().toISOString();
        const previousStatus = todo.status;
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? { ...t, status: 'completed', resultNote: resultNote.trim(), completedAt: now, updatedAt: now }
              : t
          ),
        }));
        get().addChangeLog(id, 'complete', previousStatus, 'completed');
        return { success: true };
      },

      reopenTodo: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo || todo.status !== 'completed') return;
        const now = new Date().toISOString();
        const newStatus: TodoStatus = isOverdue(formatDate(todo.dueDate)) ? 'overdue' : 'pending';
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? { ...t, status: newStatus, resultNote: undefined, completedAt: undefined, updatedAt: now }
              : t
          ),
        }));
        get().addChangeLog(id, 'update_status', 'completed', newStatus);
      },

      addChangeLog: (todoId, action, fromValue, toValue) => {
        const log: ChangeLog = {
          id: generateId(),
          todoId,
          action,
          fromValue,
          toValue,
          operator: get().currentOperator,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ changeLogs: [log, ...state.changeLogs] }));
      },

      getChangeLogsByTodoId: (todoId) => {
        return get().changeLogs.filter((l) => l.todoId === todoId);
      },

      getTodosByMeetingId: (meetingId) => {
        return get().todos.filter((t) => t.meetingId === meetingId);
      },

      refreshOverdueTodos: () => {
        const now = new Date().toISOString();
        set((state) => ({
          todos: state.todos.map((t) => {
            if (t.status === 'completed') return t;
            if (isOverdue(formatDate(t.dueDate)) && t.status !== 'overdue') {
              get().addChangeLog(t.id, 'update_status', t.status, 'overdue');
              return { ...t, status: 'overdue' as TodoStatus, updatedAt: now };
            }
            if (!isOverdue(formatDate(t.dueDate)) && t.status === 'overdue') {
              get().addChangeLog(t.id, 'update_status', 'overdue', 'pending');
              return { ...t, status: 'pending' as TodoStatus, updatedAt: now };
            }
            return t;
          }),
        }));
      },
    }),
    {
      name: 'meeting-todo-store',
      partialize: (state) => ({
        meetings: state.meetings,
        todos: state.todos,
        changeLogs: state.changeLogs,
      }),
    }
  )
);
