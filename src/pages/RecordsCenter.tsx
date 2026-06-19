import { useState } from "react";
import { Plus, Scissors, RefreshCw, AlertTriangle, Sparkles, Check, Clock, Edit2, Filter } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatDateTime } from "@/utils/formatters";
import type { RecordType, RecordStatus } from "@/types";

const RECORD_TABS: (RecordType | "全部")[] = ["全部", "改衣", "换码", "遗失", "归还清洗"];

const RECORD_ICONS: Record<RecordType, typeof Scissors> = {
  "改衣": Scissors,
  "换码": RefreshCw,
  "遗失": AlertTriangle,
  "归还清洗": Sparkles,
};

const RECORD_COLORS: Record<RecordType, string> = {
  "改衣": "bg-amber-100 text-amber-700 border-amber-200",
  "换码": "bg-blue-100 text-blue-700 border-blue-200",
  "遗失": "bg-red-100 text-red-700 border-red-200",
  "归还清洗": "bg-green-100 text-green-700 border-green-200",
};

const STATUS_COLORS: Record<RecordStatus, string> = {
  "待处理": "bg-red-100 text-red-700",
  "处理中": "bg-amber-100 text-amber-700",
  "已完成": "bg-green-100 text-green-700",
};

export default function RecordsCenter() {
  const { processRecords, addProcessRecord, updateProcessRecord, students, clothingItems } = useAppStore();
  const [activeTab, setActiveTab] = useState<RecordType | "全部">("全部");
  const [statusFilter, setStatusFilter] = useState<RecordStatus | "全部">("全部");
  const [showModal, setShowModal] = useState(false);

  const filtered = processRecords
    .filter((r) => activeTab === "全部" || r.type === activeTab)
    .filter((r) => statusFilter === "全部" || r.status === statusFilter)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    addProcessRecord({
      type: formData.get("type") as RecordType,
      studentId: formData.get("studentId") as string,
      clothingId: formData.get("clothingId") as string || undefined,
      description: formData.get("description") as string,
      status: formData.get("status") as RecordStatus,
      operator: "李老师",
    });

    setShowModal(false);
  };

  const stats = [
    { type: "改衣" as RecordType, count: processRecords.filter((r) => r.type === "改衣" && r.status !== "已完成").length },
    { type: "换码" as RecordType, count: processRecords.filter((r) => r.type === "换码" && r.status !== "已完成").length },
    { type: "遗失" as RecordType, count: processRecords.filter((r) => r.type === "遗失" && r.status !== "已完成").length },
    { type: "归还清洗" as RecordType, count: processRecords.filter((r) => r.type === "归还清洗" && r.status !== "已完成").length },
  ];

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ type, count }) => {
          const Icon = RECORD_ICONS[type];
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`p-5 rounded-2xl text-left transition-all border-2 ${
                activeTab === type
                  ? RECORD_COLORS[type].split(" ")[0] + " " + RECORD_COLORS[type].split(" ")[1] + " " + RECORD_COLORS[type].split(" ")[2]
                  : "bg-white border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  activeTab === type ? "bg-white/50" : RECORD_COLORS[type].split(" ")[0]
                }`}>
                  <Icon className={`w-5 h-5 ${activeTab === type ? "" : RECORD_COLORS[type].split(" ")[1]}`} />
                </div>
                <span className={`text-3xl font-display font-bold ${
                  activeTab === type ? "" : "text-slate-900"
                }`}>{count}</span>
              </div>
              <p className={`text-sm font-medium mt-3 ${activeTab === type ? "" : "text-slate-600"}`}>
                待处理{type}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {RECORD_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "tab-btn-active" : "tab-btn"}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RecordStatus | "全部")}
              className="input-field !w-auto !py-2 text-sm"
            >
              <option value="全部">全部状态</option>
              <option value="待处理">待处理</option>
              <option value="处理中">处理中</option>
              <option value="已完成">已完成</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            新增记录
          </button>
        </div>
      </div>

      <div className="card-static overflow-hidden">
        <div className="max-h-[650px] overflow-y-auto">
          {filtered.length > 0 ? (
            <div className="p-6">
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-200 via-slate-200 to-transparent" />
                <div className="space-y-4">
                  {filtered.map((r, i) => {
                    const Icon = RECORD_ICONS[r.type];
                    const student = students.find((s) => s.id === r.studentId);
                    const clothing = clothingItems.find((c) => c.id === r.clothingId);
                    return (
                      <div key={r.id} className="relative pl-16 animate-fade-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className={`absolute left-0 top-0 w-11 h-11 rounded-2xl ${RECORD_COLORS[r.type]} border flex items-center justify-center shadow-md`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="card p-5">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`badge ${RECORD_COLORS[r.type]}`}>{r.type}</span>
                              <span className={`badge ${STATUS_COLORS[r.status]}`}>
                                {r.status === "待处理" && <Clock className="w-3 h-3 mr-1" />}
                                {r.status === "已完成" && <Check className="w-3 h-3 mr-1" />}
                                {r.status}
                              </span>
                              {student && (
                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <span className="text-[10px] font-semibold text-primary-700">{student.name[0]}</span>
                                  </div>
                                  {student.name}
                                </span>
                              )}
                              {clothing && (
                                <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                  {clothing.photoUrl ? (
                                    <div className="w-5 h-5 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                                      <img
                                        src={clothing.photoUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : null}
                                  · {clothing.category} {clothing.size}码
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                const nextStatus: Record<RecordStatus, RecordStatus> = {
                                  "待处理": "处理中",
                                  "处理中": "已完成",
                                  "已完成": "待处理",
                                };
                                updateProcessRecord(r.id, { status: nextStatus[r.status] });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              title="切换状态"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-slate-700 mb-3">{r.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                            <span>{formatDateTime(r.createdAt)}</span>
                            <span>操作人：{r.operator}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <Check className="w-16 h-16 mx-auto text-green-300 mb-4" />
              <p className="text-slate-500">暂无记录</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card-static w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-6">新增流程记录</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">记录类型</label>
                  <select name="type" defaultValue="改衣" className="input-field" required>
                    <option value="改衣">改衣</option>
                    <option value="换码">换码</option>
                    <option value="遗失">遗失</option>
                    <option value="归还清洗">归还清洗</option>
                  </select>
                </div>
                <div>
                  <label className="label">状态</label>
                  <select name="status" defaultValue="待处理" className="input-field" required>
                    <option value="待处理">待处理</option>
                    <option value="处理中">处理中</option>
                    <option value="已完成">已完成</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">关联学生</label>
                <select name="studentId" defaultValue="" className="input-field">
                  <option value="">不关联学生</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className} · {s.voicePart})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">关联服装（可选）</label>
                <select name="clothingId" defaultValue="" className="input-field">
                  <option value="">不关联服装</option>
                  {clothingItems.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category} {c.size}码 {c.setNumber ? `(${c.setNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">详细描述</label>
                <textarea
                  name="description"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="请描述具体情况..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  创建记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
