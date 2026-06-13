import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  AlertTriangle,
  User,
  Clock,
  Wrench,
  Package,
  ThumbsUp,
  Trash2,
  CheckCircle2,
  X,
  Send,
  ClipboardList,
} from "lucide-react";
import { useRepairStore } from "@/store/repairStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import { type RepairStatus, STATUS_META } from "@/types";
import { sortRepairsByPriority } from "@/utils/priority";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

interface KanbanColumnConfig {
  key: "pending" | "processing" | "waiting_parts";
  title: string;
  icon: typeof ClipboardList;
  badgeClass: string;
  cardActions: {
    to: RepairStatus;
    label: string;
    icon: typeof Wrench;
    btnClass: string;
  }[];
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    key: "pending",
    title: "待接单",
    icon: ClipboardList,
    badgeClass: "bg-amber-500",
    cardActions: [
      { to: "processing", label: "接单", icon: Wrench, btnClass: "btn-primary" },
    ],
  },
  {
    key: "processing",
    title: "处理中",
    icon: Wrench,
    badgeClass: "bg-blue-600",
    cardActions: [
      { to: "waiting_parts", label: "需配件", icon: Package, btnClass: "btn-warning" },
      { to: "completed", label: "修好", icon: ThumbsUp, btnClass: "btn-success" },
      { to: "scrapped", label: "报废", icon: Trash2, btnClass: "btn-danger" },
    ],
  },
  {
    key: "waiting_parts",
    title: "待配件",
    icon: Package,
    badgeClass: "bg-violetpurple-500",
    cardActions: [
      { to: "processing", label: "配件到位", icon: CheckCircle2, btnClass: "btn-primary" },
      { to: "scrapped", label: "报废", icon: Trash2, btnClass: "btn-danger" },
    ],
  },
];

interface ActionModalProps {
  open: boolean;
  repairId: string;
  targetStatus: RepairStatus;
  onClose: () => void;
  onConfirm: (repairId: string, targetStatus: RepairStatus, note: string) => void;
}

