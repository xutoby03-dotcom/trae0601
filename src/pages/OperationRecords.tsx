import { useState, useMemo } from "react";
import { useStore } from "@/store";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";
import {
  OPERATION_TYPE_LABEL,
  SPECIES_LABEL,
  type OperationType,
} from "@/types";
import { formatDateTime } from "@/utils/date";
import {
  Scale,
  RefreshCw,
  Droplets,
  ShieldAlert,
  Skull,
  Filter,
  Plus,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const TYPES: OperationType[] = [
  "weighing",
  "cage_change",
  "water_change",
  "isolation",
  "death",
];

const ICONS: Record<OperationType, any> = {
  weighing: Scale,
  cage_change: RefreshCw,
  water_change: Droplets,
  isolation: ShieldAlert,
  death: Skull,
};

const COLORS: Record<OperationType, string> = {
  weighing: "text-primary-600 bg-primary-50",
  cage_change: "text-blue-600 bg-blue-50",
  water_change: "text-cyan-600 bg-cyan-50",
  isolation: "text-warning-600 bg-warning-50",
  death: "text-danger-600 bg-danger-50",
};

export default function OperationRecords() {
  const cages = useStore((s) => s.cages);
  const records = useStore((s) => s.operationRecords);
  const addOperationRecord = useStore((s) => s.addOperationRecord);

  const [filterType, setFilterType] = useState<OperationType | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: "weighing" as OperationType,
    cageId: cages[0]?.id || "",
    weight: "",
    fromCage: "",
    toCage: "",
    isolationReason: "",
    deathReason: "",
    operator: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    const list =
      filterType === "all"
        ? records
        : records.filter((r) => r.type === filterType);
    return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [records, filterType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cage = cages.find((c) => c.id === form.cageId);
    const base: any = {
      type: form.type,
      cageId: form.cageId,
      operator: form.operator || "管理员",
      notes: form.notes || undefined,
    };
    if (form.type === "weighing") base.weight = parseFloat(form.weight);
    if (form.type === "cage_change") {
      base.fromCage = form.fromCage || cage?.cageNumber;
      base.toCage = form.toCage || cage?.cageNumber;
    }
    if (form.type === "water_change") base.waterChanged = true;
    if (form.type === "isolation") base.isolationReason = form.isolationReason;
    if (form.type === "death") base.deathReason = form.deathReason;
    addOperationRecord(base);
    setShowAdd(false);
    setForm({
      type: "weighing",
      cageId: cages[0]?.id || "",
      weight: "",
      fromCage: "",
      toCage: "",
      isolationReason: "",
      deathReason: "",
      operator: "",
      notes: "",
    });
  }

  const typeStats = TYPES.map((t) => ({
    type: t,
    count: records.filter((r) => r.type === t).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">操作记录中心</h1>
          <p className="text-sm text-slate-500 mt-1">
            称重、换笼、换水、隔离、死亡等特殊操作记录，共 {records.length} 条
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> 新增记录
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={() => setFilterType("all")}
          className={`card p-4 transition-all ${
            filterType === "all" ? "ring-2 ring-primary-500 bg-primary-50/30" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">全部记录</p>
              <p className="text-xl font-bold font-mono text-slate-900">{records.length}</p>
            </div>
          </div>
        </button>
        {typeStats.map(({ type, count }) => {
          const Icon = ICONS[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`card p-4 transition-all text-left ${
                filterType === type ? "ring-2 ring-primary-500 bg-primary-50/30" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${COLORS[type]} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{OPERATION_TYPE_LABEL[type]}</p>
                  <p className="text-xl font-bold font-mono text-slate-900">{count}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="暂无记录" description="该分类下还没有任何操作记录" />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((r, i) => {
            const cage = cages.find((c) => c.id === r.cageId);
            const Icon = ICONS[r.type];
            return (
              <div
                key={r.id}
                className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${COLORS[r.type]} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {OPERATION_TYPE_LABEL[r.type]}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600 font-mono text-[11px]">
                      {cage?.cageNumber}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600 text-[11px]">
                      {cage && SPECIES_LABEL[cage.species]}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-0.5">
                    {r.type === "weighing" && r.weight && (
                      <p>体重：<span className="font-mono font-medium">{r.weight} g</span></p>
                    )}
                    {r.type === "cage_change" && (
                      <p>
                        {r.fromCage} <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" /> {r.toCage}
                      </p>
                    )}
                    {r.type === "water_change" && (
                      <p>已完成换水</p>
                    )}
                    {r.type === "isolation" && r.isolationReason && (
                      <p>隔离原因：{r.isolationReason}</p>
                    )}
                    {r.type === "death" && r.deathReason && (
                      <p>死亡原因：{r.deathReason}</p>
                    )}
                    {r.notes && <p className="text-slate-500">备注：{r.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {r.operator}
                    </span>
                    <span>{formatDateTime(r.createdAt)}</span>
                  </div>
                </div>
                {cage && (
                  <Link
                    to={`/cages/${cage.id}`}
                    className="shrink-0 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    查看档案
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="新增操作记录"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              确认提交
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">记录类型 *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as OperationType })}
                className="input"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {OPERATION_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">笼盒/鱼缸 *</label>
              <select
                value={form.cageId}
                onChange={(e) => setForm({ ...form, cageId: e.target.value })}
                className="input"
              >
                {cages.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cageNumber} - {SPECIES_LABEL[c.species]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.type === "weighing" && (
            <div>
              <label className="label">体重 (g) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="input"
                placeholder="输入平均体重"
              />
            </div>
          )}

          {form.type === "cage_change" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">原笼盒编号</label>
                <input
                  value={form.fromCage}
                  onChange={(e) => setForm({ ...form, fromCage: e.target.value })}
                  className="input font-mono"
                  placeholder="留空则使用当前笼盒"
                />
              </div>
              <div>
                <label className="label">新笼盒编号</label>
                <input
                  value={form.toCage}
                  onChange={(e) => setForm({ ...form, toCage: e.target.value })}
                  className="input font-mono"
                  placeholder="留空则使用当前笼盒"
                />
              </div>
            </div>
          )}

          {form.type === "isolation" && (
            <div>
              <label className="label">隔离原因 *</label>
              <textarea
                required
                value={form.isolationReason}
                onChange={(e) => setForm({ ...form, isolationReason: e.target.value })}
                rows={3}
                className="input resize-none"
              />
            </div>
          )}

          {form.type === "death" && (
            <div>
              <label className="label">死亡原因 *</label>
              <textarea
                required
                value={form.deathReason}
                onChange={(e) => setForm({ ...form, deathReason: e.target.value })}
                rows={3}
                className="input resize-none"
              />
            </div>
          )}

          <div>
            <label className="label">操作人</label>
            <input
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
              className="input"
              placeholder="默认为管理员"
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="input resize-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
