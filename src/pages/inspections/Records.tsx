import { useState, useMemo } from "react";
import {
  History,
  Filter,
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  FileText,
  XCircle,
  Clock,
} from "lucide-react";
import { useInspectionStore } from "../../store/inspectionStore";
import { useStationStore } from "../../store/stationStore";
import {
  INSPECTION_ITEM_LABELS,
  type InspectionItem,
  type ItemStatus,
} from "../../types";
import { formatDate, formatDateTime, formatRelative } from "../../utils/formatters";
import { clsx } from "clsx";

const INSPECTION_ITEMS: InspectionItem[] = [
  "screen",
  "socket",
  "leakage",
  "cable",
  "qrcode",
  "fireSpace",
  "clutter",
];

const ITEM_STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; className: string; dotClass: string; icon: typeof CheckCircle2 }
> = {
  normal: {
    label: "正常",
    className: "text-success-700 bg-success-50",
    dotClass: "bg-success-500",
    icon: CheckCircle2,
  },
  abnormal: {
    label: "异常",
    className: "text-danger-700 bg-danger-50",
    dotClass: "bg-danger-500",
    icon: XCircle,
  },
  skipped: {
    label: "跳过",
    className: "text-slate-600 bg-slate-100",
    dotClass: "bg-slate-400",
    icon: MinusCircle,
  },
};

type AbnormalFilter = "all" | "abnormal" | "normal";

