import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { today } from "@/utils/date";
import { TaskCard } from "@/components/TaskCard";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { SPECIES_LABEL, type DailyTask, type TaskStatus } from "@/types";
import { TASK_STATUS_LABEL } from "@/types";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ThermometerSun,
  Droplets,
  UtensilsCrossed,
  Eye,
  ImagePlus,
  Sparkles,
} from "lucide-react";

export default function DailyTasks() {
  const cages = useStore((s) => s.cages);
  const groups = useStore((s) => s.researchGroups);
  const getTasksByDate = useStore((s) => s.getTasksByDate);
  const updateTask = useStore((s) => s.updateTask);
  const completeTask = useStore((s) => s.completeTask);

  const [selectedDate, setSelectedDate] = useState(today());
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [form, setForm] = useState({
    feedAmount: "",
    waterStatus: "",
    beddingStatus: "",
    temperature: "",
    humidity: "",
    healthObservation: "",
  });

  const allTasks = useMemo(() => getTasksByDate(selectedDate), [getTasksByDate, selectedDate]);

  const filtered = useMemo(() => {
    return allTasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterGroup !== "all") {
        const cage = cages.find((c) => c.id === t.cageId);
        if (cage?.researchGroupId !== filterGroup) return false;
      }
      return true;
    });
  }, [allTasks, filterStatus, filterGroup, cages]);

  const stats = useMemo(() => {
    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      in_progress: allTasks.filter((t) => t.status === "in_progress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overdue: allTasks.filter((t) => t.status === "overdue").length,
    };
  }, [allTasks]);

  function startEdit(task: DailyTask) {
    setEditingTask(task);
    updateTask(task.id, { status: "in_progress" });
    setForm({
      feedAmount: task.feedAmount?.toString() || "",
      waterStatus: task.waterStatus || "",
      beddingStatus: task.beddingStatus || "",
      temperature: task.temperature?.toString() || "",
      humidity: task.humidity?.toString() || "",
      healthObservation: task.healthObservation || "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;

    const data: Partial<DailyTask> = {
      feedAmount: form.feedAmount ? parseFloat(form.feedAmount) : null,
      waterStatus: form.waterStatus || null,
      beddingStatus: form.beddingStatus || null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      humidity: form.humidity ? parseFloat(form.humidity) : null,
      healthObservation: form.healthObservation || null,
      abnormalPhotos: [],
    };
    completeTask(editingTask.id, data, "管理员");
    setEditingTask(null);
  }

  const { overdue, pending, in_progress, completed } = allTasks.reduce(
    (acc, t) => {
      acc[t.status].push(t);
      return acc;
    },
    { overdue: [], pending: [], in_progress: [], completed: [] } as Record<TaskStatus, DailyTask[]>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">每日任务看板</h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedDate} 饲喂任务执行情况
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <StatCard label="任务总数" value={stats.total} icon={<ClipboardList className="w-4 h-4" />} color="bg-slate-100 text-slate-600" />
        <StatCard label="待执行" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="bg-slate-100 text-slate-600" />
        <StatCard label="进行中" value={stats.in_progress} icon={<Sparkles className="w-4 h-4" />} color="bg-blue-50 text-blue-600" />
        <StatCard label="已完成" value={stats.completed} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-success-50 text-success-600" />
        <StatCard label="已逾期" value={stats.overdue} icon={<AlertTriangle className="w-4 h-4" />} color="bg-danger-50 text-danger-600" highlight={stats.overdue > 0} />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
            {(["all", "overdue", "pending", "in_progress", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s === "all" ? "全部" : TASK_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="input w-auto text-sm"
          >
            <option value="all">全部课题组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无任务" description="当前筛选条件下没有任务" />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && filterStatus === "all" && (
            <TaskSection
              title="已逾期"
              icon={<AlertTriangle className="w-5 h-5 text-danger-500" />}
              tasks={overdue}
              danger
              onTaskClick={startEdit}
            />
          )}
          {in_progress.length > 0 && (filterStatus === "all" || filterStatus === "in_progress") && (
            <TaskSection
              title="进行中"
              icon={<Sparkles className="w-5 h-5 text-blue-500" />}
              tasks={in_progress}
              onTaskClick={startEdit}
            />
          )}
          {pending.length > 0 && (filterStatus === "all" || filterStatus === "pending") && (
            <TaskSection
              title="待执行"
              icon={<Clock className="w-5 h-5 text-slate-400" />}
              tasks={pending}
              onTaskClick={startEdit}
            />
          )}
          {completed.length > 0 && (filterStatus === "all" || filterStatus === "completed") && (
            <TaskSection
              title="已完成"
              icon={<CheckCircle2 className="w-5 h-5 text-success-500" />}
              tasks={completed}
              onTaskClick={startEdit}
            />
          )}
        </div>
      )}

      <Modal
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        title="饲喂任务记录"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setEditingTask(null)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              <CheckCircle2 className="w-4 h-4" />
              完成任务
            </button>
          </div>
        }
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card p-4 ${highlight ? "ring-2 ring-danger-200 animate-pulse-border" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-xl font-bold font-mono ${highlight ? "text-danger-600" : "text-slate-900"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskSection({
  title,
  icon,
  tasks,
  onTaskClick,
  danger,
}: {
  title: string;
  icon: React.ReactNode;
  tasks: DailyTask[];
  onTaskClick: (task: DailyTask) => void;
  danger?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className={`text-sm font-semibold ${danger ? "text-danger-600" : "text-slate-700"}`}>
          {title}
        </h2>
        <span className="text-xs text-slate-400">({tasks.length})</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tasks.map((t, i) => (
          <div key={t.id} style={{ animationDelay: `${i * 30}ms` }} className="animate-fade-in-up">
            <TaskCard task={t} onClick={() => onTaskClick(t)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskForm({
  task,
  form,
  setForm,
  onSubmit,
}: {
  task: DailyTask;
  form: any;
  setForm: any;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const cage = useStore.getState().getCageById(task.cageId);
  if (!cage) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
        <img
          src={cage.photoUrl}
          alt={cage.cageNumber}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div>
          <p className="font-mono font-semibold text-slate-900">{cage.cageNumber}</p>
          <p className="text-xs text-slate-500">
            {SPECIES_LABEL[cage.species]} · {cage.animalCount}只 · 负责人：{cage.responsiblePerson}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
            饲料量 (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={form.feedAmount}
            onChange={(e) => setForm({ ...form, feedAmount: e.target.value })}
            className="input"
            placeholder="输入饲料量"
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            饮水/水质
          </label>
          <input
            value={form.waterStatus}
            onChange={(e) => setForm({ ...form, waterStatus: e.target.value })}
            className="input"
            placeholder="如 充足 / 换水50%"
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <ThermometerSun className="w-3.5 h-3.5 text-slate-400" />
            温度 (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: e.target.value })}
            className="input"
            placeholder="如 22.5"
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-slate-400" />
            湿度 (%)
          </label>
          <input
            type="number"
            value={form.humidity}
            onChange={(e) => setForm({ ...form, humidity: e.target.value })}
            className="input"
            placeholder="如 55"
          />
        </div>
      </div>

      <div>
        <label className="label">垫料状态</label>
        <input
          value={form.beddingStatus}
          onChange={(e) => setForm({ ...form, beddingStatus: e.target.value })}
          className="input"
          placeholder="如 干燥 / 需更换"
        />
      </div>

      <div>
        <label className="label flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          健康观察
        </label>
        <textarea
          value={form.healthObservation}
          onChange={(e) => setForm({ ...form, healthObservation: e.target.value })}
          rows={3}
          className="input resize-none"
          placeholder="记录动物健康状况、活动情况、异常行为等"
        />
      </div>

      <div>
        <label className="label flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5 text-slate-400" />
          异常照片
        </label>
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
          <ImagePlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">点击或拖拽上传照片（演示模式，暂不支持真实上传）</p>
        </div>
      </div>
    </form>
  );
}
