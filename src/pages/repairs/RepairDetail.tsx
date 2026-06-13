import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  AlertTriangle,
  User as UserIcon,
  Clock,
  MapPin,
  Music,
  Image,
  X,
  CheckCircle2,
  Clock3,
  Package,
  ThumbsUp,
  Trash2,
  Wrench,
  Send,
} from "lucide-react";
import { useRepairStore } from "@/store/repairStore";
import { useInstrumentStore } from "@/store/instrumentStore";
import { useUserStore } from "@/store/userStore";
import {
  STATUS_META,
  STATUS_FLOW,
  type RepairStatus,
  type RepairLog,
  type User,
} from "@/types";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";

const ACTION_CONFIG: Record<
  RepairStatus,
  { to: RepairStatus; label: string; icon: typeof CheckCircle2; btnClass: string }[]
> = {
  pending: [
    { to: "processing", label: "接单处理", icon: Wrench, btnClass: "btn-primary" },
  ],
  processing: [
    { to: "waiting_parts", label: "需配件", icon: Package, btnClass: "btn-warning" },
    { to: "completed", label: "已修好", icon: ThumbsUp, btnClass: "btn-success" },
    { to: "scrapped", label: "报废", icon: Trash2, btnClass: "btn-danger" },
  ],
  waiting_parts: [
    { to: "processing", label: "配件到位", icon: CheckCircle2, btnClass: "btn-primary" },
    { to: "scrapped", label: "报废", icon: Trash2, btnClass: "btn-danger" },
  ],
  completed: [],
  scrapped: [],
};

const TIMELINE_ICONS: Record<RepairStatus, typeof Clock3> = {
  pending: Clock3,
  processing: Wrench,
  waiting_parts: Package,
  completed: CheckCircle2,
  scrapped: Trash2,
};

interface StatusTimelineProps {
  logs: RepairLog[];
  getUserById: (id: string) => User | undefined;
}