function ActionModal({
  open,
  repairId,
  targetStatus,
  onClose,
  onConfirm,
}: ActionModalProps) {
  const [note, setNote] = useState("");
  const statusMeta = STATUS_META[targetStatus];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-walnut-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-card-hover w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold text-walnut-800 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm font-semibold",
                statusMeta.bgColor,
                statusMeta.color
              )}
            >
              {statusMeta.label}
            </span>
            处理说明
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-walnut-100 text-walnut-400 hover:text-walnut-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-3 text-xs text-walnut-500 bg-walnut-50 px-3 py-2 rounded-lg">
          报修单: {repairId}
        </div>

        <textarea
          placeholder="请输入处理说明，如：已更换琴弦，调音完毕..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="input resize-none mb-4"
          autoFocus
        />

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={() => {
              onConfirm(repairId, targetStatus, note.trim());
              setNote("");
            }}
            disabled={!note.trim()}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Workbench() {
  const navigate = useNavigate();
  const repairOrders = useRepairStore((s) => s.repairOrders);
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const getRepairsGroupedByStatus = useRepairStore(
    (s) => s.getRepairsGroupedByStatus
  );
  const updateStatus = useRepairStore((s) => s.updateStatus);
  const canTransition = useRepairStore((s) => s.canTransition);
  const getInstrumentById = useInstrumentStore((s) => s.getInstrumentById);
  const getUserById = useUserStore((s) => s.getUserById);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );
  const grouped = useMemo(
    () => getRepairsGroupedByStatus(),
    [repairOrders, getRepairsGroupedByStatus]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    repairId: string;
    targetStatus: RepairStatus;
  } | null>(null);

  const handleCardAction = (repairId: string, targetStatus: RepairStatus) => {
    setModalState({ repairId, targetStatus });
    setModalOpen(true);
  };

  const confirmAction = (
    repairId: string,
    targetStatus: RepairStatus,
    note: string
  ) => {
    if (!currentUser) return;
    const success = updateStatus({
      repairId,
      newStatus: targetStatus,
      handlerId: currentUser.id,
      note,
    });
    if (success) {
      setModalOpen(false);
      setModalState(null);
    }
  };

  const sortedData = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      ...col,
      items: sortRepairsByPriority(grouped[col.key]),
    }));
  }, [grouped]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-3xl font-bold text-walnut-800 flex items-center gap-2">
              <Wrench className="w-7 h-7" />
              维修工作台
            </h1>
            <p className="mt-1 text-sm text-walnut-500">
              拖动或点击卡片处理报修，快速响应维修任务
            </p>
          </div>
          <button
            onClick={() => navigate("/repairs")}
            className="btn-secondary"
          >
            <ClipboardList className="w-4 h-4" />
            查看完整列表
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {sortedData.map((col) => {
            const ColIcon = col.icon;
            return (
              <div
                key={col.key}
                className="rounded-2xl bg-walnut-50/60 border border-walnut-100 p-4 min-h-[calc(100vh-220px)] flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-walnut-100/80">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md",
                        col.badgeClass
                      )}
                    >
                      <ColIcon className="w-4.5 h-4.5" />
                    </div>
                    <h2 className="font-serif text-lg font-semibold text-walnut-800">
                      {col.title}
                    </h2>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-bold text-white shadow-sm min-w-[32px] text-center",
                      col.badgeClass
                    )}
                  >
                    {col.items.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                  {col.items.length === 0 ? (
                    <div className="py-12 text-center text-walnut-400">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-walnut-100/60 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">暂无任务</p>
                      <p className="text-xs mt-0.5 text-walnut-300">
                        {col.title}队列已清空
                      </p>
                    </div>
                  ) : (
                    col.items.map((order) => {
                      const ins = getInstrumentById(order.instrumentId);
                      const reporter = getUserById(order.reporterId);

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-xl border border-walnut-100/80 shadow-card p-4 hover:shadow-card-hover transition-all group"
                        >
                          <div
                            className="cursor-pointer mb-3"
                            onClick={() => navigate(`/repairs/${order.id}`)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-walnut-800 leading-snug line-clamp-1 group-hover:text-walnut-600 transition-colors">
                                {ins?.type}
                                {ins?.brand ? ` · ${ins.brand}` : ""}
                              </h3>
                              {order.affectClass && (
                                <div className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-xs font-semibold text-white bg-brick-500 animate-urgent-blink">
                                  <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />
                                  急
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-3 h-3",
                                    i < order.impactLevel
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-walnut-200"
                                  )}
                                />
                              ))}
                              <span className="text-xs text-walnut-400 ml-1">
                                ({order.impactLevel})
                              </span>
                            </div>

                            <div className="space-y-1 text-xs text-walnut-500">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                <span>{reporter?.name || "未知"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-walnut-50">
                            {col.cardActions
                              .filter((a) =>
                                canTransition(order.status, a.to)
                              )
                              .map((action) => {
                                const ActIcon = action.icon;
                                const baseClass = action.btnClass.replace(
                                  "btn-",
                                  ""
                                );
                                return (
                                  <button
                                    key={action.to}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCardAction(order.id, action.to);
                                    }}
                                    className={cn(
                                      "inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm active:translate-y-[0.5px]",
                                      baseClass === "primary" &&
                                        "bg-walnut-600 text-white hover:bg-walnut-700",
                                      baseClass === "warning" &&
                                        "bg-amber-500 text-white hover:bg-amber-600",
                                      baseClass === "success" &&
                                        "bg-forest-500 text-white hover:bg-forest-600",
                                      baseClass === "danger" &&
                                        "bg-brick-500 text-white hover:bg-brick-600"
                                    )}
                                  >
                                    <ActIcon className="w-3 h-3" />
                                    {action.label}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ActionModal
        open={modalOpen}
        repairId={modalState?.repairId || ""}
        targetStatus={modalState?.targetStatus || "pending"}
        onClose={() => {
          setModalOpen(false);
          setModalState(null);
        }}
        onConfirm={confirmAction}
      />
    </div>
  );
}
