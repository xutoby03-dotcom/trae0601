import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Wrench,
  Plus,
  MapPin,
  Building2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { formatRelative } from "../../utils/formatters";
import { clsx } from "clsx";

export default function Faults() {
  const stations = useStationStore((s: any) => s.stations);
  const faultStations = useMemo(() =>
    stations.filter((st: any) => st.status === "fault" || st.status === "maintenance"),
    [stations]
  );
  const tickets = useRepairStore((s) => s.tickets);

  const stationsWithTickets = faultStations.map((station) => {
    const relatedTickets = tickets.filter((t) => t.stationId === station.id);
    const latestTicket = relatedTickets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return {
      station,
      ticketCount: relatedTickets.length,
      latestTicket,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-danger-500" />
            故障桩列表
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            当前共有 <span className="font-semibold text-danger-600">{faultStations.length}</span> 台故障/维修中充电桩，已暂停预约功能
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/maintenance/history" className="btn-secondary">
            <Clock className="w-4 h-4" />
            维修历史
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-danger-100 bg-gradient-to-br from-danger-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-danger-100 flex items-center justify-center animate-fault-glow">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">故障中</div>
              <div className="text-2xl font-bold text-danger-600 font-display">
                {faultStations.filter((s) => s.status === "fault").length}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-5 border-warning-100 bg-gradient-to-br from-warning-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-warning-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">维修中</div>
              <div className="text-2xl font-bold text-warning-600 font-display">
                {faultStations.filter((s) => s.status === "maintenance").length}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-5 border-primary-100 bg-gradient-to-br from-primary-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">覆盖楼栋</div>
              <div className="text-2xl font-bold text-primary-600 font-display">
                {new Set(faultStations.map((s) => s.building)).size}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse-soft" />
            需维修充电桩
          </h2>
          <div className="text-xs text-slate-500">
            共 {stationsWithTickets.length} 条记录
          </div>
        </div>

        {stationsWithTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div>暂无故障充电桩</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stationsWithTickets.map(({ station, ticketCount, latestTicket }) => (
              <div
                key={station.id}
                className={clsx(
                  "p-5 hover:bg-slate-50/60 transition-colors group",
                  station.status === "fault" && "bg-danger-50/20"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      station.status === "fault"
                        ? "bg-danger-100 animate-fault-glow"
                        : "bg-warning-100"
                    )}
                  >
                    <AlertTriangle
                      className={clsx(
                        "w-6 h-6",
                        station.status === "fault"
                          ? "text-danger-600"
                          : "text-warning-600"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">
                        {station.code}
                      </h3>
                      <StationStatusBadge status={station.status} />
                      {ticketCount > 0 && (
                        <span className="badge-danger !py-0">
                          {ticketCount} 条报修
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {station.building} · {station.location}
                      </span>
                      <span>
                        {station.socketCount} 个插座 · {station.power}kW
                      </span>
                      {latestTicket && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          最近报修 {formatRelative(latestTicket.createdAt)}
                        </span>
                      )}
                    </div>

                    {latestTicket && (
                      <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <span className="text-slate-400 text-xs mr-2">最新问题：</span>
                        {latestTicket.description}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/maintenance/record?stationId=${station.id}${latestTicket ? `&ticketId=${latestTicket.id}` : ""}`}
                      className="btn-primary !px-5"
                    >
                      <Plus className="w-4 h-4" />
                      创建维修记录
                    </Link>
                    <Link
                      to={`/maintenance/history?stationId=${station.id}`}
                      className="btn-ghost !py-1.5 text-xs"
                    >
                      历史记录 <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
