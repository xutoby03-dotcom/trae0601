import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Wrench,
  Plus,
  MapPin,
  Building2,
  Clock,
  ChevronRight,
  MessageSquareWarning,
  ClipboardCheck,
  XCircle,
  Ticket,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { formatRelative } from "../../utils/formatters";
import { clsx } from "clsx";

type FaultSource = "all" | "repair" | "inspection";

export default function Faults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sourceParam = (searchParams.get("source") as FaultSource) || "all";

  const stations = useStationStore((s: any) => s.stations);
  const tickets = useRepairStore((s) => s.tickets);
  const records = useInspectionStore((s: any) => s.records);

  const { filteredStations, sourceCounts } = useMemo(() => {
    const abnormalRecords = records.filter((r: any) => r.hasAbnormal);
    const stationIdsFromInspection = new Set(
      abnormalRecords.map((r: any) => r.stationId)
    );
    const openTickets = tickets.filter(
      (t) => t.status === "pending" || t.status === "processing" || t.status === "maintenance"
    );
    const stationIdsFromRepair = new Set(openTickets.map((t) => t.stationId));

    const faultStations = stations.filter(
      (st: any) => st.status === "fault" || st.status === "maintenance"
    );

    const fromRepair = faultStations.filter((s) => stationIdsFromRepair.has(s.id));
    const fromInspection = faultStations.filter(
      (s) => !stationIdsFromRepair.has(s.id) && stationIdsFromInspection.has(s.id)
    );
    const other = faultStations.filter(
      (s) => !stationIdsFromRepair.has(s.id) && !stationIdsFromInspection.has(s.id)
    );

    let filtered = faultStations;
    if (sourceParam === "repair") filtered = fromRepair;
    else if (sourceParam === "inspection") filtered = fromInspection;

    return {
      filteredStations: filtered,
      sourceCounts: {
        all: faultStations.length,
        repair: fromRepair.length,
        inspection: fromInspection.length,
        other: other.length,
      },
    };
  }, [stations, tickets, records, sourceParam]);

  const stationsWithDetails = useMemo(() => {
    const openTickets = tickets.filter(
      (t) => t.status === "pending" || t.status === "processing" || t.status === "maintenance"
    );
    const abnormalRecords = records.filter((r: any) => r.hasAbnormal);

    return filteredStations.map((station: any) => {
      const relatedTickets = tickets.filter((t) => t.stationId === station.id);
      const pendingTickets = openTickets.filter((t) => t.stationId === station.id);
      const latestTicket = relatedTickets.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      const latestAbnormal = abnormalRecords
        .filter((r: any) => r.stationId === station.id)
        .sort(
          (a: any, b: any) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
        )[0];

      const source: "repair" | "inspection" | "other" =
        pendingTickets.length > 0 ? "repair" : latestAbnormal ? "inspection" : "other";

      const latestIssue =
        source === "repair" && latestTicket
          ? latestTicket.description
          : source === "inspection" && latestAbnormal
          ? `巡检异常：${Object.entries(latestAbnormal.items)
              .filter(([, v]) => v === "abnormal")
              .map(([k]) => k)
              .join("、") || "多项异常"}`
          : "待确认问题";

      return {
        station,
        ticketCount: relatedTickets.length,
        pendingTicketCount: pendingTickets.length,
        latestTicket,
        latestAbnormal,
        source,
        latestIssue,
      };
    });
  }, [filteredStations, tickets, records]);

  const handleSourceChange = (source: FaultSource) => {
    setSearchParams(source === "all" ? {} : { source });
  };

  const sourceTabs: { key: FaultSource; label: string; icon: any; count: number }[] = [
    { key: "all", label: "全部故障", icon: AlertTriangle, count: sourceCounts.all },
    { key: "repair", label: "居民报修", icon: MessageSquareWarning, count: sourceCounts.repair },
    { key: "inspection", label: "巡检异常", icon: ClipboardCheck, count: sourceCounts.inspection },
  ];

  const sourceBadgeColor = {
    repair: "bg-danger-100 text-danger-700",
    inspection: "bg-warning-100 text-warning-700",
    other: "bg-slate-100 text-slate-700",
  };

  const sourceBadgeLabel = {
    repair: "报修来源",
    inspection: "巡检来源",
    other: "待确认",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-danger-500" />
            故障桩列表
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            当前共有 <span className="font-semibold text-danger-600">{sourceCounts.all}</span> 台故障/维修中充电桩，已暂停预约功能
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/maintenance/history" className="btn-secondary">
            <Clock className="w-4 h-4" />
            维修历史
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-100/60 p-1.5 rounded-xl w-fit">
        {sourceTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleSourceChange(tab.key)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              sourceParam === tab.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={clsx(
                "text-xs px-1.5 py-0.5 rounded-md font-medium",
                sourceParam === tab.key ? "bg-primary-100 text-primary-700" : "bg-slate-200 text-slate-600"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
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
                {filteredStations.filter((s) => s.status === "fault").length}
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
                {filteredStations.filter((s) => s.status === "maintenance").length}
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
                {new Set(filteredStations.map((s) => s.building)).size}
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
            共 {stationsWithDetails.length} 条记录
          </div>
        </div>

        {stationsWithDetails.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <XCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <div>暂无符合条件的故障充电桩</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stationsWithDetails.map(({ station, pendingTicketCount, source, latestIssue }) => (
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
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">
                        {station.code}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {station.building}
                      </span>
                      <StationStatusBadge status={station.status} />
                      <span
                        className={clsx(
                          "text-[10px] px-2 py-0.5 rounded-md font-medium",
                          sourceBadgeColor[source]
                        )}
                      >
                        {sourceBadgeLabel[source]}
                      </span>
                      {pendingTicketCount > 0 && (
                        <span className="badge-danger !py-0 flex items-center gap-1">
                          <Ticket className="w-3 h-3" />
                          {pendingTicketCount} 单待处理
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                      <span>
                        {station.location}
                      </span>
                      <span>
                        {station.socketCount} 个插座 · {station.power}kW
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <span className="text-slate-400 text-xs mr-2">最近问题：</span>
                      {latestIssue}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      to={`/maintenance/record?stationId=${station.id}`}
                      className="btn-primary !px-5"
                    >
                      <Plus className="w-4 h-4" />
                      创建维修记录
                    </Link>
                    <Link
                      to={`/stations/${station.id}`}
                      className="btn-ghost !py-1.5 text-xs"
                    >
                      桩位详情 <ChevronRight className="w-3.5 h-3.5" />
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
