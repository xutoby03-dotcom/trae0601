import { useState } from "react";
import {
  Plus,
  AlertCircle,
  Clock,
  User,
  Building2,
  Check,
  X,
  Play,
  MapPin,
} from "lucide-react";
import { useStore } from "@/store";
import { Issue, IssueStatus, ISSUE_STATUS_LABELS } from "@/types";
import { formatDate, daysUntilDeadline, isOverdue, generateId } from "@/utils/date";

const STATUS_COLUMNS: { status: IssueStatus; title: string; color: string }[] = [
  { status: "pending", title: "待处理", color: "from-amber-500 to-amber-600" },
  { status: "processing", title: "处理中", color: "from-forest-500 to-forest-600" },
  { status: "closed", title: "已闭环", color: "from-gray-400 to-gray-500" },
];

export default function IssueTrack() {
  const plants = useStore((s) => s.plants);
  const issues = useStore((s) => s.issues);
  const staffs = useStore((s) => s.staffs);
  const suppliers = useStore((s) => s.suppliers);
  const reminders = useStore((s) => s.reminders);
  const markReminderRead = useStore((s) => s.markReminderRead);
  const addIssue = useStore((s) => s.addIssue);
  const updateIssueStatus = useStore((s) => s.updateIssueStatus);

  const [showNew, setShowNew] = useState(false);
  const [newIssue, setNewIssue] = useState({
    plantId: "",
    type: "",
    description: "",
    assignedTo: staffs[0]?.id || "",
    responsibleSupplierId: suppliers[0]?.id || "",
    deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10),
  });

  const handleCreateIssue = () => {
    if (!newIssue.plantId || !newIssue.type) return;
    addIssue(newIssue);
    setShowNew(false);
    setNewIssue({
      plantId: "",
      type: "",
      description: "",
      assignedTo: staffs[0]?.id || "",
      responsibleSupplierId: suppliers[0]?.id || "",
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
    });
  };

  const unreadReminders = reminders.filter((r) => !r.read);

  const renderIssueCard = (issue: Issue) => {
    const plant = plants.find((p) => p.id === issue.plantId);
    const assigned = staffs.find((s) => s.id === issue.assignedTo);
    const supplier = suppliers.find((s) => s.id === issue.responsibleSupplierId);
    const daysLeft = daysUntilDeadline(issue.deadline);
    const overdue = isOverdue(issue.deadline);

    return (
      <div
        key={issue.id}
        className="bg-white rounded-xl p-4 shadow-card border border-forest-50 hover:shadow-card-hover transition-all card-hover"
      >
        <div className="flex items-start justify-between mb-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
              overdue
                ? "bg-red-100 text-red-700"
                : daysLeft <= 2
                ? "bg-amber-100 text-amber-700"
                : "bg-forest-50 text-forest-700"
            }`}
          >
            {issue.type}
          </span>
          {issue.status !== "closed" && (
            <span
              className={`text-xs font-medium ${overdue ? "text-red-600" : "text-forest-500"}`}
            >
              {overdue ? `已逾期 ${Math.abs(daysLeft)} 天` : `剩余 ${daysLeft} 天`}
            </span>
          )}
        </div>

        {plant && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-cream-100">
              <img src={plant.photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-forest-800">{plant.species}</p>
              <p className="text-xs text-forest-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {plant.location}
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-forest-600 mb-3 line-clamp-2">{issue.description}</p>

        <div className="flex items-center gap-3 text-xs text-forest-500 mb-3 pb-3 border-b border-forest-50">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {assigned?.name}
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {supplier?.name?.slice(0, 6)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(issue.deadline)}
          </div>
        </div>

        {issue.status !== "closed" && (
          <div className="flex gap-2">
            {issue.status === "pending" && (
              <button
                onClick={() => updateIssueStatus(issue.id, "processing")}
                className="flex-1 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-700 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3" />
                开始处理
              </button>
            )}
            {issue.status === "processing" && (
              <button
                onClick={() => updateIssueStatus(issue.id, "closed")}
                className="flex-1 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" />
                闭环完成
              </button>
            )}
          </div>
        )}
        {issue.status === "closed" && issue.closedAt && (
          <p className="text-xs text-forest-400 text-center">
            于 {formatDate(issue.closedAt)} 闭环
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {unreadReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-amber-warning" />
            <h3 className="font-semibold text-forest-800">提醒中心</h3>
            <span className="px-2 py-0.5 bg-amber-warning text-white text-xs rounded-full font-medium">
              {unreadReminders.length} 条未读
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {unreadReminders.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => markReminderRead(r.id)}
                className="text-left p-3 rounded-xl bg-white/70 hover:bg-white transition-colors"
              >
                <p className="text-sm font-medium text-forest-800">{r.title}</p>
                <p className="text-xs text-forest-500 mt-0.5 line-clamp-1">
                  {r.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {STATUS_COLUMNS.map(({ status, title, color }) => {
            const count = issues.filter((i) => i.status === status).length;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color}`} />
                <span className="text-sm text-forest-600">
                  {title}{" "}
                  <span className="font-semibold text-forest-800">{count}</span>
                </span>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          新建问题
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {STATUS_COLUMNS.map(({ status, title, color }) => (
          <div key={status} className="bg-cream-50 rounded-2xl p-4 min-h-[500px]">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${color}`} />
              <h3 className="font-semibold text-forest-800">{title}</h3>
              <span className="ml-auto px-2 py-0.5 bg-white rounded-full text-xs text-forest-600">
                {issues.filter((i) => i.status === status).length}
              </span>
            </div>
            <div className="space-y-3">
              {issues
                .filter((i) => i.status === status)
                .map(renderIssueCard)}
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-forest-900/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-forest-50 bg-gradient-to-r from-cream-50 to-cream-100 flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-forest-800">
                新建问题记录
              </h3>
              <button
                onClick={() => setShowNew(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-forest-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  选择绿植 *
                </label>
                <select
                  value={newIssue.plantId}
                  onChange={(e) => setNewIssue({ ...newIssue, plantId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                >
                  <option value="">请选择...</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.species} - {p.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  问题类型 *
                </label>
                <input
                  type="text"
                  value={newIssue.type}
                  onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                  placeholder="如：叶片枯黄、病虫害、生长不良..."
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  问题描述
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">
                    指派人员
                  </label>
                  <select
                    value={newIssue.assignedTo}
                    onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                  >
                    {staffs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">
                    责任供应商
                  </label>
                  <select
                    value={newIssue.responsibleSupplierId}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, responsibleSupplierId: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  处理截止日
                </label>
                <input
                  type="date"
                  value={newIssue.deadline}
                  onChange={(e) => setNewIssue({ ...newIssue, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-forest-200 bg-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-forest-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowNew(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleCreateIssue} className="btn btn-primary">
                创建问题
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
