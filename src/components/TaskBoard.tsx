import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { COLUMN_META, TaskColumn as TaskColumnType, Task, Participant } from '../types';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { Avatar } from './Avatar';
import {
  Users,
  Wallet,
  Filter,
  UserCheck,
  ChevronDown,
  X,
  Eye,
} from 'lucide-react';

type PaidFilter = 'all' | 'paid' | 'unpaid';

const SELF_KEY = 'birthday_self_id';

export const TaskBoard: React.FC = () => {
  const tasks = usePlanStore((s) => s.plan.tasks);
  const participants = usePlanStore((s) => s.plan.participants);
  const [editingTask, setEditingTask] = React.useState<{ task?: Task; column?: TaskColumnType } | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<TaskColumnType | null>(null);

  // 筛选状态
  const [assigneeFilter, setAssigneeFilter] = React.useState<string | 'all' | 'unassigned'>('all');
  const [paidFilter, setPaidFilter] = React.useState<PaidFilter>('all');
  const [selfId, setSelfId] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem(SELF_KEY);
    } catch {
      return null;
    }
  });
  const [showSelfPicker, setShowSelfPicker] = React.useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = React.useState(false);

  // 记住"我是谁"
  React.useEffect(() => {
    try {
      if (selfId) localStorage.setItem(SELF_KEY, selfId);
      else localStorage.removeItem(SELF_KEY);
    } catch {}
  }, [selfId]);

  // 校验 selfId 是否还在参与人里
  React.useEffect(() => {
    if (selfId && !participants.some((p) => p.id === selfId)) {
      setSelfId(null);
    }
  }, [participants, selfId]);

  const columns: TaskColumnType[] = ['secret', 'same_day', 'advance'];
  const self = participants.find((p) => p.id === selfId);

  // 应用筛选
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      // 负责人筛选
      if (assigneeFilter === 'unassigned') {
        if (t.assigneeId !== null) return false;
      } else if (assigneeFilter !== 'all') {
        if (t.assigneeId !== assigneeFilter) return false;
      }
      // 垫付状态筛选
      if (paidFilter === 'paid') {
        if (!t.isPaid) return false;
      } else if (paidFilter === 'unpaid') {
        if (t.isPaid || t.budget <= 0) return false;
      }
      return true;
    });
  }, [tasks, assigneeFilter, paidFilter]);

  const hasActiveFilter =
    assigneeFilter !== 'all' || paidFilter !== 'all';

  const getTasksForColumn = (col: TaskColumnType) =>
    filteredTasks.filter((t) => t.column === col);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOver(null);
  };

  const handleDrop = (targetCol: TaskColumnType) => {
    if (draggedId) {
      usePlanStore.getState().moveTask(draggedId, targetCol);
    }
    setDraggedId(null);
    setDragOver(null);
  };

  const toggleOnlyMine = () => {
    if (!selfId) {
      setShowSelfPicker(true);
      return;
    }
    setAssigneeFilter((prev) => (prev === selfId ? 'all' : selfId));
  };

  const clearFilters = () => {
    setAssigneeFilter('all');
    setPaidFilter('all');
  };

  const setSelf = (p: Participant | null) => {
    setSelfId(p?.id || null);
    setShowSelfPicker(false);
    // 选完我是谁后自动切到只看我的
    if (p) setAssigneeFilter(p.id);
  };

  // 统计
  const completedCount = tasks.filter((t) => t.completed).length;
  const shownCount = filteredTasks.length;
  const totalBudget = tasks.reduce((s, t) => s + (t.budget || 0), 0);
  const paidBudget = tasks.filter((t) => t.isPaid).reduce((s, t) => s + (t.budget || 0), 0);

  return (
    <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-slate2-800 flex items-center gap-2">
            <span>📋</span>
            <span>任务看板</span>
            <span className="ml-2 text-base font-body font-normal text-slate2-500 bg-slate2-100 px-3 py-1 rounded-full">
              已完成 {completedCount}/{tasks.length}
              {shownCount !== tasks.length && (
                <span className="ml-2 text-coral-500">· 显示{shownCount}条</span>
              )}
            </span>
          </h2>
          <p className="mt-1 text-slate2-500 text-sm">
            拖拽卡片移动分区 · 明确分工不翻车 🚗
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate2-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint-500"></span>
            <span>任务预算 ¥{totalBudget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cream-500"></span>
            <span>已垫付 ¥{paidBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 筛选条 */}
      <div className="relative z-40 flex flex-wrap items-center gap-3 mb-5 p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-card border border-slate2-100 animate-fade-in-up">
        {/* 我是谁 + 只看我负责的 */}
        <div className="relative">
          <button
            onClick={toggleOnlyMine}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selfId && assigneeFilter === selfId
                ? 'bg-coral-500 text-white shadow-md scale-105'
                : 'bg-white text-slate2-700 border-2 border-slate2-200 hover:border-coral-300 hover:bg-coral-50'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${selfId && assigneeFilter === selfId ? '' : 'text-coral-500'}`} />
            {self ? (
              <>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: self.avatarColor }}>
                  {self.name.charAt(0)}
                </span>
                <span>我是{self.name} · 只看我的</span>
                {selfId && assigneeFilter === selfId && <Eye className="w-4 h-4" />}
              </>
            ) : (
              <span>先选"我是谁"👉</span>
            )}
          </button>

          {/* 切换身份下拉 */}
          {showSelfPicker && (
            <div className="absolute top-full left-0 mt-2 z-40 bg-white rounded-2xl shadow-xl border border-slate2-100 p-2 min-w-[200px] animate-scale-in pointer-events-auto">
              <div className="text-xs text-slate2-400 px-3 py-1.5 border-b border-slate2-100 mb-1">
                我是哪一位？
              </div>
              {participants.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate2-400 text-center">
                  先去顶部添加参与人吧
                </div>
              ) : (
                <>
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelf(p)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                        selfId === p.id ? 'bg-coral-50' : 'hover:bg-slate2-50'
                      }`}
                    >
                      <Avatar participant={p} size="sm" />
                      <span className="text-sm font-medium text-slate2-700">{p.name}</span>
                      {selfId === p.id && (
                        <span className="ml-auto text-coral-500 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                  {selfId && (
                    <button
                      onClick={() => setSelf(null)}
                      className="w-full flex items-center justify-center gap-1 mt-1 px-3 py-1.5 rounded-xl text-xs text-slate2-400 hover:bg-slate2-50"
                    >
                      清除身份
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setShowSelfPicker(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate2-200 rounded-full flex items-center justify-center text-slate2-400 hover:text-slate2-600 shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-slate2-200 shrink-0 hidden sm:block"></div>

        {/* 负责人筛选 */}
        <div className="relative">
          <button
            onClick={() => setShowAssigneePicker((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border-2 border-slate2-200 hover:border-mint-300 transition-all"
          >
            <Users className="w-4 h-4 text-mint-500" />
            <span>负责人：</span>
            <span className="font-semibold text-slate2-700">
              {assigneeFilter === 'all'
                ? '全部'
                : assigneeFilter === 'unassigned'
                ? '待分配'
                : participants.find((p) => p.id === assigneeFilter)?.name || '全部'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate2-400 transition-transform ${showAssigneePicker ? 'rotate-180' : ''}`} />
          </button>

          {showAssigneePicker && (
            <div className="absolute top-full left-0 mt-2 z-40 bg-white rounded-2xl shadow-xl border border-slate2-100 p-2 min-w-[200px] animate-scale-in max-h-80 overflow-y-auto pointer-events-auto">
              {[
                { id: 'all', label: '👥 全部任务' },
                { id: 'unassigned', label: '❓ 待分配任务' },
                ...participants.map((p) => ({ id: p.id, label: p.name, participant: p })),
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAssigneeFilter(opt.id as any);
                    setShowAssigneePicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                    assigneeFilter === opt.id ? 'bg-mint-50' : 'hover:bg-slate2-50'
                  }`}
                >
                  {'participant' in opt && opt.participant ? (
                    <Avatar participant={opt.participant as Participant} size="sm" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    assigneeFilter === opt.id ? 'text-mint-700' : 'text-slate2-700'
                  }`}>{opt.label}</span>
                  {assigneeFilter === opt.id && (
                    <span className="ml-auto text-mint-500 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 垫付状态筛选 */}
        <div className="flex items-center gap-1 bg-white border-2 border-slate2-200 rounded-full p-1">
          {(['all', 'paid', 'unpaid'] as PaidFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPaidFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                paidFilter === f
                  ? f === 'paid'
                    ? 'bg-mint-500 text-white shadow-sm'
                    : f === 'unpaid'
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'bg-slate2-700 text-white shadow-sm'
                  : 'text-slate2-500 hover:text-slate2-700'
              }`}
            >
              <Wallet className="w-3 h-3 inline mr-1" />
              {f === 'all' ? '全部' : f === 'paid' ? '已垫付' : '待垫付'}
            </button>
          ))}
        </div>

        {/* 清除筛选 */}
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors animate-scale-in"
          >
            <X className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}
      </div>

      {/* 筛选后无结果提示 */}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="mb-5 p-6 text-center bg-white/70 rounded-2xl border-2 border-dashed border-slate2-200 animate-scale-in">
          <Filter className="w-10 h-10 mx-auto mb-2 text-slate2-300" />
          <p className="text-slate2-500 font-medium">当前筛选条件下没有任务</p>
          <p className="text-slate2-400 text-sm mt-1">换个条件，或者点击右上角清除筛选</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {columns.map((col, idx) => (
          <TaskColumn
            key={col}
            column={col}
            meta={COLUMN_META[col]}
            tasks={getTasksForColumn(col)}
            index={idx}
            onAdd={() => setEditingTask({ column: col })}
            onEdit={(task) => setEditingTask({ task })}
            dragOver={dragOver === col}
            draggedId={draggedId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col)}
            onTaskDragStart={handleDragStart}
            onTaskDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {editingTask && (
        <TaskModal
          task={editingTask.task}
          defaultColumn={editingTask.column}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* 点击外部关闭下拉 */}
      {(showSelfPicker || showAssigneePicker) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowSelfPicker(false);
            setShowAssigneePicker(false);
          }}
        />
      )}
    </section>
  );
};
