import {
  Bell,
  Search,
  Menu,
  User,
  ChevronDown,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import { formatRelative } from "../../utils/formatters";
import type { AlertItem, RepairTicket, InspectionRecord, ChargingStation } from "../../types";
import { useStationStore } from "../../store/stationStore";
import { Link } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
  breadcrumbs: { label: string; to?: string }[];
}

export default function Header({ onToggleSidebar, breadcrumbs }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tickets = useRepairStore<RepairTicket[]>((s: any) => s.tickets);
  const records = useInspectionStore<InspectionRecord[]>((s: any) => s.records);
  const stations = useStationStore<ChargingStation[]>((s: any) => s.stations);

  const { pendingCount, openTickets, abnormalRecords, faultStations, abnormalCount, faultCount } =
    useMemo(() => {
      const openT = tickets.filter(
        (t) =>
          t.status === "pending" ||
          t.status === "processing" ||
          t.status === "maintenance"
      );
      const abnormalR = records
        .filter((r) => r.hasAbnormal)
        .sort(
          (a, b) =>
            new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
        );
      const faultS = stations.filter(
        (st) => st.status === "fault" || st.status === "maintenance"
      );
      return {
        pendingCount: tickets.filter((t) => t.status === "pending").length,
        openTickets: openT.slice(0, 4),
        abnormalRecords: abnormalR.slice(0, 3),
        faultStations: faultS.slice(0, 2),
        abnormalCount: abnormalR.length,
        faultCount: faultS.length,
      };
    }, [tickets, records, stations]);

  const alerts = useMemo<AlertItem[]>(() => {
    const result: AlertItem[] = [
      ...openTickets.slice(0, 3).map<AlertItem>((t) => ({
        id: `ticket_${t.id}`,
        type: "repair_ticket",
        title: `新报修工单：${t.ticketNo}`,
        description: t.description.substring(0, 30) + "...",
        stationId: t.stationId,
        timestamp: t.createdAt,
        priority: t.issueType === "plug_hot" ? "high" : "medium",
        read: false,
      })),
      ...abnormalRecords.slice(0, 3).map<AlertItem>((r) => ({
        id: `insp_${r.id}`,
        type: "inspection_abnormal",
        title: `巡检发现异常：${r.inspector}`,
        description: "存在异常检查项，需及时处理",
        stationId: r.stationId,
        timestamp: r.inspectDate,
        priority: "medium",
        read: false,
      })),
      ...faultStations.slice(0, 2).map<AlertItem>((s) => ({
        id: `station_${s.id}`,
        type: "maintenance",
        title: `设备故障：${s.code}`,
        description: `${s.building} 充电桩暂停预约`,
        stationId: s.id,
        timestamp: new Date().toISOString(),
        priority: "high",
        read: false,
      })),
    ];
    return result.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [openTickets, abnormalRecords, faultStations]);

  const unreadCount = pendingCount + Math.min(abnormalCount, 3) + Math.min(faultCount, 2);

  const priorityStyles = {
    high: "bg-danger-50 text-danger-600 border-danger-200",
    medium: "bg-warning-50 text-warning-600 border-warning-200",
    low: "bg-primary-50 text-primary-600 border-primary-200",
  };

  const AlertIcon = ({ type }: { type: AlertItem["type"] }) => {
    if (type === "repair_ticket")
      return <Wrench className="w-4 h-4 text-danger-500" />;
    if (type === "inspection_abnormal")
      return <ClipboardCheck className="w-4 h-4 text-warning-500" />;
    return <AlertTriangle className="w-4 h-4 text-danger-500" />;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/70 flex items-center px-6 sticky top-0 z-40">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 mr-3 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <nav className="flex items-center text-sm text-slate-500 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center min-w-0">
            {i > 0 && <span className="mx-2 text-slate-300">/</span>}
            {crumb.to && i < breadcrumbs.length - 1 ? (
              <Link
                to={crumb.to}
                className="hover:text-primary-500 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={`truncate ${
                  i === breadcrumbs.length - 1
                    ? "text-slate-900 font-medium"
                    : ""
                }`}
              >
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 mr-4 w-72 border border-slate-100 focus-within:border-primary-300 focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="搜索桩位编号、工单..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-400 text-slate-700"
        />
        <kbd className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          ⌘K
        </kbd>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications((v) => !v);
            setShowUserMenu(false);
          }}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">告警与通知</h3>
              <span className="text-xs text-primary-500 hover:text-primary-600 cursor-pointer">
                全部已读
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  暂无新通知
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${priorityStyles[alert.priority]}`}
                        >
                          <AlertIcon type={alert.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800">
                            {alert.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {alert.description}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1.5">
                            {formatRelative(alert.timestamp)}
                          </div>
                        </div>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              to="/repairs/tickets"
              className="block px-4 py-3 text-center text-sm text-primary-600 hover:bg-slate-50 border-t border-slate-100 transition-colors"
              onClick={() => setShowNotifications(false)}
            >
              查看全部告警 →
            </Link>
          </div>
        )}
      </div>

      <div className="relative ml-2">
        <button
          onClick={() => {
            setShowUserMenu((v) => !v);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-slate-800 leading-tight">
              物业管理员
            </div>
            <div className="text-xs text-slate-500">阳光小区物业</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-slide-up">
            <ul className="py-1.5 text-sm">
              <li className="px-4 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer">
                个人设置
              </li>
              <li className="px-4 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer">
                操作日志
              </li>
              <li className="px-4 py-2 text-slate-600 hover:bg-slate-50 cursor-pointer border-t border-slate-100 mt-1 pt-2 text-danger-600">
                退出登录
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