export default function InspectionRecords() {
  const records = useInspectionStore((s) => s.records);
  const stations = useStationStore((s) => s.stations);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [inspectorFilter, setInspectorFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [abnormalFilter, setAbnormalFilter] = useState<AbnormalFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const inspectors = useMemo(() => {
    const set = new Set(records.map((r) => r.inspector));
    return Array.from(set);
  }, [records]);

  const buildings = useMemo(() => {
    const set = new Set(stations.map((s) => s.building));
    return Array.from(set).sort();
  }, [stations]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (abnormalFilter === "abnormal" && !record.hasAbnormal) return false;
      if (abnormalFilter === "normal" && record.hasAbnormal) return false;
      if (inspectorFilter !== "all" && record.inspector !== inspectorFilter)
        return false;

      const station = useStationStore.getState().getStationById(record.stationId);
      if (buildingFilter !== "all") {
        if (!station || station.building !== buildingFilter) return false;
      }

      if (search) {
        const lower = search.toLowerCase();
        const matchStation = station
          ? station.code.toLowerCase().includes(lower) ||
            station.location.toLowerCase().includes(lower)
          : false;
        const matchInspector = record.inspector.toLowerCase().includes(lower);
        const matchRemarks = record.remarks.toLowerCase().includes(lower);
        if (!matchStation && !matchInspector && !matchRemarks) return false;
      }

      const recordDate = new Date(record.inspectDate);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (recordDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (recordDate > to) return false;
      }

      return true;
    });
  }, [
    records,
    abnormalFilter,
    inspectorFilter,
    buildingFilter,
    search,
    dateFrom,
    dateTo,
  ]);

  const stats = useMemo(() => {
    const abnormal = records.filter((r) => r.hasAbnormal).length;
    return {
      total: records.length,
      abnormal,
      normal: records.length - abnormal,
      abnormalRate: records.length > 0 ? abnormal / records.length : 0,
    };
  }, [records]);

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setInspectorFilter("all");
    setBuildingFilter("all");
    setAbnormalFilter("all");
    setExpandedId(null);
  };

  const getAbnormalItems = (items: Record<InspectionItem, ItemStatus>) => {
    return (Object.keys(items) as InspectionItem[]).filter(
      (k) => items[k] === "abnormal"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">巡检记录</h1>
          <p className="text-slate-500 text-sm mt-1">
            查看历史巡检记录及异常详情
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.total}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">总巡检次数</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-danger-50 text-danger-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-danger-600">
                {stats.abnormal}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">异常记录</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success-50 text-success-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.normal}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">正常记录</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-warning-50 text-warning-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {(stats.abnormalRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">异常率</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="input-label">搜索</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="桩位编号/位置/巡检员/备注"
                className="input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="input-label">开始日期</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">结束日期</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">巡检员</label>
            <select
              className="input"
              value={inspectorFilter}
              onChange={(e) => setInspectorFilter(e.target.value)}
            >
              <option value="all">全部巡检员</option>
              {inspectors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">楼栋</label>
            <select
              className="input"
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="all">全部楼栋</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">异常筛选：</span>
            <button
              onClick={() => setAbnormalFilter("all")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                abnormalFilter === "all"
                  ? "bg-primary-100 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              全部
            </button>
            <button
              onClick={() => setAbnormalFilter("normal")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                abnormalFilter === "normal"
                  ? "bg-success-100 text-success-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              仅正常
            </button>
            <button
              onClick={() => setAbnormalFilter("abnormal")}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                abnormalFilter === "abnormal"
                  ? "bg-danger-100 text-danger-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              仅异常
            </button>
          </div>
          <button onClick={resetFilters} className="btn-ghost text-sm">
            重置筛选
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="card p-16 text-center">
            <History className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <div className="text-sm font-medium text-slate-600 mb-1">
              暂无巡检记录
            </div>
            <div className="text-xs text-slate-400">
              调整筛选条件或执行新的巡检任务
            </div>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const station = useStationStore.getState().getStationById(record.stationId);
            const isExpanded = expandedId === record.id;
            const abnormalItems = getAbnormalItems(record.items);

            return (
              <div
                key={record.id}
                className={clsx(
                  "card overflow-hidden transition-all",
                  record.hasAbnormal && "border-danger-200"
                )}
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : record.id)
                  }
                  className={clsx(
                    "w-full p-5 text-left hover:bg-slate-50/60 transition-colors",
                    record.hasAbnormal && "bg-danger-50/30 hover:bg-danger-50/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={clsx(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                          record.hasAbnormal
                            ? "bg-danger-100 text-danger-500"
                            : "bg-success-100 text-success-500"
                        )}
                      >
                        {record.hasAbnormal ? (
                          <AlertTriangle className="w-5.5 h-5.5" />
                        ) : (
                          <CheckCircle2 className="w-5.5 h-5.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">
                            {station?.code || "未知桩位"}
                          </span>
                          {record.hasAbnormal && (
                            <span className="badge-danger !py-0">
                              <AlertTriangle className="w-3 h-3" />
                              存在异常
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {station?.building || "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {station?.location.split(" ").pop() || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6 flex-1">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                            <User className="w-3 h-3" />
                            巡检员
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {record.inspector}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                            <Calendar className="w-3 h-3" />
                            巡检时间
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {formatDateTime(record.inspectDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-0.5">
                            7项检查结果
                          </div>
                          <div className="flex items-center gap-1">
                            {INSPECTION_ITEMS.map((item) => {
                              const status = record.items[item];
                              const config = ITEM_STATUS_CONFIG[status];
                              return (
                                <div
                                  key={item}
                                  title={`${INSPECTION_ITEM_LABELS[item]}: ${config.label}`}
                                  className={clsx(
                                    "w-5 h-5 rounded flex items-center justify-center",
                                    config.className
                                  )}
                                >
                                  <div
                                    className={clsx(
                                      "w-2 h-2 rounded-full",
                                      config.dotClass
                                    )}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:block text-right">
                        <div className="text-xs text-slate-500">
                          {formatRelative(record.inspectDate)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-500" />
                          逐项检查详情
                        </h3>
                        <div className="space-y-2">
                          {INSPECTION_ITEMS.map((item) => {
                            const status = record.items[item];
                            const config = ITEM_STATUS_CONFIG[status];
                            const Icon = config.icon;
                            const photos = record.abnormalPhotos[item] || [];
                            const isAbnormal = status === "abnormal";

                            return (
                              <div
                                key={item}
                                className={clsx(
                                  "p-3 rounded-lg border transition-colors",
                                  isAbnormal
                                    ? "bg-danger-50 border-danger-200"
                                    : "bg-slate-50/50 border-slate-100"
                                )}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={clsx(
                                        "w-6 h-6 rounded flex items-center justify-center shrink-0",
                                        config.className
                                      )}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </span>
                                    <span
                                      className={clsx(
                                        "text-sm font-medium",
                                        isAbnormal
                                          ? "text-danger-700"
                                          : "text-slate-700"
                                      )}
                                    >
                                      {INSPECTION_ITEM_LABELS[item]}
                                    </span>
                                  </div>
                                  <span
                                    className={clsx(
                                      "text-xs px-2 py-0.5 rounded-full font-medium",
                                      config.className
                                    )}
                                  >
                                    {config.label}
                                  </span>
                                </div>
                                {isAbnormal && photos.length > 0 && (
                                  <div className="flex gap-2 mt-2 pl-8">
                                    {photos.map((photo, pIdx) => (
                                      <div
                                        key={pIdx}
                                        className="w-16 h-16 rounded-lg overflow-hidden border border-danger-200"
                                      >
                                        <img
                                          src={photo}
                                          alt={`异常照片 ${pIdx + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-500" />
                            巡检信息
                          </h3>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">记录编号</span>
                              <span className="font-mono text-slate-700">
                                {record.id}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">关联任务</span>
                              <span className="text-slate-700 font-medium">
                                {record.taskId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">巡检员ID</span>
                              <span className="text-slate-700 font-mono">
                                {record.inspectorId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">巡检时间</span>
                              <span className="text-slate-700 font-medium">
                                {formatDateTime(record.inspectDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {abnormalItems.length > 0 && (
                          <div className="p-4 rounded-xl bg-danger-50/80 border border-danger-200">
                            <h3 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              异常项汇总
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {abnormalItems.map((item) => (
                                <span
                                  key={item}
                                  className="text-xs px-2.5 py-1 rounded-full bg-white text-danger-600 border border-danger-200 font-medium"
                                >
                                  {INSPECTION_ITEM_LABELS[item]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.remarks && (
                          <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100">
                            <h3 className="text-sm font-semibold text-primary-700 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              巡检备注
                            </h3>
                            <p className="text-sm text-primary-800/80 leading-relaxed">
                              {record.remarks}
                            </p>
                          </div>
                        )}

                        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100">
                          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            检查项统计
                          </h3>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 rounded-lg bg-success-50">
                              <div className="text-xl font-bold text-success-600 font-display">
                                {
                                  Object.values(record.items).filter(
                                    (v) => v === "normal"
                                  ).length
                                }
                              </div>
                              <div className="text-[11px] text-success-600/80 mt-0.5">
                                正常
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-danger-50">
                              <div className="text-xl font-bold text-danger-600 font-display">
                                {
                                  Object.values(record.items).filter(
                                    (v) => v === "abnormal"
                                  ).length
                                }
                              </div>
                              <div className="text-[11px] text-danger-600/80 mt-0.5">
                                异常
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-slate-100">
                              <div className="text-xl font-bold text-slate-600 font-display">
                                {
                                  Object.values(record.items).filter(
                                    (v) => v === "skipped"
                                  ).length
                                }
                              </div>
                              <div className="text-[11px] text-slate-600/80 mt-0.5">
                                跳过
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
