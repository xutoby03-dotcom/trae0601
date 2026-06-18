import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Wrench,
  PlayCircle,
  CheckCircle2,
  Search,
  Plus,
  AlertCircle,
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

type TabFilter = "all" | "pending" | "processing" | "completed";

const tabs: { key: TabFilter; label: string; status: RepairStatus | "all" }[] = [
  { key: "all", label: "全部工单", status: "all" },
  { key: "pending", label: "待处理", status: "pending" },
  { key: "processing", label: "处理中", status: "processing" },
  { key: "completed", label: "已完成", status: "completed" },
];

const statusColorMap: Record<RepairStatus, string> = {
  pending: "bg-gradient-to-b from-danger-400 to-danger-500",
  processing: "bg-gradient-to-b from-warning-400 to-warning-500",
  maintenance: "bg-gradient-to-b from-primary-400 to-primary-500",
  completed: "bg-gradient-to-b from-success-400 to-success-500",
  cancelled: "bg-gradient-to-b from-slate-400 to-slate-500",
};

const mockTechnicians = ["张工", "李工", "王工", "赵工", "陈工"];

export default function Tickets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const tickets = useRepairStore((s) => s.tickets);
  const getTicketsByStatus = useRepairStore((s) => s.getTicketsByStatus);
  const assignTicket = useRepairStore((s) => s.assignTicket);
  const updateTicketStatus = useRepairStore((s) => s.updateTicketStatus);
  const stations = useStationStore((s) => s.stations);

  const filteredTickets = useMemo(() => {
    const statusFilter = tabs.find((t) => t.key === activeTab)?.status || "all";
    let list = getTicketsByStatus(statusFilter);

    if (statusFilter === "processing") {
      list = tickets.filter(
        (t) => t.status === "processing" || t.status === "maintenance"
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => {
        const station = stations.find((s) => s.id === t.stationId);
        return (
          t.ticketNo.toLowerCase().includes(q) ||
          t.reporterName.toLowerCase().includes(q) ||
          t.reporterPhone.includes(q) ||
          t.description.toLowerCase().includes(q) ||
          REPAIR_ISSUE_LABELS[t.issueType].toLowerCase().includes(q) ||
          station?.code.toLowerCase().includes(q) ||
          station?.building.toLowerCase().includes(q)
        );
      });
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activeTab, searchQuery, tickets, getTicketsByStatus, stations]);

  const tabCounts = useMemo(() => {
    return {
      all: tickets.length,
      pending: tickets.filter((t) => t.status === "pending").length,
      processing: tickets.filter(
        (t) => t.status === "processing" || t.status === "maintenance"
      ).length,
      completed: tickets.filter((t) => t.status === "completed").length,
    };
  }, [tickets]);

  const handleAssign = (ticketId: string) => {
    if (!selectedTechnician) return;
    assignTicket(ticketId, selectedTechnician);
    setAssigningId(null);
    setSelectedTechnician("");
  };

  const handleStartProcessing = (ticketId: string) => {
    updateTicketStatus(ticketId, "maintenance", "维修人员已到达现场，开始维修作业");
  };

  const handleComplete = (ticketId: string, stationId: string) => {
    navigate(`/maintenance/record?stationId=${stationId}&ticketId=${ticketId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-primary-500" />
            报修工单
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            管理所有报修工单，跟踪处理进度
          </p>
        </div>
        <Link to="/repairs/submit" className="btn-primary">
          <Plus className="w-4 h-4" />
          新建报修
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工单号、报修人、充电桩、问题描述..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="mt-4 border-b border-slate-100 -mx-4">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    "relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-primary-600"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={clsx(
                      "ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold",
                      isActive
                        ? "bg-primary-100 text-primary-600"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-slate-500 mb-1">暂无工单数据</div>
          <div className="text-xs text-slate-400">
            {searchQuery ? "试试调整搜索关键词" : "点击右上角创建新的报修工单"}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const station = stations.find((s) => s.id === ticket.stationId);
            const colorBar = statusColorMap[ticket.status];
            const isAssigning = assigningId === ticket.id;

            return (
              <div
                key={ticket.id}
                className="card card-hover overflow-hidden group"
              >
                <div className="flex">
                  <div className={clsx("w-1.5 shrink-0", colorBar)} />

                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-sm font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md shrink-0">
                          {ticket.ticketNo}
                        </span>
                        <span className="badge-primary !py-0.5">
                          {REPAIR_ISSUE_LABELS[ticket.issueType]}
                        </span>
                        <RepairStatusBadge status={ticket.status} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelative(ticket.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 mb-3 line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {station?.building} · {station?.code}
                              {station?.location && ` (${station.location})`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {ticket.reporterName}
                              <span className="text-slate-400 ml-1">
                                {ticket.reporterPhone}
                              </span>
                            </span>
                          </div>
                          <div className="text-slate-400">
                            创建于 {formatDateTime(ticket.createdAt)}
                          </div>
                          {ticket.assignee && (
                            <div className="flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                处理人：
                                <span className="text-primary-600 font-medium">
                                  {ticket.assignee}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ticket.status === "pending" && !isAssigning && (
                          <button
                            onClick={() => setAssigningId(ticket.id)}
                            className="btn-primary !py-1.5 !px-3.5 !text-xs"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            派单
                          </button>
                        )}

                        {ticket.status === "pending" && isAssigning && (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedTechnician}
                              onChange={(e) => setSelectedTechnician(e.target.value)}
                              className="input !py-1.5 !px-2.5 !text-xs w-28"
                            >
                              <option value="">选择维修员</option>
                              {mockTechnicians.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(ticket.id)}
                              disabled={!selectedTechnician}
                              className="btn-success !py-1.5 !px-3.5 !text-xs"
                            >
                              确认派单
                            </button>
                            <button
                              onClick={() => {
                                setAssigningId(null);
                                setSelectedTechnician("");
                              }}
                              className="btn-ghost !py-1.5 !px-2.5 !text-xs"
                            >
                              取消
                            </button>
                          </div>
                        )}

                        {(ticket.status === "processing") && (
                          <button
                            onClick={() => handleStartProcessing(ticket.id)}
                            className="btn-primary !py-1.5 !px-3.5 !text-xs"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            开始维修
                          </button>
                        )}

                        {ticket.status === "maintenance" && (
                          <button
                            onClick={() => handleComplete(ticket.id, ticket.stationId)}
                            className="btn-success !py-1.5 !px-3.5 !text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            完成维修
                          </button>
                        )}

                        <Link
                          to={`/repairs/tickets/${ticket.id}`}
                          className="btn-secondary !py-1.5 !px-3.5 !text-xs group/btn"
                        >
                          详情
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>

                    {ticket.photos.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {ticket.photos.slice(0, 4).map((photo, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200"
                            >
                              <img
                                src={photo}
                                alt={`照片${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {ticket.photos.length > 4 && (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 border border-slate-200">
                              +{ticket.photos.length - 4}
                            </div>
                          )}
                          <span className="text-xs text-slate-400 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {ticket.photos.length}张现场照片
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