function StatusTimeline({ logs, getUserById }: StatusTimelineProps) {
  return (
    <div className="space-y-0">
      {logs.map((log, index) => {
        const handler = getUserById(log.handlerId);
        const statusMeta = STATUS_META[log.toStatus];
        const TimelineIcon = TIMELINE_ICONS[log.toStatus];
        const isLast = index === logs.length - 1;

        return (
          <div key={log.id} className="relative pl-10 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-walnut-100" />
            )}
            <div
              className={cn(
                "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md",
                statusMeta.bgColor
              )}
            >
              <TimelineIcon
                className={cn("w-4 h-4", statusMeta.color)}
              />
            </div>

            <div className="pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold",
                    statusMeta.bgColor,
                    statusMeta.color
                  )}
                >
                  {statusMeta.label}
                </span>
                <span className="text-sm text-walnut-700 font-medium">
                  {log.fromStatus
                    ? `${STATUS_META[log.fromStatus].label} → ${statusMeta.label}`
                    : "创建报修单"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-walnut-500">
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {handler?.name || "未知处理人"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(log.createdAt)}
                </span>
              </div>
              {log.note && (
                <div className="mt-2 p-3 bg-walnut-50 rounded-xl text-sm text-walnut-700 leading-relaxed">
                  {log.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ActionModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

function ActionModal({ open, title, onClose, onConfirm }: ActionModalProps) {
  const [note, setNote] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-walnut-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-card-hover w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold text-walnut-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-walnut-100 text-walnut-400 hover:text-walnut-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          placeholder="请输入处理说明..."
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
              onConfirm(note.trim());
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

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repairOrders = useRepairStore((s) => s.repairOrders);
  const repairLogs = useRepairStore((s) => s.repairLogs);
  const instruments = useInstrumentStore((s) => s.instruments);
  const users = useUserStore((s) => s.users);
  const currentUserId = useUserStore((s) => s.currentUserId);
  const updateStatus = useRepairStore((s) => s.updateStatus);
  const canTransition = useRepairStore((s) => s.canTransition);
  const getRepairDetail = useRepairStore((s) => s.getRepairDetail);
  const getInstrumentById = useInstrumentStore((s) => s.getInstrumentById);
  const getUserById = useUserStore((s) => s.getUserById);

  const detail = useMemo(
    () => (id ? getRepairDetail(id) : undefined),
    [id, repairOrders, repairLogs, getRepairDetail]
  );
  const instrument = useMemo(
    () => (detail ? getInstrumentById(detail.instrumentId) : undefined),
    [detail, instruments, getInstrumentById]
  );
  const reporter = useMemo(
    () => (detail ? getUserById(detail.reporterId) : undefined),
    [detail, users, getUserById]
  );
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<RepairStatus | null>(null);

  if (!detail || !id) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost p-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="card flex flex-col items-center justify-center py-16 text-walnut-400">
            <Wrench className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium">报修单不存在</p>
            <p className="text-sm mt-1">请返回列表重新选择</p>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_META[detail.status];
  const availableActions = ACTION_CONFIG[detail.status].filter((a) =>
    canTransition(detail.status, a.to)
  );

  const handleAction = (targetStatus: RepairStatus) => {
    setPendingAction(targetStatus);
    setModalOpen(true);
  };

  const confirmAction = (note: string) => {
    if (!pendingAction || !currentUser) return;
    const success = updateStatus({
      repairId: id,
      newStatus: pendingAction,
      handlerId: currentUser.id,
      note,
    });
    if (success) {
      setModalOpen(false);
      setPendingAction(null);
    }
  };

  const actionTitle = pendingAction
    ? STATUS_META[pendingAction].label
    : "";

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost p-2 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-walnut-800 truncate">
                  报修单 {detail.id}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-semibold",
                    statusMeta.bgColor,
                    statusMeta.color
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      statusMeta.dotColor
                    )}
                  />
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-sm text-walnut-500 mt-0.5">
                创建于 {formatDate(detail.createdAt)}
                {detail.closedAt && ` · 结束于 ${formatDate(detail.closedAt)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <Music className="w-5 h-5" />
                乐器信息
              </h2>
              <div className="flex gap-4">
                <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-walnut-100">
                  {instrument?.photo ? (
                    <img
                      src={instrument.photo}
                      alt={instrument.type}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-10 h-10 text-walnut-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg text-walnut-800">
                      {instrument?.brand} {instrument?.type}
                    </h3>
                    {detail.affectClass && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-white bg-brick-500 animate-urgent-blink">
                        <AlertTriangle className="w-3 h-3" />
                        影响上课
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-walnut-600">
                      <MapPin className="w-4 h-4 text-walnut-400" />
                      {instrument?.classroom}
                    </div>
                    <div className="flex items-center gap-2 text-walnut-600">
                      <span className="text-walnut-400">编号:</span>
                      {instrument?.id}
                    </div>
                    <div className="flex items-center gap-2 col-span-full">
                      <span className="text-walnut-500 text-sm">影响等级:</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < detail.impactLevel
                                ? "text-amber-500 fill-amber-500"
                                : "text-walnut-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                报修信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-walnut-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-walnut-200 flex-shrink-0">
                    {reporter?.avatar ? (
                      <img
                        src={reporter.avatar}
                        alt={reporter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-walnut-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-walnut-800">
                      {reporter?.name || "未知报修人"}
                    </div>
                    <div className="text-xs text-walnut-500">
                      {reporter?.phone} · {formatDate(detail.createdAt)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-walnut-600 mb-2">
                    故障描述
                  </div>
                  <div className="p-4 bg-walnut-50 rounded-xl text-walnut-700 leading-relaxed whitespace-pre-wrap">
                    {detail.faultDescription}
                  </div>
                </div>

                {detail.faultPhoto && (
                  <div>
                    <div className="text-sm font-medium text-walnut-600 mb-2 flex items-center gap-1.5">
                      <Image className="w-4 h-4" />
                      故障照片
                    </div>
                    <div className="w-full max-w-xs rounded-xl overflow-hidden border-2 border-walnut-100">
                      <img
                        src={detail.faultPhoto}
                        alt="故障照片"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title mb-5 flex items-center gap-2">
                <Clock3 className="w-5 h-5" />
                处理时间线
              </h2>
              {detail.logs.length === 0 ? (
                <div className="py-8 text-center text-walnut-400 text-sm">
                  暂无处理记录
                </div>
              ) : (
                <StatusTimeline logs={detail.logs} getUserById={getUserById} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card sticky top-6">
              <h2 className="section-title mb-4">处理操作</h2>

              {availableActions.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-forest-500 mb-2 opacity-60" />
                  <p className="text-sm text-walnut-500">
                    {detail.status === "completed"
                      ? "该报修单已完成维修"
                      : "该报修单已标记为报废"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.to}
                        onClick={() => handleAction(action.to)}
                        className={cn("w-full justify-center", action.btnClass)}
                      >
                        <Icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    );
                  })}
                  {STATUS_FLOW[detail.status].length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-walnut-50 text-xs text-walnut-500">
                      <div className="font-medium text-walnut-600 mb-1">
                        状态流转规则
                      </div>
                      <div>
                        {STATUS_META[detail.status].label} →{" "}
                        {STATUS_FLOW[detail.status]
                          .map((s) => STATUS_META[s].label)
                          .join(" / ")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActionModal
        open={modalOpen}
        title={`确认${actionTitle}`}
        onClose={() => {
          setModalOpen(false);
          setPendingAction(null);
        }}
        onConfirm={confirmAction}
      />
    </div>
  );
}
