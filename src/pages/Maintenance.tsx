import { useState, useMemo } from "react";
import { useStore } from "@/store";
import {
  formatDate,
  formatCurrency,
  priorityLabel,
  priorityColor,
} from "@/utils/format";
import {
  Wrench,
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Play,
  ChevronRight,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import type { MaintenanceType, MaintenanceStatus, MaintenanceRecord } from "@/types";

type TabKey = "repair" | "purchase" | "completed";

const TABS: { key: TabKey; label: string; icon: typeof Wrench }[] = [
  { key: "repair", label: "待维修", icon: Wrench },
  { key: "purchase", label: "待补购", icon: ShoppingCart },
  { key: "completed", label: "已完成", icon: CheckCircle },
];

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  pending: "待处理",
  in_progress: "处理中",
  completed: "已完成",
};

const STATUS_COLOR: Record<MaintenanceStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-sky2-100 text-sky2-700",
  completed: "bg-forest-100 text-forest-700",
};

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState<TabKey>("repair");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<MaintenanceType>("repair");
  const [newEquipmentId, setNewEquipmentId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<1 | 2 | 3>(2);
  const [newEstimatedCost, setNewEstimatedCost] = useState<string>("");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [actualCost, setActualCost] = useState<string>("");

  const maintenance = useStore((s) => s.maintenance);
  const equipment = useStore((s) => s.equipment);
  const addMaintenance = useStore((s) => s.addMaintenance);
  const updateMaintenance = useStore((s) => s.updateMaintenance);
  const completeMaintenance = useStore((s) => s.completeMaintenance);
  const deleteMaintenance = useStore((s) => s.deleteMaintenance);

  const getEquipment = (id: string | undefined) =>
    id ? equipment.find((e) => e.id === id) : undefined;

  const repairList = useMemo(
    () => maintenance.filter((m) => m.type === "repair" && m.status !== "completed"),
    [maintenance]
  );
  const purchaseList = useMemo(
    () => maintenance.filter((m) => m.type === "purchase" && m.status !== "completed"),
    [maintenance]
  );
  const completedList = useMemo(
    () => maintenance.filter((m) => m.status === "completed"),
    [maintenance]
  );

  const availableEquipment = useMemo(
    () => equipment.filter((e) => e.status === "available"),
    [equipment]
  );

  const currentList = useMemo(() => {
    if (activeTab === "repair") return repairList;
    if (activeTab === "purchase") return purchaseList;
    return completedList;
  }, [activeTab, repairList, purchaseList, completedList]);

  const counts = {
    repair: repairList.length,
    purchase: purchaseList.length,
    completed: completedList.length,
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addMaintenance({
      type: newType,
      equipmentId: newEquipmentId || undefined,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: "pending",
      estimatedCost: newEstimatedCost ? Number(newEstimatedCost) : undefined,
    });
    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setNewType("repair");
    setNewEquipmentId("");
    setNewTitle("");
    setNewDescription("");
    setNewPriority(2);
    setNewEstimatedCost("");
  };

  const nextStatus = (status: MaintenanceStatus): MaintenanceStatus | null => {
    if (status === "pending") return "in_progress";
    if (status === "in_progress") return "completed";
    return null;
  };

  const handleStatusNext = (record: MaintenanceRecord) => {
    const next = nextStatus(record.status);
    if (next === "completed") {
      setCompletingId(record.id);
      setActualCost(record.estimatedCost?.toString() || "");
    } else if (next) {
      updateMaintenance(record.id, { status: next });
    }
  };

  const handleConfirmComplete = () => {
    if (!completingId) return;
    completeMaintenance(
      completingId,
      actualCost ? Number(actualCost) : undefined
    );
    setCompletingId(null);
    setActualCost("");
  };

  const themeConfig = (type: MaintenanceType) => {
    if (type === "repair") {
      return {
        borderColor: "border-orange-200/80",
        topBar: "bg-gradient-to-r from-orange-400 to-red-400",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
      };
    }
    return {
      borderColor: "border-amber-200/80",
      topBar: "bg-gradient-to-r from-amber-400 to-amber-300",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    };
  };

  const statusButtonConfig = (status: MaintenanceStatus) => {
    if (status === "pending") {
      return { label: "开始处理", icon: Play, variant: "btn-sky" as const };
    }
    if (status === "in_progress") {
      return { label: "标记完成", icon: CheckCircle, variant: "btn-primary" as const };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-forest-800">
              维修补购
            </h1>
            <p className="text-sm text-forest-500">
              待维修 {counts.repair} 件 · 待补购 {counts.purchase} 件
            </p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          新增记录
        </button>
      </div>

      {showAddForm && (
        <div className="card p-5 animate-fade-in-up">
          <h3 className="font-semibold text-forest-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            新增维修/补购记录
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewType("repair")}
                  className={`flex-1 btn ${
                    newType === "repair"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  维修
                </button>
                <button
                  onClick={() => setNewType("purchase")}
                  className={`flex-1 btn ${
                    newType === "purchase"
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  补购
                </button>
              </div>
            </div>
            <div>
              <label className="label">关联装备（可选）</label>
              <select
                value={newEquipmentId}
                onChange={(e) => setNewEquipmentId(e.target.value)}
                className="input"
              >
                <option value="">-- 不关联装备 --</option>
                {availableEquipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">标题</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="简要描述问题"
                className="input"
              />
            </div>
            <div>
              <label className="label">优先级</label>
              <div className="flex gap-2">
                {[
                  { v: 1, label: "高", cls: "bg-red-100 text-red-600 hover:bg-red-200" },
                  { v: 2, label: "中", cls: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
                  { v: 3, label: "低", cls: "bg-forest-100 text-forest-700 hover:bg-forest-200" },
                ].map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setNewPriority(p.v as 1 | 2 | 3)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all border-2 ${
                      newPriority === p.v
                        ? `${p.cls} border-current`
                        : "bg-white text-forest-600 border-forest-200 hover:bg-forest-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">详细描述</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="描述损坏情况、补购需求等..."
                rows={3}
                className="input resize-none"
              />
            </div>
            <div>
              <label className="label">预估费用（元，可选）</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={newEstimatedCost}
                  onChange={(e) => setNewEstimatedCost(e.target.value)}
                  placeholder="0"
                  className="input pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="btn btn-primary"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-white/60 rounded-xl border border-forest-100">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-white text-forest-800 shadow-soft"
                  : "text-forest-500 hover:text-forest-700 hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className={`badge text-xs ${
                    isActive
                      ? tab.key === "completed"
                        ? "bg-forest-100 text-forest-700"
                        : tab.key === "repair"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-amber-100 text-amber-700"
                      : "bg-forest-100 text-forest-600"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {currentList.length === 0 ? (
        <div className="card p-12 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              activeTab === "repair"
                ? "bg-orange-50"
                : activeTab === "purchase"
                ? "bg-amber-50"
                : "bg-forest-50"
            }`}
          >
            {activeTab === "repair" && (
              <Wrench className="w-8 h-8 text-orange-400" />
            )}
            {activeTab === "purchase" && (
              <ShoppingCart className="w-8 h-8 text-amber-400" />
            )}
            {activeTab === "completed" && (
              <CheckCircle className="w-8 h-8 text-forest-400" />
            )}
          </div>
          <h3 className="font-semibold text-forest-800 mb-1">
            {activeTab === "repair" && "暂无待维修记录"}
            {activeTab === "purchase" && "暂无待补购记录"}
            {activeTab === "completed" && "暂无已完成记录"}
          </h3>
          <p className="text-sm text-forest-500">
            {activeTab === "completed"
              ? "处理完成的记录会出现在这里"
              : "点击右上角新增记录开始管理"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((record) => {
            const eq = getEquipment(record.equipmentId);
            const theme = themeConfig(record.type);
            const btnCfg = statusButtonConfig(record.status);
            const isCompleting = completingId === record.id;

            return (
              <div
                key={record.id}
                className={`card animate-fade-in-up border ${theme.borderColor}`}
              >
                <div className={`h-1.5 ${theme.topBar}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`badge ${priorityColor(record.priority)}`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {priorityLabel(record.priority)}优先级
                        </span>
                        <span className={`badge ${STATUS_COLOR[record.status]}`}>
                          <Clock className="w-3 h-3" />
                          {STATUS_LABEL[record.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-forest-800 leading-snug">
                        {record.title}
                      </h3>
                      {eq && (
                        <div
                          className={`inline-flex items-center gap-1.5 mt-1.5 text-sm`}
                        >
                          <span className={theme.iconColor}>
                            {record.type === "repair" ? (
                              <Wrench className="w-4 h-4" />
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </span>
                          <span className="text-forest-600">{eq.name}</span>
                          <span className="text-forest-400 text-xs">
                            ({eq.code})
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("确定删除这条记录吗？")) {
                          deleteMaintenance(record.id);
                        }
                      }}
                      className="p-2 rounded-lg text-forest-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {record.description && (
                    <p className="text-sm text-forest-600 mb-3 line-clamp-2 leading-relaxed">
                      {record.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-forest-500">
                      <Clock className="w-4 h-4 text-forest-400" />
                      {formatDate(record.createdAt)}
                    </div>
                    {record.estimatedCost !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-forest-400" />
                        <span className="text-forest-600">
                          预估：
                          <span className="font-semibold text-forest-800">
                            {formatCurrency(record.estimatedCost)}
                          </span>
                        </span>
                      </div>
                    )}
                    {activeTab === "completed" && record.actualCost !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-forest-500" />
                        <span className="text-forest-600">
                          实际：
                          <span className="font-semibold text-forest-800">
                            {formatCurrency(record.actualCost)}
                          </span>
                        </span>
                      </div>
                    )}
                    {activeTab === "completed" && record.completedAt && (
                      <div className="flex items-center gap-1.5 text-forest-500">
                        <CheckCircle className="w-4 h-4 text-forest-500" />
                        {formatDate(record.completedAt)} 完成
                      </div>
                    )}
                  </div>

                  {isCompleting ? (
                    <div className="p-4 rounded-xl bg-forest-50/80 border border-forest-100 space-y-3">
                      <div>
                        <label className="label">实际费用（元）</label>
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            value={actualCost}
                            onChange={(e) => setActualCost(e.target.value)}
                            placeholder="0"
                            className="input pl-9"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setCompletingId(null);
                            setActualCost("");
                          }}
                          className="btn btn-secondary !py-1.5 !px-3 text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleConfirmComplete}
                          className="btn btn-primary !py-1.5 !px-3 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          确认完成
                        </button>
                      </div>
                    </div>
                  ) : activeTab !== "completed" && btnCfg ? (
                    <div className="flex items-center justify-between pt-3 border-t border-forest-100">
                      <span className="text-xs text-forest-400 flex items-center gap-1">
                        {btnCfg.label}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusNext(record)}
                          className={`btn ${btnCfg.variant} !py-1.5 !px-4 text-sm`}
                        >
                          <btnCfg.icon className="w-4 h-4" />
                          {btnCfg.label}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
