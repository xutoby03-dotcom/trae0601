import { useState, forwardRef } from 'react';
import {
  ClipboardList,
  AlertCircle,
  Eye,
  User,
  Bath,
  ShieldCheck,
  Shirt,
  Timer,
  Check,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store';
import type { BathTask, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const columnConfig: Record<Exclude<TaskStatus, 'completed'>, {
  title: string;
  icon: React.ReactNode;
  badge: string;
  accent: string;
  border: string;
  delay: string;
}> = {
  today: {
    title: '今日待办',
    icon: <ClipboardList className="w-5 h-5" />,
    badge: 'bg-teal text-white',
    accent: 'bg-teal',
    border: 'border-l-teal',
    delay: '100ms',
  },
  delayed: {
    title: '延期中',
    icon: <AlertCircle className="w-5 h-5" />,
    badge: 'bg-coral text-white',
    accent: 'bg-coral',
    border: 'border-l-coral',
    delay: '200ms',
  },
  observation: {
    title: '异常观察',
    icon: <Eye className="w-5 h-5" />,
    badge: 'bg-amber2-600 text-white',
    accent: 'bg-amber2-600',
    border: 'border-l-amber2-600',
    delay: '300ms',
  },
};

interface TaskCardProps {
  task: BathTask;
  columnKey: Exclude<TaskStatus, 'completed'>;
  onComplete: (task: BathTask) => void;
  onEdit: (task: BathTask) => void;
}

function TaskCard({ task, columnKey, onComplete, onEdit }: TaskCardProps) {
  const { elders, members } = useStore();
  const elder = elders.find((e) => e.id === task.elderId);
  const assignee = members.find((m) => m.id === task.assignedTo);
  const cfg = columnConfig[columnKey];

  const reasonText =
    columnKey === 'delayed' ? task.delayReason : columnKey === 'observation' ? task.observationReason : null;

  return (
    <div
      className={cn(
        'rounded-card bg-white shadow-soft border border-cream-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 group',
        cfg.border,
        'border-l-4'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-2xl shrink-0 shadow-inner"
              title={elder?.name}
            >
              {elder?.avatar || '👤'}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-teal-700 text-sm truncate">{elder?.name}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: assignee?.color || '#8EB3B3' }}
                >
                  {assignee?.avatar || '👤'}
                </span>
                <span className="text-xs text-teal-300 truncate">{assignee?.name || '未指派'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="w-7 h-7 rounded-lg bg-cream-50 flex items-center justify-center text-teal-300 opacity-0 group-hover:opacity-100 hover:bg-teal-50 hover:text-teal transition-all"
              title="编辑"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <InfoRow icon={<Bath className="w-3.5 h-3.5" />} label={task.bathroom} />
          <InfoRow icon={<Timer className="w-3.5 h-3.5" />} label={`${task.estimatedMinutes} 分钟`} />
          <InfoRow
            icon={<ShieldCheck className={cn('w-3.5 h-3.5', task.nonSlipMat ? 'text-sage-600' : 'text-teal-200')} />}
            label="防滑垫"
            ok={task.nonSlipMat}
          />
          <InfoRow
            icon={<Shirt className={cn('w-3.5 h-3.5', task.changeClothes ? 'text-sage-600' : 'text-teal-200')} />}
            label="换洗衣物"
            ok={task.changeClothes}
          />
        </div>

        {reasonText && (
          <div className="mt-3 p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-xs text-teal-300 flex gap-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-coral" />
            <span className="line-clamp-2">{reasonText}</span>
          </div>
        )}
      </div>

      {columnKey === 'today' && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onComplete(task)}
            className="w-full py-2.5 rounded-xl bg-teal text-white text-sm font-medium shadow-soft hover:bg-teal-600 active:translate-y-px transition-all flex items-center justify-center gap-1.5 group/btn"
          >
            <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            完成助浴
          </button>
        </div>
      )}

      {columnKey !== 'today' && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onComplete(task)}
            className="w-full py-2 rounded-xl border border-cream-200 text-teal-300 text-xs font-medium hover:border-teal-200 hover:text-teal hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            仍可标记完成
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-teal-300">
      {icon}
      <span className={cn('truncate', ok === false && 'text-teal-200 line-through')}>{label}</span>
    </div>
  );
}

interface TaskBoardProps {
  onCompleteTask: (task: BathTask) => void;
  drawerOpen: boolean;
  preselectedElderId?: string;
  editingTask: BathTask | null;
  onDrawerOpenChange: (open: boolean) => void;
  onEditTask: (task: BathTask | null) => void;
  onClearPreselection: () => void;
  delayedFilterMemberId?: string;
  onClearDelayedFilter: () => void;
}

export const TaskBoard = forwardRef<HTMLElement, TaskBoardProps>(function TaskBoard({ onCompleteTask, drawerOpen, preselectedElderId, editingTask, onDrawerOpenChange, onEditTask, onClearPreselection, delayedFilterMemberId, onClearDelayedFilter }, ref) {
  const { tasks } = useStore();

  const openEdit = (task: BathTask) => {
    onEditTask(task);
    onClearPreselection();
    onDrawerOpenChange(true);
  };

  const openNew = () => {
    onEditTask(null);
    onClearPreselection();
    onDrawerOpenChange(true);
  };

  const closeDrawer = () => {
    onDrawerOpenChange(false);
    onEditTask(null);
  };

  const columns: Exclude<TaskStatus, 'completed'>[] = ['today', 'delayed', 'observation'];
  const columnTasks = columns.map((k) => {
    let items = tasks.filter((t) => t.status === k);
    if (k === 'delayed' && delayedFilterMemberId) {
      items = items.filter((t) => t.assignedTo === delayedFilterMemberId);
    }
    return { key: k, items };
  });

  const filterMember = useStore((s) => s.members.find((m) => m.id === delayedFilterMemberId));

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 pt-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-teal-700 font-serif flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> 助浴任务看板
          </h2>
          <p className="text-sm text-teal-300 mt-1">按状态分类，今日待办优先处理</p>
        </div>
        <div className="flex items-center gap-3">
          {delayedFilterMemberId && filterMember && (
            <button
              onClick={onClearDelayedFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-coral-50 border border-coral/30 text-coral text-sm font-medium hover:bg-coral-100 transition-all"
            >
              <span
                className="w-5 h-5 rounded-full text-[11px] flex items-center justify-center text-white"
                style={{ backgroundColor: filterMember.color }}
              >
                {filterMember.avatar}
              </span>
              <span>筛选：{filterMember.name}的延期</span>
              <X className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-dashed border-teal-200 text-teal-300 text-sm font-medium hover:border-teal hover:text-teal hover:bg-teal-50 transition-all"
          >
            <Plus className="w-4 h-4" /> 新增任务
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {columnTasks.map(({ key, items }) => {
          const cfg = columnConfig[key];
          return (
            <div
              key={key}
              className="rounded-2xl bg-cream-50/50 border border-cream-200 p-4"
              style={{ animation: `fadeInUp 0.6s ease-out ${cfg.delay} both` }}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white', cfg.accent)}>
                    {cfg.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-700 text-sm">{cfg.title}</h3>
                    <p className="text-[11px] text-teal-300 mt-0.5">
                      {key === 'today' ? '今日需完成' : key === 'delayed' ? '超期待处理' : '暂缓观察中'}
                    </p>
                  </div>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-bold tabular-nums', cfg.badge)}>
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-teal-200">
                    <div className="text-3xl mb-2">✨</div>
                    <p className="text-xs">暂无{cfg.title}任务</p>
                  </div>
                ) : (
                  items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnKey={key}
                      onComplete={onCompleteTask}
                      onEdit={openEdit}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {drawerOpen && <TaskDrawer task={editingTask} preselectedElderId={preselectedElderId} onClose={closeDrawer} />}
    </section>
  );
});

interface TaskDrawerProps {
  task: BathTask | null;
  preselectedElderId?: string;
  onClose: () => void;
}

function TaskDrawer({ task, preselectedElderId, onClose }: TaskDrawerProps) {
  const { elders, members, addTask, updateTask, deleteTask } = useStore();
  const [form, setForm] = useState(() => ({
    elderId: task?.elderId || preselectedElderId || elders[0]?.id || '',
    assignedTo: task?.assignedTo || members[0]?.id || '',
    bathroom: task?.bathroom || '主卧浴室',
    nonSlipMat: task?.nonSlipMat ?? true,
    changeClothes: task?.changeClothes ?? true,
    estimatedMinutes: task?.estimatedMinutes || 45,
    scheduledDate: task?.scheduledDate || new Date().toISOString().split('T')[0],
    status: (task?.status || 'today') as TaskStatus,
    delayReason: task?.delayReason || '',
    observationReason: task?.observationReason || '',
  }));

  const submit = () => {
    if (!form.elderId || !form.assignedTo) return;
    if (task) {
      updateTask(task.id, form);
    } else {
      addTask(form);
    }
    onClose();
  };

  const remove = () => {
    if (task && confirm('确认删除这个助浴任务吗？')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-teal-700/30 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-cream-50 shadow-2xl overflow-hidden animate-[fadeInScale_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-white border-b border-cream-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-teal-700 font-serif">
            {task ? '编辑助浴任务' : '安排助浴任务'}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center text-teal-300 hover:text-teal hover:bg-teal-50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Field label="老人">
              <select
                value={form.elderId}
                onChange={(e) => setForm({ ...form, elderId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                {elders.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.avatar} {e.name}（{e.age}岁）
                  </option>
                ))}
              </select>
            </Field>
            <Field label="负责人">
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}（{m.role}）
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="浴室">
              <select
                value={form.bathroom}
                onChange={(e) => setForm({ ...form, bathroom: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                <option>主卧浴室</option>
                <option>客卫浴室</option>
                <option>次卧浴室</option>
              </select>
            </Field>
            <Field label="预计时长（分钟）">
              <input
                type="number"
                min={10}
                max={120}
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="计划日期">
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </Field>
            <Field label="任务状态">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                <option value="today">今日待办</option>
                <option value="delayed">延期中</option>
                <option value="observation">异常观察</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ToggleField
              label="防滑垫准备"
              icon={<ShieldCheck className="w-4 h-4" />}
              checked={form.nonSlipMat}
              onChange={(v) => setForm({ ...form, nonSlipMat: v })}
            />
            <ToggleField
              label="换洗衣物准备"
              icon={<Shirt className="w-4 h-4" />}
              checked={form.changeClothes}
              onChange={(v) => setForm({ ...form, changeClothes: v })}
            />
          </div>

          {form.status === 'delayed' && (
            <Field label="延期原因">
              <textarea
                value={form.delayReason}
                onChange={(e) => setForm({ ...form, delayReason: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral resize-none"
                placeholder="请说明延期原因..."
              />
            </Field>
          )}

          {form.status === 'observation' && (
            <Field label="观察原因">
              <textarea
                value={form.observationReason}
                onChange={(e) => setForm({ ...form, observationReason: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber2-600/30 focus:border-amber2-600 resize-none"
                placeholder="需观察的症状或原因..."
              />
            </Field>
          )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-cream-200 flex gap-3">
          {task && (
            <button
              onClick={remove}
              className="px-4 py-2.5 rounded-xl text-coral-600 text-sm font-medium hover:bg-coral-50 transition"
            >
              删除
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-cream-200 text-teal-300 text-sm font-medium hover:bg-cream-50 transition"
          >
            取消
          </button>
          <button
            onClick={submit}
            className="px-6 py-2.5 rounded-xl bg-teal text-white text-sm font-medium shadow-soft hover:bg-teal-600 transition"
          >
            {task ? '保存' : '安排任务'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-teal-300 mb-1.5 flex items-center gap-1.5">
        <User className="w-3 h-3 opacity-50" />
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleField({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all',
        checked
          ? 'bg-sage-50 border-sage-200 text-sage-600'
          : 'bg-white border-cream-200 text-teal-300 hover:border-teal-200'
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <div
        className={cn(
          'w-10 h-6 rounded-full p-0.5 transition-all',
          checked ? 'bg-sage' : 'bg-cream-200'
        )}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
    </button>
  );
}
