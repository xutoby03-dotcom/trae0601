import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Building2,
  MapPin,
  Plug,
  Gauge,
  CalendarDays,
  CreditCard,
  Clock,
  ClipboardCheck,
  MessageSquareWarning,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { useInspectionStore } from "../../store/inspectionStore";
import { useRepairStore } from "../../store/repairStore";
import { StationStatusBadge, RepairStatusBadge } from "../../components/ui/StatusBadge";
import {
  INSPECTION_ITEM_LABELS,
  REPAIR_ISSUE_LABELS,
  STATION_STATUS_LABELS,
} from "../../types";
import type { StationStatus, ItemStatus } from "../../types";
import { formatDate, formatDateTime, formatRelative, formatMoney } from "../../utils/formatters";
import { clsx } from "clsx";

const itemStatusConfig: Record<ItemStatus, { className: string; icon: typeof CheckCircle2; label: string }> = {
  normal: { className: "text-success-500 bg-success-50", icon: CheckCircle2, label: "正常" },
  abnormal: { className: "text-danger-500 bg-danger-50", icon: XCircle, label: "异常" },
  skipped: { className: "text-slate-400 bg-slate-50", icon: AlertCircle, label: "跳过" },
};

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const stations = useStationStore((s: any) => s.stations);
  const deleteStation = useStationStore((s) => s.deleteStation);
  const updateStationStatus = useStationStore((s) => s.updateStationStatus);

  const records = useInspectionStore((s: any) => s.records);
  const tickets = useRepairStore((s: any) => s.tickets);
  const maintenances = useRepairStore((s: any) => s.maintenanceRecords);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const { station, inspectionRecords, repairTickets, maintenanceRecords } = useMemo(() => {
    const foundStation = id ? stations.find((s: any) => s.id === id) : undefined;
    const inspRecords = id ? records.filter((r: any) => r.stationId === id) : [];
    const repTickets = id ? tickets.filter((t: any) => t.stationId === id) : [];
    const maintRecords = id ? maintenances.filter((m: any) => m.stationId === id) : [];
    inspRecords.sort((a: any, b: any) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime());
    maintRecords.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return { station: foundStation, inspectionRecords: inspRecords, repairTickets: repTickets, maintenanceRecords: maintRecords };
  }, [id, stations, records, tickets, maintenances]);

  const statusStats = useMemo(() => {
    const total = inspectionRecords.length;
    const abnormal = inspectionRecords.filter((r) => r.hasAbnormal).length;
    return { total, abnormal, normal: total - abnormal };
  }, [inspectionRecords]);

  const repairStats = useMemo(() => {
    const total = repairTickets.length;
    const open = repairTickets.filter(
      (t) => t.status === "pending" || t.status === "processing" || t.status === "maintenance"
    ).length;
    const completed = repairTickets.filter((t) => t.status === "completed").length;
    return { total, open, completed };
  }, [repairTickets]);

  if (!station) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate("/stations")} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>
        <div className="card p-16 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-danger-400 mb-3" />
          <div className="text-slate-700 font-medium mb-1">桩位不存在</div>
          <div className="text-sm text-slate-400 mb-4">该桩位可能已被删除或编号错误</div>
          <Link to="/stations" className="btn-primary">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (id) {
      deleteStation(id);
      navigate("/stations");
    }
  };

  const handleStatusChange = (status: StationStatus) => {
    if (id) {
      updateStationStatus(id, status);
      setShowStatusDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/stations")} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{station.code}</h1>
              <StationStatusBadge status={station.status} />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              充电桩设备档案详情
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatusDialog(true)}
            className="btn-secondary"
          >
            <Wrench className="w-4 h-4" />
            修改状态
          </button>
          <Link to={`/stations/edit/${station.id}`} className="btn-secondary">
            <Edit3 className="w-4 h-4" />
            编辑档案
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100 relative">
            <img
              src={station.photo}
              alt={station.code}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="p-5 space-y-4">
            <InfoRow
              icon={Building2}
              label="所属楼栋"
              value={station.building}
            />
            <InfoRow
              icon={MapPin}
              label="具体位置"
              value={station.location}
            />
            <InfoRow
              icon={Plug}
              label="插座数量"
              value={`${station.socketCount} 个`}
            />
            <InfoRow
              icon={Gauge}
              label="额定功率"
              value={`${station.power} kW`}
            />
            <InfoRow
              icon={CalendarDays}
              label="安装日期"
              value={formatDate(station.installDate)}
            />
            <InfoRow
              icon={CreditCard}
              label="收费规则"
              value={station.feeRule}
            />
            <InfoRow
              icon={Clock}
              label="上次巡检"
              value={station.lastInspectionAt ? formatRelative(station.lastInspectionAt) : "暂无记录"}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="巡检总次数"
              value={statusStats.total}
              icon={ClipboardCheck}
              color="primary"
            />
            <StatBox
              label="正常巡检"
              value={statusStats.normal}
              icon={CheckCircle2}
              color="success"
            />
            <StatBox
              label="异常巡检"
              value={statusStats.abnormal}
              icon={AlertTriangle}
              color="warning"
            />
            <StatBox
              label="报修工单"
              value={repairStats.total}
              icon={MessageSquareWarning}
              color="danger"
              extra={repairStats.open > 0 ? `${repairStats.open} 待处理` : undefined}
            />
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary-500" />
                历史巡检记录
              </h2>
              <Link
                to="/inspections/records"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
              >
                全部记录 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {inspectionRecords.length === 0 ? (
              <EmptyState icon={ClipboardCheck} text="暂无巡检记录" />
            ) : (
              <div className="space-y-3 -mx-2">
                {inspectionRecords.slice(0, 5).map((record) => {
                  const abnormalItems = (Object.keys(record.items) as Array<keyof typeof record.items>)
                    .filter((k) => record.items[k] === "abnormal");
                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-primary-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-800">
                              {record.inspector}
                            </span>
                            {record.hasAbnormal ? (
                              <span className="badge-danger">存在异常</span>
                            ) : (
                              <span className="badge-success">全部正常</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(record.inspectDate)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                        {(Object.keys(INSPECTION_ITEM_LABELS) as Array<keyof typeof INSPECTION_ITEM_LABELS>).map((item) => {
                          const status = record.items[item];
                          const config = itemStatusConfig[status];
                          const Icon = config.icon;
                          return (
                            <div
                              key={item}
                              className={clsx(
                                "p-2 rounded-lg text-center",
                                config.className
                              )}
                              title={`${INSPECTION_ITEM_LABELS[item]}: ${config.label}`}
                            >
                              <Icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
                              <div className="text-[10px] font-medium truncate">
                                {INSPECTION_ITEM_LABELS[item]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {abnormalItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60">
                          <div className="text-xs font-medium text-danger-600 mb-1.5">
                            异常项：
                          </div>
                          <div className="text-xs text-slate-600">
                            {abnormalItems.map((k) => INSPECTION_ITEM_LABELS[k]).join("、")}
                          </div>
                          {record.remarks && (
                            <div className="text-xs text-slate-500 mt-2">
                              备注：{record.remarks}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-danger-500" />
                历史报修记录
              </h2>
              <Link
                to="/repairs/tickets"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
              >
                全部工单 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {repairTickets.length === 0 ? (
              <EmptyState icon={MessageSquareWarning} text="暂无报修记录" />
            ) : (
              <div className="divide-y divide-slate-100 -mx-2">
                {repairTickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/repairs/tickets/${ticket.id}`}
                    className="px-2 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 rounded-lg transition-colors group"
                  >
                    <div
                      className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        ticket.status === "completed"
                          ? "bg-success-50 text-success-500"
                          : ticket.status === "pending"
                          ? "bg-danger-50 text-danger-500"
                          : "bg-warning-50 text-warning-500"
                      )}
                    >
                      <MessageSquareWarning className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800">
                          {REPAIR_ISSUE_LABELS[ticket.issueType]}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {ticket.ticketNo}
                        </span>
                        <RepairStatusBadge status={ticket.status} />
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1 mb-1">
                        {ticket.description}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>报修人：{ticket.reporterName}</span>
                        <span>{formatRelative(ticket.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {maintenanceRecords.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-warning-500" />
                  维修保养记录
                </h2>
              </div>
              <div className="space-y-3">
                {maintenanceRecords.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-50/50 border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800 mb-0.5">
                          {record.faultCategory}
                        </div>
                        <div className="text-xs text-slate-500">
                          维修人员：{record.technician} · {formatDate(record.completedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-warning-600 font-display">
                          {formatMoney(record.totalCost)}
                        </div>
                        <div className="text-[10px] text-slate-400">维修费用</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 bg-white/70 rounded-lg p-2.5 border border-slate-100">
                      <span className="text-slate-400">故障原因：</span>
                      {record.faultReason}
                    </div>
                    {record.partsReplaced.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {record.partsReplaced.map((p, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-warning-50 text-warning-600 border border-warning-100"
                          >
                            {p.name} ×{p.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal
          onClose={() => setShowDeleteConfirm(false)}
          title="确认删除桩位"
        >
          <div className="text-sm text-slate-600 space-y-3">
            <p>
              确定要删除桩位 <span className="font-semibold text-danger-600">{station.code}</span> 吗？
            </p>
            <p className="text-slate-500 text-xs">
              删除后无法恢复，相关巡检和报修记录将保留但无法关联到该桩位。
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleDelete} className="btn-danger">
              确认删除
            </button>
          </div>
        </Modal>
      )}

      {showStatusDialog && (
        <Modal
          onClose={() => setShowStatusDialog(false)}
          title="修改设备状态"
        >
          <div className="text-sm text-slate-600 mb-4">
            当前状态：
            <StationStatusBadge status={station.status} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(STATION_STATUS_LABELS) as StationStatus[]).map((s) => {
              const isActive = station.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={clsx(
                    "p-3 rounded-xl border text-left transition-all",
                    isActive
                      ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100"
                      : "border-slate-200 hover:border-primary-200 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <StationStatusBadge status={s} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={() => setShowStatusDialog(false)}
              className="btn-secondary"
            >
              关闭
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-slate-800 break-words">{value}</div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  extra,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardCheck;
  color: "primary" | "success" | "warning" | "danger";
  extra?: string;
}) {
  const colorMap = {
    primary: "bg-primary-50 text-primary-500",
    success: "bg-success-50 text-success-500",
    warning: "bg-warning-50 text-warning-500",
    danger: "bg-danger-50 text-danger-500",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            colorMap[color]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold font-display text-slate-900">
            {value}
          </div>
          <div className="text-xs text-slate-500">
            {label}
            {extra && (
              <span className="ml-1 text-danger-500 font-medium">({extra})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: typeof ClipboardCheck;
  text: string;
}) {
  return (
    <div className="py-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-300" />
      </div>
      <div className="text-sm text-slate-400">{text}</div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
