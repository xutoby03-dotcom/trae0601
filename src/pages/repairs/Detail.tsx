import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Building2,
  Clock,
  Calendar,
  Wrench,
  CheckCircle2,
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  PlayCircle,
  Send,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useRepairStore } from "../../store/repairStore";
import { useStationStore } from "../../store/stationStore";
import {
  REPAIR_ISSUE_LABELS,
  type RepairStatus,
} from "../../types";
import { RepairStatusBadge } from "../../components/ui/StatusBadge";
import { formatDateTime, formatRelative } from "../../utils/formatters";
import { clsx } from "clsx";

const mockTechnicians = ["张工", "李工", "王工", "赵工", "陈工"];

const statusFlowConfig: Record<
  RepairStatus,
  { nextStatus?: RepairStatus; nextLabel?: string; nextIcon?: typeof PlayCircle }
> = {
  pending: {
    nextStatus: "processing",
    nextLabel: "受理派单",
    nextIcon: Send,
  },
  processing: {
    nextStatus: "maintenance",
    nextLabel: "开始维修",
    nextIcon: PlayCircle,
  },
  maintenance: {
    nextStatus: "completed",
    nextLabel: "完成维修",
    nextIcon: CheckCircle2,
  },
  completed: undefined,
  cancelled: undefined,
};

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const tickets = useRepairStore((s: any) => s.tickets);
  const assignTicket = useRepairStore((s) => s.assignTicket);
  const updateTicketStatus = useRepairStore((s) => s.updateTicketStatus);
  const maintenances = useRepairStore((s: any) => s.maintenanceRecords);
  const stations = useStationStore((s: any) => s.stations);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const { ticket, station, maintenanceRecords } = useMemo(() => {
    const foundTicket = id ? tickets.find((t: any) => t.id === id) : undefined;
    const foundStation = foundTicket ? stations.find((s: any) => s.id === foundTicket.stationId) : undefined;
    const maintRecords = foundTicket ? maintenances.filter((m: any) => m.stationId === foundTicket.stationId) : [];
    maintRecords.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return { ticket: foundTicket, station: foundStation, maintenanceRecords: maintRecords };
  }, [id, tickets, stations, maintenances]);

  if (!ticket) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost !px-0 text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工单列表
        </button>
        <div className="card p-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-1">
            工单不存在
          </h2>
          <p className="text-sm text-slate-500">
            该工单可能已被删除或工单号无效
          </p>
        </div>
      </div>
    );
  }

  const flowConfig = statusFlowConfig[ticket.status];

  const handleAssign = () => {
    if (!selectedTechnician) return;
    assignTicket(ticket.id, selectedTechnician);
    setShowAssignModal(false);
    setSelectedTechnician("");
  };

  const handleStatusTransition = () => {
    if (!flowConfig?.nextStatus) return;

    if (ticket.status === "pending") {
      setShowAssignModal(true);
      return;
    }

    const noteMsg = ticket.status === "maintenance"
      ? resolutionNote || "维修完成，设备恢复正常"
      : note || undefined;

    updateTicketStatus(ticket.id, flowConfig.nextStatus, noteMsg);
    setNote("");
    setResolutionNote("");
    setShowNoteInput(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost !px-0 text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工单列表
        </button>
        <div className="flex items-center gap-2">
          {flowConfig && (
            <button
              onClick={handleStatusTransition}
              className={clsx(
                "!py-2 !px-4",
                ticket.status === "completed"
                  ? "btn-secondary"
                  : ticket.status === "maintenance"
                  ? "btn-success"
                  : "btn-primary"
              )}
            >
              {flowConfig.nextIcon &&
                (() => {
                  const Icon = flowConfig.nextIcon;
                  return <Icon className="w-4 h-4" />;
                })()}
              {flowConfig.nextLabel}
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="page-title !text-xl">{ticket.ticketNo}</h1>
              <span className="badge-primary">
                {REPAIR_ISSUE_LABELS[ticket.issueType]}
              </span>
              <RepairStatusBadge status={ticket.status} />
            </div>
            <p className="text-sm text-slate-500">
              工单创建于 {formatDateTime(ticket.createdAt)}（
              {formatRelative(ticket.createdAt)}）
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="section-title mb-3 flex items-center gap-2 text-base">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                问题描述
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {ticket.photos.length > 0 && (
              <div>
                <h3 className="section-title mb-3 flex items-center gap-2 text-base">
                  <ImageIcon className="w-4 h-4 text-primary-500" />
                  现场照片
                  <span className="text-xs text-slate-400 font-normal">
                    （共{ticket.photos.length}张）
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ticket.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <img
                        src={photo}
                        alt={`现场照片${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="section-title mb-4 flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-primary-500" />
                处理进度
              </h3>
              <div className="relative pl-2">
                <div className="space-y-0">
                  {ticket.timeline.map((item, index) => {
                    const isLast = index === ticket.timeline.length - 1;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={clsx(
                              "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all",
                              isLast
                                ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/25"
                                : "bg-white border-slate-200 text-slate-400"
                            )}
                          >
                            {index === 0 && <MessageSquare className="w-4 h-4" />}
                            {index === ticket.timeline.length - 1 &&
                              ticket.status === "completed" && (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            {index > 0 &&
                              index !== ticket.timeline.length - 1 && (
                                <Wrench className="w-4 h-4" />
                              )}
                            {index === ticket.timeline.length - 1 &&
                              ticket.status !== "completed" && (
                                <PlayCircle className="w-4 h-4" />
                              )}
                          </div>
                          {!isLast && (
                            <div
                              className={clsx(
                                "w-0.5 flex-1 min-h-10",
                                "bg-slate-200"
                              )}
                            />
                          )}
                        </div>
                        <div
                          className={clsx(
                            "flex-1 pb-6",
                            isLast && "pb-0"
                          )}
                        >
                          <div className="flex items-baseline gap-3 mb-1">
                            <span
                              className={clsx(
                                "text-sm font-semibold",
                                isLast ? "text-primary-700" : "text-slate-700"
                              )}
                            >
                              {item.action}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDateTime(item.time)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mb-1.5">
                            操作人：{item.operator}
                          </div>
                          {item.note && (
                            <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600 border border-slate-100 inline-block max-w-full">
                              {item.note}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ticket.status === "processing" && showNoteInput && (
                <div className="mt-4 p-4 bg-warning-50 rounded-xl border border-warning-100">
                  <label className="input-label !mb-2">
                    开始维修备注（可选）
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="请输入开始维修前的情况说明..."
                    rows={2}
                    className="input resize-none"
                  />
                </div>
              )}

              {ticket.status === "maintenance" && (
                <div className="mt-4 p-4 bg-success-50 rounded-xl border border-success-100">
                  <label className="input-label !mb-2">
                    维修完成说明
                    <span className="text-slate-400 font-normal ml-1 text-xs">
                      （请填写维修方案和结果）
                    </span>
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="请详细描述维修处理过程、更换的配件、测试结果等..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-gradient-to-br from-primary-50/80 to-primary-100/40 rounded-xl p-5 border border-primary-100">
              <h3 className="section-title mb-4 flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-primary-500" />
                充电桩信息
              </h3>
              {station ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">编号</div>
                    <div className="font-semibold text-slate-800">
                      {station.code}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        楼栋
                      </div>
                      <div className="text-sm font-medium text-slate-700">
                        {station.building}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">功率</div>
                      <div className="text-sm font-medium text-slate-700">
                        {station.power}kW
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">位置</div>
                    <div className="text-sm text-slate-700">
                      {station.location}
                    </div>
                  </div>
                  <Link
                    to={`/stations/${station.id}`}
                    className="btn-ghost w-full !text-xs mt-1 border border-primary-200 hover:border-primary-300 hover:bg-primary-100/50"
                  >
                    查看桩位详情
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  充电桩信息已被删除
                </div>
              )}
            </div>

            <div className="card !p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="section-title flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-primary-500" />
                  报修人信息
                </h3>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {ticket.reporterName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ticket.reporterBuilding}
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${ticket.reporterPhone}`}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 p-2.5 rounded-lg bg-primary-50/60 border border-primary-100/70"
                >
                  <Phone className="w-4 h-4" />
                  {ticket.reporterPhone}
                  <span className="ml-auto text-xs opacity-70">拨打电话</span>
                </a>
              </div>
            </div>

            {ticket.assignee && (
              <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <h3 className="section-title flex items-center gap-2 text-base">
                    <Wrench className="w-4 h-4 text-warning-500" />
                    处理人信息
                  </h3>
                </div>
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-warning-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {ticket.assignee}
                      </div>
                      <div className="text-xs text-slate-500">
                        指派时间：
                        {ticket.assignedAt
                          ? formatDateTime(ticket.assignedAt)
                          : "-"}
                      </div>
                    </div>
                  </div>
                  {ticket.completedAt && (
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 p-2.5 rounded-lg bg-success-50 border border-success-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                      完成时间：{formatDateTime(ticket.completedAt)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {ticket.resolution && ticket.status === "completed" && (
              <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-success-50/70">
                  <h3 className="section-title flex items-center gap-2 text-base">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    处理结果
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-100">
                    {ticket.resolution}
                  </p>
                </div>
              </div>
            )}

            {maintenanceRecords.length > 0 && (
              <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <h3 className="section-title flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-primary-500" />
                    维修记录
                  </h3>
                  <span className="text-xs text-slate-400">
                    共{maintenanceRecords.length}条
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {maintenanceRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {record.faultCategory}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(record.completedAt)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {record.faultReason}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          <Wrench className="w-3 h-3 inline mr-1" />
                          {record.technician}
                        </span>
                        <span className="font-medium text-primary-600">
                          ¥{record.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {maintenanceRecords.length > 3 && (
                  <div className="p-3 border-t border-slate-100 text-center">
                    <Link
                      to="/maintenance/history"
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                    >
                      查看全部历史记录
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              受理派单
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              请选择维修人员处理此工单
            </p>
            <div className="space-y-4">
              <div>
                <label className="input-label">维修人员</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="input"
                >
                  <option value="">请选择维修人员</option>
                  {mockTechnicians.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">派单备注（可选）</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="请输入派单说明或特殊要求..."
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTechnician("");
                  setNote("");
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTechnician}
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
                确认派单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
