import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Search,
  Filter,
  Plus,
  Building2,
  Plug,
  Gauge,
  ChevronRight,
  X,
} from "lucide-react";
import { useStationStore } from "../../store/stationStore";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { STATION_STATUS_LABELS } from "../../types";
import type { StationStatus } from "../../types";
import { clsx } from "clsx";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];
const POWER_OPTIONS = [
  { label: "全部功率", value: "all" },
  { label: "3.5kW（慢充）", value: "3.5" },
  { label: "7kW（快充）", value: "7" },
];

export default function StationList() {
  const { stations } = useStationStore();

  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StationStatus | "all">("all");
  const [powerFilter, setPowerFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (buildingFilter !== "all" && s.building !== buildingFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (powerFilter !== "all" && String(s.power) !== powerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !s.code.toLowerCase().includes(q) &&
          !s.building.toLowerCase().includes(q) &&
          !s.location.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [stations, buildingFilter, statusFilter, powerFilter, searchQuery]);

  const hasActiveFilters =
    buildingFilter !== "all" ||
    statusFilter !== "all" ||
    powerFilter !== "all" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setBuildingFilter("all");
    setStatusFilter("all");
    setPowerFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">桩位档案</h1>
          <p className="text-slate-500 text-sm mt-1">
            管理小区全部充电桩设备信息，共 {stations.length} 个桩位
          </p>
        </div>
        <Link to="/stations/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          新增桩位
        </Link>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">筛选条件</span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-slate-500 hover:text-danger-500 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              清空筛选
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="input-label">关键词搜索</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="输入桩编号、楼栋或位置..."
                className="input pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="input-label">所属楼栋</label>
            <select
              className="input"
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="all">全部楼栋</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">设备状态</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StationStatus | "all")}
            >
              <option value="all">全部状态</option>
              {(Object.keys(STATION_STATUS_LABELS) as StationStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">功率类型</label>
            <select
              className="input"
              value={powerFilter}
              onChange={(e) => setPowerFilter(e.target.value)}
            >
              {POWER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          共找到 <span className="font-semibold text-slate-800">{filteredStations.length}</span> 个桩位
        </div>
      </div>

      {filteredStations.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-slate-300" />
          </div>
          <div className="text-slate-600 font-medium mb-1">未找到匹配的桩位</div>
          <div className="text-sm text-slate-400 mb-4">
            试试调整筛选条件或清空筛选
          </div>
          <button onClick={resetFilters} className="btn-secondary">
            重置筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStations.map((station) => (
            <Link
              key={station.id}
              to={`/stations/${station.id}`}
              className={clsx(
                "card card-hover overflow-hidden group flex flex-col",
                station.status === "fault" && "ring-1 ring-danger-200"
              )}
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={station.photo}
                  alt={station.code}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <StationStatusBadge status={station.status} />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <div className="text-white font-display text-lg font-bold tracking-tight drop-shadow-sm">
                      {station.code}
                    </div>
                    <div className="text-white/80 text-xs flex items-center gap-1 drop-shadow-sm">
                      <Building2 className="w-3 h-3" />
                      {station.building}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all drop-shadow-sm" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <Plug className="w-4 h-4 text-primary-500 mx-auto mb-1" />
                    <div className="text-[11px] text-slate-500">插座数</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {station.socketCount}
                    </div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <Gauge className="w-4 h-4 text-warning-500 mx-auto mb-1" />
                    <div className="text-[11px] text-slate-500">功率</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {station.power}kW
                    </div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-slate-50">
                    <Zap className="w-4 h-4 text-success-500 mx-auto mb-1" />
                    <div className="text-[11px] text-slate-500">费用</div>
                    <div className="text-sm font-semibold text-slate-800">
                      ¥{station.feePerHour}
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[70%]" title={station.location}>
                    {station.location}
                  </span>
                  <span className="text-primary-500 font-medium group-hover:underline">
                    查看详情
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
